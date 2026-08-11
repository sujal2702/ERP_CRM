import prisma from '../config/db';
import { StockAdjustmentInput } from '../validators/product.validator';
import { StockMovementType, Prisma } from '@prisma/client';

export class InventoryService {
  static async getInventory(search?: string, page: number = 1, limit: number = 10, lowStock?: boolean) {
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    let products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    let mapped = products.map((p) => {
      let status = 'IN_STOCK';
      if (p.currentStock === 0) {
        status = 'OUT_OF_STOCK';
      } else if (p.currentStock <= p.minimumStock) {
        status = 'LOW_STOCK';
      }
      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        unitPrice: p.unitPrice,
        currentStock: p.currentStock,
        minimumStock: p.minimumStock,
        warehouseLocation: p.warehouseLocation,
        stockStatus: status,
      };
    });

    if (lowStock) {
      mapped = mapped.filter((p) => p.currentStock <= p.minimumStock);
    }

    const total = mapped.length;
    const paginatedItems = mapped.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      inventory: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  static async getStockMovements(productId?: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const where: Prisma.StockMovementWhereInput = productId ? { productId } : {};

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: { id: true, name: true, sku: true, category: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      movements,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  static async createStockAdjustment(input: StockAdjustmentInput, createdById: string) {
    const { productId, movementType, quantity, reason } = input;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw { statusCode: 404, message: 'Product not found' };
    }

    // Negative Stock Validation
    if (movementType === StockMovementType.OUT && product.currentStock < quantity) {
      throw {
        statusCode: 400,
        message: `Insufficient stock for product '${product.name}' (${product.sku}). Available stock: ${product.currentStock}, Requested OUT movement: ${quantity}. Stock cannot be negative.`,
      };
    }

    // Execute in Prisma Transaction for atomicity
    return await prisma.$transaction(async (tx) => {
      const stockChange = movementType === StockMovementType.IN ? quantity : -quantity;

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          currentStock: {
            increment: stockChange,
          },
        },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          quantity,
          movementType,
          reason: reason.trim(),
          createdById,
        },
        include: {
          product: {
            select: { id: true, name: true, sku: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      let status = 'IN_STOCK';
      if (updatedProduct.currentStock === 0) {
        status = 'OUT_OF_STOCK';
      } else if (updatedProduct.currentStock <= updatedProduct.minimumStock) {
        status = 'LOW_STOCK';
      }

      return {
        movement,
        updatedProduct: {
          ...updatedProduct,
          stockStatus: status,
        },
      };
    });
  }
}
