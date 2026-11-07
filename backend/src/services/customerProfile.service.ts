import { userRepository, UserRepository } from '../repositories/user.repository.js';
import { refreshTokenRepository, RefreshTokenRepository } from '../repositories/refreshToken.repository.js';
import { auditLogRepository, AuditLogRepository } from '../repositories/auditLog.repository.js';
import { PasswordUtil } from '../utils/password.js';
import { AppError } from '../utils/appError.js';
import { MODULES } from '../constants/modules.js';

export interface UpdateProfileInput {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
}

export class CustomerProfileService {
  constructor(
    private userRepo: UserRepository = userRepository,
    private tokenRepo: RefreshTokenRepository = refreshTokenRepository,
    private auditRepo: AuditLogRepository = auditLogRepository
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw AppError.notFound('Customer profile not found');
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: (user as any).phone || null,
      avatarUrl: (user as any).avatarUrl || null,
      role: user.role.name,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw AppError.notFound('Customer profile not found');
    }

    const updated = await this.userRepo.update(userId, {
      ...(input.fullName ? { fullName: input.fullName } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
    });

    await this.auditRepo.create({
      actorUserId: userId,
      action: 'customer.profile_update',
      moduleName: MODULES.PROFILE,
      entityId: userId,
      metadata: { fields: Object.keys(input) },
    });

    return {
      id: updated.id,
      fullName: updated.fullName,
      email: updated.email,
      phone: (updated as any).phone || null,
      avatarUrl: (updated as any).avatarUrl || null,
      role: updated.role.name,
      updatedAt: updated.updatedAt,
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw AppError.notFound('Customer account not found');
    }

    const isCurrentValid = await PasswordUtil.compare(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw AppError.badRequest('Current password is incorrect');
    }

    if (currentPassword === newPassword) {
      throw AppError.badRequest('New password cannot be the same as your current password');
    }

    const newPasswordHash = await PasswordUtil.hash(newPassword);

    await this.userRepo.update(userId, {
      passwordHash: newPasswordHash,
    });

    // Invalidate old sessions for security
    await this.tokenRepo.revokeAllForUser(userId);

    await this.auditRepo.create({
      actorUserId: userId,
      action: 'customer.password_change',
      moduleName: MODULES.PROFILE,
      entityId: userId,
    });

    return { message: 'Password updated successfully. Please log in again.' };
  }
}

export const customerProfileService = new CustomerProfileService();

