import prisma from '../infra/database/prisma.js';

export class CategoryRepository {
  async findAll() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
    });
  }
}

export const categoryRepository = new CategoryRepository();

