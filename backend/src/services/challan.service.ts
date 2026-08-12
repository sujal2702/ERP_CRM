import prisma from '../config/db';
import { CreateChallanInput } from '../validators/challan.validator';
import { ChallanStatus, StockMovementType, Prisma } from '@prisma/client';

export class ChallanService {
  static async generateChallanNumber(): Promise<string> {
    const totalCount = await prisma.challan.count();
    let nextNum = totalCount + 1;
    let challanNumber = `CH-${nextNum.toString().padStart(5, '0')}`;

    // Verify uniqueness in case of deleted records
    let exists = await prisma.challan.findUnique({ where: { challanNumber } });
    while (exists) {
      nextNum++;
      challanNumber = `CH-${nextNum.toString().padStart(5, '0')}`;
      exists = await prisma.challan.findUnique({ where: { challanNumber } });
    }

    return challanNumber;
  }

  static async createChallan(data: CreateChallanInput, createdById: string) {
    const { customerId, items } = data;

    // 1. Verify Customer exists
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw { statusCode: 404, message: 'Selected customer does not exist' };
    }

    // 2. Consolidate duplicate products in request items
    const mergedItemsMap = new Map<string, number>();
    for (const item of items) {
      const current = mergedItemsMap.get(item.productId) || 0;
      mergedItemsMap.set(item.productId, current + item.quantity);
    }

    const consolidatedItems = Array.from(mergedItemsMap.entries()).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    // 3. Verify all products exist and fetch snapshot data
    const productIds = consolidatedItems.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw { statusCode: 404, message: 'One or more selected products do not exist' };
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // 4. Construct items array with snapshot data & calculate totalQuantity
    let totalQuantity = 0;
    const challanItemsData = consolidatedItems.map((item) => {
      const product = productMap.get(item.productId)!;
      totalQuantity += item.quantity;
      return {
        productId: product.id,
        productNameSnapshot: product.name,
        skuSnapshot: product.sku,
        unitPriceSnapshot: product.unitPrice,
        quantity: item.quantity,
      };
    });

    // 5. Generate unique challan number
    const challanNumber = await this.generateChallanNumber();

    // 6. Create Challan in DRAFT status (Stock is NOT reduced when saving draft)
    const challan = await prisma.challan.create({
      data: {
        challanNumber,
        customerId,
        totalQuantity,
        status: ChallanStatus.DRAFT,
        createdById,
        items: {
          create: challanItemsData,
        },
      },
      include: {
        customer: {
          select: { id: true, name: true, businessName: true, mobile: true, email: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        items: true,
      },
    });

    return challan;
  }

  static async getChallans(search?: string, status?: ChallanStatus, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const where: Prisma.ChallanWhereInput = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { challanNumber: { contains: search, mode: 'insensitive' } },
              { customer: { name: { contains: search, mode: 'insensitive' } } },
              { customer: { businessName: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, businessName: true, mobile: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { items: true },
          },
        },
      }),
      prisma.challan.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      challans,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  static async getChallanById(id: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, businessName: true, mobile: true, email: true, address: true, gstNumber: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        items: true,
      },
    });

    if (!challan) {
      throw { statusCode: 404, message: 'Challan not found' };
    }

    return challan;
  }

  static async confirmChallan(id: string, createdById: string) {
    // ATOMIC DATABASE TRANSACTION FOR CONFIRMATION
    return await prisma.$transaction(async (tx) => {
      // 1. Load Challan with items inside transaction
      const challan = await tx.challan.findUnique({
        where: { id },
        include: { items: true, customer: true },
      });

      if (!challan) {
        throw { statusCode: 404, message: 'Challan not found' };
      }

      // 2. Verify status is DRAFT
      if (challan.status !== ChallanStatus.DRAFT) {
        throw {
          statusCode: 400,
          message: `Cannot confirm a challan with status '${challan.status}'. Only DRAFT challans can be confirmed.`,
        };
      }

      // 3. Fetch current stock for every product in items list
      const productIds = challan.items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      // 4. Check stock for EVERY item
      const stockShortfalls: Array<{
        productId: string;
        product: string;
        sku: string;
        available: number;
        requested: number;
      }> = [];

      for (const item of challan.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw { statusCode: 404, message: `Product '${item.productNameSnapshot}' no longer exists.` };
        }

        if (product.currentStock < item.quantity) {
          stockShortfalls.push({
            productId: product.id,
            product: product.name,
            sku: product.sku,
            available: product.currentStock,
            requested: item.quantity,
          });
        }
      }

      // 5. If ANY product has insufficient stock -> REJECT ENTIRE CONFIRMATION
      if (stockShortfalls.length > 0) {
        throw {
          statusCode: 409,
          message: 'Insufficient stock for one or more products. Confirmation rejected.',
          details: stockShortfalls,
        };
      }

      // 6. ALL products have sufficient stock -> Execute stock deduction & log OUT movements
      for (const item of challan.items) {
        // Reduce stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              decrement: item.quantity,
            },
          },
        });

        // Log OUT stock movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            movementType: StockMovementType.OUT,
            reason: `Sales Challan ${challan.challanNumber}`,
            createdById,
          },
        });
      }

      // 7. Update Challan status to CONFIRMED
      const confirmedChallan = await tx.challan.update({
        where: { id },
        data: {
          status: ChallanStatus.CONFIRMED,
        },
        include: {
          customer: {
            select: { id: true, name: true, businessName: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          items: true,
        },
      });

      return confirmedChallan;
    });
  }

  static async cancelChallan(id: string) {
    const challan = await prisma.challan.findUnique({ where: { id } });

    if (!challan) {
      throw { statusCode: 404, message: 'Challan not found' };
    }

    if (challan.status !== ChallanStatus.DRAFT) {
      throw {
        statusCode: 400,
        message: `Cannot cancel a challan with status '${challan.status}'. Only DRAFT challans can be cancelled.`,
      };
    }

    const cancelledChallan = await prisma.challan.update({
      where: { id },
      data: {
        status: ChallanStatus.CANCELLED,
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return cancelledChallan;
  }
}
