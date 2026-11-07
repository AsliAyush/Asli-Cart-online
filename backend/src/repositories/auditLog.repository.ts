import prisma from '../infra/database/prisma.js';
import { Prisma } from '@prisma/client';

export class AuditLogRepository {
  async create(data: {
    actorUserId?: string | null;
    action: string;
    moduleName: string;
    entityId?: string | null;
    metadata?: any;
  }) {
    return prisma.auditLog.create({
      data: {
        actorUserId: data.actorUserId,
        action: data.action,
        moduleName: data.moduleName,
        entityId: data.entityId,
        metadata: data.metadata ?? Prisma.DbNull,
      },
    });
  }

  async findLogs(params: {
    page: number;
    limit: number;
    moduleName?: string;
    action?: string;
    actorUserId?: string;
  }) {
    const { page, limit, moduleName, action, actorUserId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};
    if (moduleName) where.moduleName = moduleName;
    if (action) where.action = action;
    if (actorUserId) where.actorUserId = actorUserId;

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return prisma.auditLog.findUnique({
      where: { id },
      include: {
        actor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }
}

export const auditLogRepository = new AuditLogRepository();

