import { userRepository, UserRepository } from '../repositories/user.repository.js';
import { roleRepository, RoleRepository } from '../repositories/role.repository.js';
import { auditLogRepository, AuditLogRepository } from '../repositories/auditLog.repository.js';
import { refreshTokenRepository, RefreshTokenRepository } from '../repositories/refreshToken.repository.js';
import { PasswordUtil } from '../utils/password.js';
import { AppError } from '../utils/appError.js';
import { ROLES } from '../constants/roles.js';
import { MODULES } from '../constants/modules.js';

export interface CreateEmployeeInput {
  fullName: string;
  email: string;
  password: string;
  roleId: string;
}

export interface UpdateEmployeeInput {
  fullName?: string;
}

export class UserService {
  constructor(
    private userRepo: UserRepository = userRepository,
    private roleRepo: RoleRepository = roleRepository,
    private auditRepo: AuditLogRepository = auditLogRepository,
    private tokenRepo: RefreshTokenRepository = refreshTokenRepository
  ) {}

  async listUsers(params: {
    page: number;
    limit: number;
    roleId?: string;
    isActive?: boolean;
    search?: string;
  }) {
    return this.userRepo.findUsers(params);
  }

  async getUserById(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    // Exclude passwordHash from response
    const { passwordHash: _hash, ...safeUser } = user;
    return safeUser;
  }

  async createEmployee(input: CreateEmployeeInput, actorId: string) {
    const existingUser = await this.userRepo.findByEmail(input.email);
    if (existingUser) {
      throw AppError.conflict('A user with this email address already exists');
    }

    const role = await this.roleRepo.findById(input.roleId);
    if (!role) {
      throw AppError.badRequest('Specified role does not exist');
    }

    // Never allow Super Admin creation via standard employee creation endpoint
    if (role.name === ROLES.SUPER_ADMIN) {
      throw AppError.forbidden(
        'Super Admin accounts cannot be created via standard employee management. Bootstrap is required.'
      );
    }

    const passwordValidation = PasswordUtil.isStrongPassword(input.password);
    if (!passwordValidation.valid) {
      throw AppError.badRequest(
        `Weak password: ${passwordValidation.reasons.join(', ')}`
      );
    }

    const passwordHash = await PasswordUtil.hash(input.password);

    const newUser = await this.userRepo.create({
      fullName: input.fullName,
      email: input.email,
      passwordHash,
      roleId: input.roleId,
      isActive: true,
      emailVerified: true,
    });

    await this.auditRepo.create({
      actorUserId: actorId,
      action: 'user.create_employee',
      moduleName: MODULES.USER,
      entityId: newUser.id,
      metadata: {
        email: newUser.email,
        roleId: newUser.roleId,
        roleName: role.name,
      },
    });

    const { passwordHash: _hash, ...safeUser } = newUser;
    return safeUser;
  }

  async updateEmployee(id: string, input: UpdateEmployeeInput, actorId: string) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    const updatedUser = await this.userRepo.update(id, {
      fullName: input.fullName,
    });

    await this.auditRepo.create({
      actorUserId: actorId,
      action: 'user.update_employee',
      moduleName: MODULES.USER,
      entityId: id,
      metadata: { input },
    });

    const { passwordHash: _hash, ...safeUser } = updatedUser;
    return safeUser;
  }

  async updateUserStatus(id: string, isActive: boolean, actorId: string) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    // Protect against deactivating the last active Super Admin
    if (!isActive && user.role.name === ROLES.SUPER_ADMIN && user.isActive) {
      const activeSuperAdmins = await this.userRepo.countActiveSuperAdmins();
      if (activeSuperAdmins <= 1) {
        throw AppError.badRequest(
          'Action prohibited: Cannot deactivate the last active Super Admin'
        );
      }
    }

    const updatedUser = await this.userRepo.update(id, { isActive });

    // If deactivating user, invalidate all their active refresh tokens immediately
    if (!isActive) {
      await this.tokenRepo.revokeAllForUser(id);
    }

    await this.auditRepo.create({
      actorUserId: actorId,
      action: isActive ? 'user.activate' : 'user.deactivate',
      moduleName: MODULES.USER,
      entityId: id,
      metadata: { previousStatus: user.isActive, newStatus: isActive },
    });

    const { passwordHash: _hash, ...safeUser } = updatedUser;
    return safeUser;
  }

  async updateUserRole(id: string, roleId: string, actorId: string) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    const targetRole = await this.roleRepo.findById(roleId);
    if (!targetRole) {
      throw AppError.badRequest('Specified target role does not exist');
    }

    // Prevent promoting to Super Admin via regular role assignment
    if (targetRole.name === ROLES.SUPER_ADMIN) {
      throw AppError.forbidden(
        'Super Admin role cannot be assigned via standard role management'
      );
    }

    // Prevent demoting the last active Super Admin
    if (user.role.name === ROLES.SUPER_ADMIN && targetRole.name !== ROLES.SUPER_ADMIN) {
      const activeSuperAdmins = await this.userRepo.countActiveSuperAdmins();
      if (activeSuperAdmins <= 1) {
        throw AppError.badRequest(
          'Action prohibited: Cannot change the role of the last active Super Admin'
        );
      }
    }

    const updatedUser = await this.userRepo.update(id, {
      role: {
        connect: { id: roleId },
      },
    });

    // Revoke refresh tokens so user re-authenticates with new permissions
    await this.tokenRepo.revokeAllForUser(id);

    await this.auditRepo.create({
      actorUserId: actorId,
      action: 'user.role_change',
      moduleName: MODULES.USER,
      entityId: id,
      metadata: {
        previousRoleId: user.roleId,
        previousRoleName: user.role.name,
        newRoleId: targetRole.id,
        newRoleName: targetRole.name,
      },
    });

    const { passwordHash: _hash, ...safeUser } = updatedUser;
    return safeUser;
  }
}

export const userService = new UserService();
