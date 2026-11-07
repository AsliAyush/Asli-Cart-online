import prisma from '../infra/database/prisma.js';

export class ModuleRepository {
  async findAll() {
    return prisma.module.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            modulePermissions: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.module.findUnique({
      where: { id },
      include: {
        modulePermissions: true,
      },
    });
  }

  async findByName(name: string) {
    return prisma.module.findUnique({
      where: { name },
    });
  }

  async findPermissionsByModuleId(moduleId: string) {
    return prisma.modulePermission.findMany({
      where: { moduleId },
      orderBy: { permissionKey: 'asc' },
      include: {
        module: true,
      },
    });
  }

  async findPermissionsByIds(permissionIds: string[]) {
    return prisma.modulePermission.findMany({
      where: {
        id: { in: permissionIds },
      },
    });
  }
}

export const moduleRepository = new ModuleRepository();

