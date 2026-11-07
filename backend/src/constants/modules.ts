export const MODULES = {
  AUTH: 'auth',
  USER: 'user',
  ROLE: 'role',
  MODULE: 'module',
  MODULE_PERMISSION: 'modulePermission',
  DASHBOARD: 'dashboard',
  PRODUCT: 'product',
  PRODUCT_DISCOVERY: 'productDiscovery',
  PRICING: 'pricing',
  OFFER: 'offer',
  AFFILIATE: 'affiliate',
  CONTENT: 'content',
  SOCIAL_ACCOUNT: 'socialAccount',
  PUBLISHING: 'publishing',
  ANALYTICS: 'analytics',
  CART: 'cart',
  PROFILE: 'profile',
  WISHLIST: 'wishlist',
  SETTINGS: 'settings',
  AUDIT_LOG: 'auditLog',
} as const;

export type ModuleName = (typeof MODULES)[keyof typeof MODULES];

export const PERMISSIONS = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  PUBLISH: 'publish',
  ASSIGN: 'assign',
  MANAGE: 'manage',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

