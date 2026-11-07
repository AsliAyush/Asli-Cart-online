import prisma from '../infra/database/prisma.js';

export class MerchantRepository {
  async findAll() {
    return prisma.merchant.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { offers: true },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.merchant.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string) {
    return prisma.merchant.findUnique({
      where: { slug },
    });
  }
}

export const merchantRepository = new MerchantRepository();

