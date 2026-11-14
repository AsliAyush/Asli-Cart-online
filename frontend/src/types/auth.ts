/**
 * User roles defined across the Asli Cart platform.
 * Strictly aligned with backend constants/roles.ts.
 */
export type UserRole =
  | "SUPER_ADMIN"
  | "PRODUCT_MANAGER"
  | "SOCIAL_MEDIA_MANAGER"
  | "CUSTOMER";

export const USER_ROLES: Record<UserRole, UserRole> = {
  SUPER_ADMIN: "SUPER_ADMIN",
  PRODUCT_MANAGER: "PRODUCT_MANAGER",
  SOCIAL_MEDIA_MANAGER: "SOCIAL_MEDIA_MANAGER",
  CUSTOMER: "CUSTOMER",
};

/**
 * Normalized Authenticated User object used throughout frontend components.
 */
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  roleId?: string;
  phone?: string | null;
  avatarUrl?: string | null;
  isActive?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
}

/**
 * JWT token payload pair returned by login/registration/refresh.
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Raw data payload returned by backend POST /api/v1/admin/auth/login
 */
export interface BackendAdminAuthData {
  user: {
    id: string;
    email: string;
    fullName: string;
    roleId: string;
    roleName: string;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * Raw data payload returned by backend POST /api/v1/customer/auth/login and register
 */
export interface BackendCustomerAuthData {
  user: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    avatarUrl?: string | null;
    role: string;
    createdAt?: string;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * Raw data payload returned by backend GET /me endpoints
 */
export interface BackendMeData {
  id: string;
  fullName: string;
  email: string;
  roleId?: string;
  roleName: string;
  isActive?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
}

/**
 * Normalized Auth Result returned by login / register services.
 */
export interface AuthResult {
  user: AuthUser;
  tokens: AuthTokens;
}

/**
 * Staff login form credentials.
 */
export interface StaffLoginCredentials {
  email: string;
  password: string;
}

/**
 * Customer login form credentials.
 */
export interface CustomerLoginCredentials {
  email: string;
  password: string;
}

/**
 * Customer registration form payload matching backend validator.
 * Note: Never includes a client-controlled role field.
 */
export interface CustomerRegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

