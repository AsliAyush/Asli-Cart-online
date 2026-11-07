import { roleRepository, RoleRepository } from '../repositories/role.repository.js';
import { moduleRepository, ModuleRepository } from '../repositories/module.repository.js';
import { auditLogRepository, AuditLogRepository } from '../repositories/auditLog.repository.js';
import { AppError } from '../utils/appError.js';
import { ROLES } from '../constants/roles.js';
import { MODULES } from '../constants/modules.js';

export class RoleService {
  constructor(
    private roleRepo: RoleRepository = roleRepository,
    private moduleRepo: ModuleRepository = moduleRepository,
    private auditRepo: AuditLogRepository = auditLogRepository
  ) {}

  async listRoles() {
    return this.roleRepo.findAll();
  }

  async getRoleById(id: string) {
    const role = await this.roleRepo.findById(id);
    if (!role) {
      throw AppError.notFound('Role not found');
    }
    return role;
  }

  async getRolePermissions(roleId: string) {
    const role = await this.roleRepo.findById(roleId);
    if (!role) {
      throw AppError.notFound('Role not found');
    }

    const rolePermissions = await this.roleRepo.getRolePermissions(roleId);
    return rolePermissions.map((rp) => ({
      id: rp.modulePermission.id,
      moduleId: rp.modulePermission.moduleId,
      moduleName: rp.modulePermission.module.name,
      permissionKey: rp.modulePermission.permissionKey,
      permissionName: rp.modulePermission.permissionName,
      description: rp.modulePermission.description,
      assignedAt: rp.createdAt,
    }));
  }

  async updateRolePermissions(roleId: string, permissionIds: string[], actorId: string) {
    const role = await this.roleRepo.findById(roleId);
    if (!role) {
      throw AppError.notFound('Role not found');
    }

    // Protect SUPER_ADMIN from accidental permission stripping
    if (role.isSystem && role.name === ROLES.SUPER_ADMIN) {
      throw AppError.forbidden(
        'System role SUPER_ADMIN permissions are immutable and cannot be restricted'
      );
    }

    // Validate that all supplied permission IDs actually exist in the database
    if (permissionIds.length > 0) {
      const validPermissions = await this.moduleRepo.findPermissionsByIds(permissionIds);
      if (validPermissions.length !== permissionIds.length) {
        throw AppError.badRequest('One or more permission IDs are invalid');
      }
    }

    const updatedPermissions = await this.roleRepo.setRolePermissions(roleId, permissionIds);

    await this.auditRepo.create({
      actorUserId: actorId,
      action: 'role.permissions_update',
      moduleName: MODULES.ROLE,
      entityId: roleId,
      metadata: {
        roleName: role.name,
        assignedPermissionCount: permissionIds.length,
        permissionIds,
      },
    });

    return updatedPermissions.map((rp) => ({
      id: rp.modulePermission.id,
      moduleId: rp.modulePermission.moduleId,
      moduleName: rp.modulePermission.module.name,
      permissionKey: rp.modulePermission.permissionKey,
      permissionName: rp.modulePermission.permissionName,
      description: rp.modulePermission.description,
      assignedAt: rp.createdAt,
    }));
  }
}

export const roleService = new RoleService();

