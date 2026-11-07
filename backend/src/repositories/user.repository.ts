import prisma from '../infra/database/prisma.js';
import { User, Prisma } from '@prisma/client';
import { ROLES } from '../constants/roles.js';

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        role: true,
      },
    });
  }

  async findUsers(params: {
    page: number;
    limit: number;
    roleId?: string;
    isActive?: boolean;
    search?: string;
  }) {
    const { page, limit, roleId, isActive, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (roleId) {
      where.roleId = roleId;
    }

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          roleId: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          role: {
            select: {
              id: true,
              name: true,
              description: true,
              isSystem: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total };
  }

  async create(data: {
    fullName: string;
    email: string;
    passwordHash: string;
    roleId: string;
    phone?: string;
    avatarUrl?: string;
    isActive?: boolean;
    emailVerified?: boolean;
  }) {
    return prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        roleId: data.roleId,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        isActive: data.isActive ?? true,
        emailVerified: data.emailVerified ?? false,
      },
      include: {
        role: true,
      },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        role: true,
      },
    });
  }

  async countActiveSuperAdmins(): Promise<number> {
    return prisma.user.count({
      where: {
        isActive: true,
        role: {
          name: ROLES.SUPER_ADMIN,
        },
      },
    });
  }

  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return prisma.user.count({ where });
  }
}

export const userRepository = new UserRepository();

