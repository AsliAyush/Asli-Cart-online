import { userRepository, UserRepository } from '../repositories/user.repository.js';
import { refreshTokenRepository, RefreshTokenRepository } from '../repositories/refreshToken.repository.js';
import { auditLogRepository, AuditLogRepository } from '../repositories/auditLog.repository.js';
import { PasswordUtil } from '../utils/password.js';
import { JwtUtil } from '../utils/jwt.js';
import { AppError } from '../utils/appError.js';
import { ROLES } from '../constants/roles.js';
import { MODULES } from '../constants/modules.js';

export class AuthService {
  constructor(
    private userRepo: UserRepository = userRepository,
    private tokenRepo: RefreshTokenRepository = refreshTokenRepository,
    private auditRepo: AuditLogRepository = auditLogRepository
  ) {}

  async adminLogin(email: string, plainTextPassword: string, ipAddress?: string) {
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw AppError.unauthorized('Account has been deactivated. Please contact support.');
    }

    // Strictly enforce that only staff/administrative roles can login via portal (Customers are denied)
    if (user.role.name === ROLES.CUSTOMER) {
      throw AppError.forbidden('Access denied. Administrator privileges required.');
    }

    const isPasswordValid = await PasswordUtil.compare(plainTextPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
    };

    const accessToken = JwtUtil.signAccessToken(tokenPayload);
    const refreshToken = JwtUtil.signRefreshToken(tokenPayload);

    // Store hashed refresh token in database
    const tokenHash = JwtUtil.hashToken(refreshToken);
    const expiresAt = JwtUtil.getRefreshTokenExpiryDate();

    await this.tokenRepo.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    // Record audit log
    await this.auditRepo.create({
      actorUserId: user.id,
      action: 'admin.login',
      moduleName: MODULES.AUTH,
      entityId: user.id,
      metadata: { ip: ipAddress },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roleId: user.roleId,
        roleName: user.role.name,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(rawRefreshToken: string) {
    if (!rawRefreshToken) {
      throw AppError.unauthorized('Refresh token is required');
    }

    let payload;
    try {
      payload = JwtUtil.verifyRefreshToken(rawRefreshToken);
    } catch (err: any) {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    const tokenHash = JwtUtil.hashToken(rawRefreshToken);
    const storedToken = await this.tokenRepo.findByTokenHash(tokenHash);

    if (!storedToken) {
      throw AppError.unauthorized('Refresh token not recognized');
    }

    // Refresh token reuse detection (security mechanism)
    if (storedToken.revokedAt) {
      // Token was already revoked! Possible theft, revoke all user tokens for security
      await this.tokenRepo.revokeAllForUser(storedToken.userId);
      throw AppError.unauthorized('Revoked refresh token presented. All active sessions invalidated.');
    }

    if (new Date() > storedToken.expiresAt) {
      throw AppError.unauthorized('Refresh token has expired');
    }

    if (!storedToken.user.isActive) {
      throw AppError.unauthorized('User account is deactivated');
    }

    // Revoke old token and rotate
    await this.tokenRepo.revoke(storedToken.id);

    const tokenPayload = {
      userId: storedToken.user.id,
      email: storedToken.user.email,
      roleId: storedToken.user.roleId,
      roleName: storedToken.user.role.name,
    };

    const newAccessToken = JwtUtil.signAccessToken(tokenPayload);
    const newRefreshToken = JwtUtil.signRefreshToken(tokenPayload);
    const newTokenHash = JwtUtil.hashToken(newRefreshToken);
    const newExpiresAt = JwtUtil.getRefreshTokenExpiryDate();

    await this.tokenRepo.create({
      userId: storedToken.user.id,
      tokenHash: newTokenHash,
      expiresAt: newExpiresAt,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(rawRefreshToken: string, userId?: string) {
    if (!rawRefreshToken) {
      return;
    }

    const tokenHash = JwtUtil.hashToken(rawRefreshToken);
    const storedToken = await this.tokenRepo.findByTokenHash(tokenHash);

    if (storedToken && !storedToken.revokedAt) {
      await this.tokenRepo.revoke(storedToken.id);

      if (userId) {
        await this.auditRepo.create({
          actorUserId: userId,
          action: 'admin.logout',
          moduleName: MODULES.AUTH,
          entityId: storedToken.id,
        });
      }
    }
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();

