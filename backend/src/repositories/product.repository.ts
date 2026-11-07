import prisma from '../infra/database/prisma.js';
import { Prisma } from '@prisma/client';

export class ProductRepository {
  async findMany(params: {
    page: number;
    limit: number;
    categoryId?: string;
    status?: string;
    brand?: string;
    search?: string;
    isAssignedToSmm?: boolean;
  }) {
    const { page, limit, categoryId, status, brand, search, isAssignedToSmm } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (brand) where.brand = { contains: brand, mode: 'insensitive' };
    if (typeof isAssignedToSmm === 'boolean') where.isAssignedToSmm = isAssignedToSmm;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          createdBy: {
            select: { id: true, fullName: true, email: true },
          },
          _count: {
            select: { offers: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
        offers: {
          include: {
            merchant: true,
          },
        },
        priceHistories: {
          orderBy: { recordedAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        offers: {
          include: {
            merchant: true,
          },
        },
      },
    });
  }

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    brand?: string;
    categoryId: string;
    mainImage: string;
    additionalImages?: string[];
    specifications?: any;
    status?: string;
    createdById: string;
    isAssignedToSmm?: boolean;
  }) {
    return prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        brand: data.brand,
        categoryId: data.categoryId,
        mainImage: data.mainImage,
        additionalImages: data.additionalImages || [],
        specifications: data.specifications ?? Prisma.DbNull,
        status: data.status || 'DRAFT',
        createdById: data.createdById,
        isAssignedToSmm: data.isAssignedToSmm ?? false,
      },
      include: {
        category: true,
      },
    });
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async count(where?: Prisma.ProductWhereInput): Promise<number> {
    return prisma.product.count({ where });
  }
}

export const productRepository = new ProductRepository();

