import prisma from '../config/db';
import { CreateProductInput, UpdateProductInput } from '../validators/product.validator';
import { Prisma, StockMovementType } from '@prisma/client';

export class ProductService {
  static async getProducts(search?: string, page: number = 1, limit: number = 10, lowStock?: boolean) {
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    // Fetch all matching items to evaluate lowStock accurately if requested
    let products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Map derived stock status
    let mapped = products.map((p) => {
      let status = 'IN_STOCK';
      if (p.currentStock === 0) {
        status = 'OUT_OF_STOCK';
      } else if (p.currentStock <= p.minimumStock) {
        status = 'LOW_STOCK';
      }
      return {
        ...p,
        stockStatus: status,
      };
    });

    if (lowStock) {
      mapped = mapped.filter((p) => p.currentStock <= p.minimumStock);
    }

    const total = mapped.length;
    const paginatedProducts = mapped.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  static async createProduct(data: CreateProductInput, createdById: string) {
    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku.trim() },
    });

    if (existingSku) {
      throw { statusCode: 409, message: `SKU '${data.sku}' already exists. Please use a unique SKU.` };
    }

    // Execute in transaction to log initial stock movement if stock > 0
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: data.name.trim(),
          sku: data.sku.trim(),
          category: data.category.trim(),
          unitPrice: data.unitPrice,
          currentStock: data.currentStock,
          minimumStock: data.minimumStock,
          warehouseLocation: data.warehouseLocation.trim(),
        },
      });

      if (data.currentStock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            quantity: data.currentStock,
            movementType: StockMovementType.IN,
            reason: 'Initial stock setup upon product creation',
            createdById,
          },
        });
      }

      return product;
    });
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            createdBy: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!product) {
      throw { statusCode: 404, message: 'Product not found' };
    }

    let status = 'IN_STOCK';
    if (product.currentStock === 0) {
      status = 'OUT_OF_STOCK';
    } else if (product.currentStock <= product.minimumStock) {
      status = 'LOW_STOCK';
    }

    return {
      ...product,
      stockStatus: status,
    };
  }

  static async updateProduct(id: string, data: UpdateProductInput) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw { statusCode: 404, message: 'Product not found' };
    }

    if (data.sku && data.sku.trim() !== existing.sku) {
      const duplicateSku = await prisma.product.findUnique({
        where: { sku: data.sku.trim() },
      });
      if (duplicateSku) {
        throw { statusCode: 409, message: `SKU '${data.sku}' already exists.` };
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.sku ? { sku: data.sku.trim() } : {}),
        ...(data.category ? { category: data.category.trim() } : {}),
        ...(data.unitPrice !== undefined ? { unitPrice: data.unitPrice } : {}),
        ...(data.minimumStock !== undefined ? { minimumStock: data.minimumStock } : {}),
        ...(data.warehouseLocation ? { warehouseLocation: data.warehouseLocation.trim() } : {}),
      },
    });

    return updated;
  }
}
