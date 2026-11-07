import { userRepository, UserRepository } from '../repositories/user.repository.js';
import { roleRepository, RoleRepository } from '../repositories/role.repository.js';
import { refreshTokenRepository, RefreshTokenRepository } from '../repositories/refreshToken.repository.js';
import { cartRepository, CartRepository } from '../repositories/cart.repository.js';
import { wishlistRepository, WishlistRepository } from '../repositories/wishlist.repository.js';
import { auditLogRepository, AuditLogRepository } from '../repositories/auditLog.repository.js';
import { PasswordUtil } from '../utils/password.js';
import { JwtUtil } from '../utils/jwt.js';
import { AppError } from '../utils/appError.js';
import { ROLES } from '../constants/roles.js';
import { MODULES } from '../constants/modules.js';

export interface CustomerRegisterInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export class CustomerAuthService {
  constructor(
    private userRepo: UserRepository = userRepository,
    private roleRepo: RoleRepository = roleRepository,
    private tokenRepo: RefreshTokenRepository = refreshTokenRepository,
    private cartRepo: CartRepository = cartRepository,
    private wishlistRepo: WishlistRepository = wishlistRepository,
    private auditRepo: AuditLogRepository = auditLogRepository
  ) {}

  async register(input: CustomerRegisterInput, ipAddress?: string) {
    const existingUser = await this.userRepo.findByEmail(input.email);
    if (existingUser) {
      throw AppError.conflict('An account with this email address already exists');
    }

    // Server-enforce the CUSTOMER role strictly
    const customerRole = await this.roleRepo.findByName(ROLES.CUSTOMER);
    if (!customerRole) {
      throw AppError.internal('Customer role is not configured in the system');
    }

    const passwordHash = await PasswordUtil.hash(input.password);

    const user = await this.userRepo.create({
      fullName: input.fullName,
      email: input.email,
      passwordHash,
      phone: input.phone,
      roleId: customerRole.id,
      isActive: true,
      emailVerified: false,
    });

    // Initialize customer cart and wishlist
    await Promise.all([
      this.cartRepo.getOrCreateCart(user.id),
      this.wishlistRepo.getOrCreateWishlist(user.id),
    ]);

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: ROLES.CUSTOMER,
    };

    const accessToken = JwtUtil.signAccessToken(tokenPayload);
    const refreshToken = JwtUtil.signRefreshToken(tokenPayload);

    const tokenHash = JwtUtil.hashToken(refreshToken);
    const expiresAt = JwtUtil.getRefreshTokenExpiryDate();

    await this.tokenRepo.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    await this.auditRepo.create({
      actorUserId: user.id,
      action: 'customer.register',
      moduleName: MODULES.AUTH,
      entityId: user.id,
      metadata: { ip: ipAddress },
    });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: ROLES.CUSTOMER,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, plainTextPassword: string, ipAddress?: string) {
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw AppError.unauthorized('Account has been deactivated. Please contact customer support.');
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

    const tokenHash = JwtUtil.hashToken(refreshToken);
    const expiresAt = JwtUtil.getRefreshTokenExpiryDate();

    await this.tokenRepo.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    await this.auditRepo.create({
      actorUserId: user.id,
      action: 'customer.login',
      moduleName: MODULES.AUTH,
      entityId: user.id,
      metadata: { ip: ipAddress },
    });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: (user as any).phone || null,
        avatarUrl: (user as any).avatarUrl || null,
        role: user.role.name,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }
}

export const customerAuthService = new CustomerAuthService();

