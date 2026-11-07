import prisma from '../infra/database/prisma.js';

export class RoleRepository {
  async findAll() {
    return prisma.role.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            users: true,
            roleModulePermissions: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.role.findUnique({
      where: { id },
      include: {
        roleModulePermissions: {
          include: {
            modulePermission: {
              include: {
                module: true,
              },
            },
          },
        },
      },
    });
  }

  async findByName(name: string) {
    return prisma.role.findUnique({
      where: { name },
    });
  }

  async getRolePermissions(roleId: string) {
    return prisma.roleModulePermission.findMany({
      where: { roleId },
      include: {
        modulePermission: {
          include: {
            module: true,
          },
        },
      },
      orderBy: [
        { modulePermission: { moduleId: 'asc' } },
        { modulePermission: { permissionKey: 'asc' } },
      ],
    });
  }

  async setRolePermissions(roleId: string, permissionIds: string[]) {
    return prisma.$transaction(async (tx) => {
      // Delete existing permissions for this role
      await tx.roleModulePermission.deleteMany({
        where: { roleId },
      });

      if (permissionIds.length === 0) {
        return [];
      }

      // Insert new permissions
      await tx.roleModulePermission.createMany({
        data: permissionIds.map((id) => ({
          roleId,
          modulePermissionId: id,
        })),
        skipDuplicates: true,
      });

      return tx.roleModulePermission.findMany({
        where: { roleId },
        include: {
          modulePermission: {
            include: {
              module: true,
            },
          },
        },
      });
    });
  }
}

export const roleRepository = new RoleRepository();

