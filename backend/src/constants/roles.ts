export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  PRODUCT_MANAGER: 'PRODUCT_MANAGER',
  SOCIAL_MEDIA_MANAGER: 'SOCIAL_MEDIA_MANAGER',
  CUSTOMER: 'CUSTOMER',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const SYSTEM_ROLES: RoleName[] = [ROLES.SUPER_ADMIN];

