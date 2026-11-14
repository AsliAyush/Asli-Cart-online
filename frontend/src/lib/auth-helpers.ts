import type {
  AuthUser,
  UserRole,
  BackendAdminAuthData,
  BackendCustomerAuthData,
  BackendMeData,
} from "@/types/auth";

/**
 * Returns true if the role belongs to internal staff.
 */
export function isStaffRole(role?: UserRole | null): boolean {
  if (!role) return false;
  return (
    role === "SUPER_ADMIN" ||
    role === "PRODUCT_MANAGER" ||
    role === "SOCIAL_MEDIA_MANAGER"
  );
}

/**
 * Returns true if the role is customer.
 */
export function isCustomerRole(role?: UserRole | null): boolean {
  return role === "CUSTOMER";
}

/**
 * Maps a user's role to their designated dashboard route.
 */
export function getRoleDashboardPath(role?: UserRole | null): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "/admin/dashboard";
    case "PRODUCT_MANAGER":
      return "/product-manager/dashboard";
    case "SOCIAL_MEDIA_MANAGER":
      return "/social-media-manager/dashboard";
    case "CUSTOMER":
      return "/customer/dashboard";
    default:
      return "/";
  }
}

/**
 * Checks whether a user possesses one of the allowed roles.
 */
export function hasAllowedRole(
  user: AuthUser | null,
  allowedRoles: UserRole[]
): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Normalizes backend admin auth user shape into AuthUser.
 */
export function normalizeAdminUser(
  backendData: BackendAdminAuthData["user"]
): AuthUser {
  return {
    id: backendData.id,
    fullName: backendData.fullName,
    email: backendData.email,
    role: backendData.roleName as UserRole,
    roleId: backendData.roleId,
  };
}

/**
 * Normalizes backend customer auth user shape into AuthUser.
 */
export function normalizeCustomerUser(
  backendData: BackendCustomerAuthData["user"]
): AuthUser {
  return {
    id: backendData.id,
    fullName: backendData.fullName,
    email: backendData.email,
    role: (backendData.role || "CUSTOMER") as UserRole,
    phone: backendData.phone || null,
    avatarUrl: backendData.avatarUrl || null,
    createdAt: backendData.createdAt,
  };
}

/**
 * Normalizes backend /me payload into AuthUser.
 */
export function normalizeMeUser(backendData: BackendMeData): AuthUser {
  return {
    id: backendData.id,
    fullName: backendData.fullName,
    email: backendData.email,
    role: (backendData.roleName || "CUSTOMER") as UserRole,
    roleId: backendData.roleId,
    isActive: backendData.isActive,
    emailVerified: backendData.emailVerified,
    createdAt: backendData.createdAt,
  };
}

