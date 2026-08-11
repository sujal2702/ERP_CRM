import prisma from '../config/db';
import { CreateCustomerInput, UpdateCustomerInput } from '../validators/customer.validator';
import { Prisma } from '@prisma/client';

export class CustomerService {
  static async getCustomers(search?: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { businessName: { contains: search, mode: 'insensitive' } },
            { mobile: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { gstNumber: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { notes: true },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  static async createCustomer(data: CreateCustomerInput, createdById: string) {
    const { notes, followUpDate, email, gstNumber, ...rest } = data;

    const parsedFollowUpDate = followUpDate ? new Date(followUpDate) : null;

    const customer = await prisma.customer.create({
      data: {
        ...rest,
        email: email || null,
        gstNumber: gstNumber || null,
        followUpDate: parsedFollowUpDate,
        createdById,
        ...(notes && notes.trim().length > 0
          ? {
              notes: {
                create: [
                  {
                    note: notes.trim(),
                    createdById,
                  },
                ],
              },
            }
          : {}),
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        notes: true,
      },
    });

    return customer;
  }

  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!customer) {
      throw { statusCode: 404, message: 'Customer not found' };
    }

    return customer;
  }

  static async updateCustomer(id: string, data: UpdateCustomerInput) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw { statusCode: 404, message: 'Customer not found' };
    }

    const { notes, followUpDate, email, gstNumber, ...rest } = data;

    const parsedFollowUpDate = followUpDate !== undefined
      ? (followUpDate ? new Date(followUpDate) : null)
      : undefined;

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        ...rest,
        email: email !== undefined ? (email || null) : undefined,
        gstNumber: gstNumber !== undefined ? (gstNumber || null) : undefined,
        followUpDate: parsedFollowUpDate,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return updatedCustomer;
  }

  static async getCustomerNotes(customerId: string) {
    const existing = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!existing) {
      throw { statusCode: 404, message: 'Customer not found' };
    }

    const notes = await prisma.customerNote.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return notes;
  }

  static async addCustomerNote(customerId: string, noteText: string, createdById: string) {
    const existing = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!existing) {
      throw { statusCode: 404, message: 'Customer not found' };
    }

    const newNote = await prisma.customerNote.create({
      data: {
        customerId,
        note: noteText.trim(),
        createdById,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return newNote;
  }
}
