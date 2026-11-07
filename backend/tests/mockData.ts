import { ROLES } from '../src/constants/roles.js';
import { MODULES, PERMISSIONS } from '../src/constants/modules.js';

export const mockRoles = [
  { id: 'role-super-admin', name: ROLES.SUPER_ADMIN, description: 'Super Admin', isSystem: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'role-product-manager', name: ROLES.PRODUCT_MANAGER, description: 'Product Manager', isSystem: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'role-social-media', name: ROLES.SOCIAL_MEDIA_MANAGER, description: 'Social Media Manager', isSystem: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'role-customer', name: ROLES.CUSTOMER, description: 'Customer', isSystem: false, createdAt: new Date(), updatedAt: new Date() },
];

export const mockModules = [
  { id: 'mod-user', name: MODULES.USER, description: 'User management', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'mod-role', name: MODULES.ROLE, description: 'Role management', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'mod-product', name: MODULES.PRODUCT, description: 'Product catalog', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'mod-productDiscovery', name: MODULES.PRODUCT_DISCOVERY, description: 'Product Discovery', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'mod-pricing', name: MODULES.PRICING, description: 'Pricing', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'mod-offer', name: MODULES.OFFER, description: 'Offers', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'mod-affiliate', name: MODULES.AFFILIATE, description: 'Affiliates', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'mod-dashboard', name: MODULES.DASHBOARD, description: 'Dashboard', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'mod-auditLog', name: MODULES.AUDIT_LOG, description: 'Audit Log', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'mod-profile', name: MODULES.PROFILE, description: 'Profile', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'mod-cart', name: MODULES.CART, description: 'Cart', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'mod-wishlist', name: MODULES.WISHLIST, description: 'Wishlist', isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

export const mockPermissions = [
  { id: 'perm-user-view', moduleId: 'mod-user', permissionKey: PERMISSIONS.VIEW, permissionName: 'View Users', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-user-create', moduleId: 'mod-user', permissionKey: PERMISSIONS.CREATE, permissionName: 'Create Users', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-user-update', moduleId: 'mod-user', permissionKey: PERMISSIONS.UPDATE, permissionName: 'Update Users', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-user-assign', moduleId: 'mod-user', permissionKey: PERMISSIONS.ASSIGN, permissionName: 'Assign Roles', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-dashboard-view', moduleId: 'mod-dashboard', permissionKey: PERMISSIONS.VIEW, permissionName: 'View Dashboard', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-product-view', moduleId: 'mod-product', permissionKey: PERMISSIONS.VIEW, permissionName: 'View Products', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-product-create', moduleId: 'mod-product', permissionKey: PERMISSIONS.CREATE, permissionName: 'Create Products', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-product-update', moduleId: 'mod-product', permissionKey: PERMISSIONS.UPDATE, permissionName: 'Update Products', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-product-delete', moduleId: 'mod-product', permissionKey: PERMISSIONS.DELETE, permissionName: 'Delete Products', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-disc-view', moduleId: 'mod-productDiscovery', permissionKey: PERMISSIONS.VIEW, permissionName: 'View Discovered', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-disc-create', moduleId: 'mod-productDiscovery', permissionKey: PERMISSIONS.CREATE, permissionName: 'Import Discovered', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-pricing-view', moduleId: 'mod-pricing', permissionKey: PERMISSIONS.VIEW, permissionName: 'View Pricing', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-offer-view', moduleId: 'mod-offer', permissionKey: PERMISSIONS.VIEW, permissionName: 'View Offers', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-offer-create', moduleId: 'mod-offer', permissionKey: PERMISSIONS.CREATE, permissionName: 'Create Offers', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-offer-update', moduleId: 'mod-offer', permissionKey: PERMISSIONS.UPDATE, permissionName: 'Update Offers', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-aff-view', moduleId: 'mod-affiliate', permissionKey: PERMISSIONS.VIEW, permissionName: 'View Affiliates', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-aff-create', moduleId: 'mod-affiliate', permissionKey: PERMISSIONS.CREATE, permissionName: 'Create Affiliates', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-profile-view', moduleId: 'mod-profile', permissionKey: PERMISSIONS.VIEW, permissionName: 'View Profile', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-profile-update', moduleId: 'mod-profile', permissionKey: PERMISSIONS.UPDATE, permissionName: 'Update Profile', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-cart-view', moduleId: 'mod-cart', permissionKey: PERMISSIONS.VIEW, permissionName: 'View Cart', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-cart-create', moduleId: 'mod-cart', permissionKey: PERMISSIONS.CREATE, permissionName: 'Add to Cart', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-cart-update', moduleId: 'mod-cart', permissionKey: PERMISSIONS.UPDATE, permissionName: 'Update Cart', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-cart-delete', moduleId: 'mod-cart', permissionKey: PERMISSIONS.DELETE, permissionName: 'Remove from Cart', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-wishlist-view', moduleId: 'mod-wishlist', permissionKey: PERMISSIONS.VIEW, permissionName: 'View Wishlist', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-wishlist-create', moduleId: 'mod-wishlist', permissionKey: PERMISSIONS.CREATE, permissionName: 'Add to Wishlist', description: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'perm-wishlist-delete', moduleId: 'mod-wishlist', permissionKey: PERMISSIONS.DELETE, permissionName: 'Remove from Wishlist', description: null, createdAt: new Date(), updatedAt: new Date() },
];

export const mockRoleModulePermissions = [
  // Product manager permissions
  { id: 'rmp-1', roleId: 'role-product-manager', modulePermissionId: 'perm-dashboard-view', createdAt: new Date() },
  { id: 'rmp-2', roleId: 'role-product-manager', modulePermissionId: 'perm-product-view', createdAt: new Date() },
  { id: 'rmp-3', roleId: 'role-product-manager', modulePermissionId: 'perm-product-create', createdAt: new Date() },
  { id: 'rmp-4', roleId: 'role-product-manager', modulePermissionId: 'perm-product-update', createdAt: new Date() },
  { id: 'rmp-5', roleId: 'role-product-manager', modulePermissionId: 'perm-product-delete', createdAt: new Date() },
  { id: 'rmp-6', roleId: 'role-product-manager', modulePermissionId: 'perm-disc-view', createdAt: new Date() },
  { id: 'rmp-7', roleId: 'role-product-manager', modulePermissionId: 'perm-disc-create', createdAt: new Date() },
  { id: 'rmp-8', roleId: 'role-product-manager', modulePermissionId: 'perm-pricing-view', createdAt: new Date() },
  { id: 'rmp-9', roleId: 'role-product-manager', modulePermissionId: 'perm-offer-view', createdAt: new Date() },
  { id: 'rmp-10', roleId: 'role-product-manager', modulePermissionId: 'perm-offer-create', createdAt: new Date() },
  { id: 'rmp-11', roleId: 'role-product-manager', modulePermissionId: 'perm-offer-update', createdAt: new Date() },
  { id: 'rmp-12', roleId: 'role-product-manager', modulePermissionId: 'perm-aff-view', createdAt: new Date() },
  { id: 'rmp-13', roleId: 'role-product-manager', modulePermissionId: 'perm-aff-create', createdAt: new Date() },
  // Customer permissions
  { id: 'rmp-c1', roleId: 'role-customer', modulePermissionId: 'perm-dashboard-view', createdAt: new Date() },
  { id: 'rmp-c2', roleId: 'role-customer', modulePermissionId: 'perm-product-view', createdAt: new Date() },
  { id: 'rmp-c3', roleId: 'role-customer', modulePermissionId: 'perm-offer-view', createdAt: new Date() },
  { id: 'rmp-c4', roleId: 'role-customer', modulePermissionId: 'perm-profile-view', createdAt: new Date() },
  { id: 'rmp-c5', roleId: 'role-customer', modulePermissionId: 'perm-profile-update', createdAt: new Date() },
  { id: 'rmp-c6', roleId: 'role-customer', modulePermissionId: 'perm-cart-view', createdAt: new Date() },
  { id: 'rmp-c7', roleId: 'role-customer', modulePermissionId: 'perm-cart-create', createdAt: new Date() },
  { id: 'rmp-c8', roleId: 'role-customer', modulePermissionId: 'perm-cart-update', createdAt: new Date() },
  { id: 'rmp-c9', roleId: 'role-customer', modulePermissionId: 'perm-cart-delete', createdAt: new Date() },
  { id: 'rmp-c10', roleId: 'role-customer', modulePermissionId: 'perm-wishlist-view', createdAt: new Date() },
  { id: 'rmp-c11', roleId: 'role-customer', modulePermissionId: 'perm-wishlist-create', createdAt: new Date() },
  { id: 'rmp-c12', roleId: 'role-customer', modulePermissionId: 'perm-wishlist-delete', createdAt: new Date() },
];

export const mockCategories = [
  { id: 'cat-electronics', name: 'Electronics', slug: 'electronics', description: 'Tech', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-mobiles', name: 'Mobile Phones', slug: 'mobiles', description: 'Phones', isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

export const mockMerchants = [
  { id: 'merch-amazon', name: 'Amazon India', slug: 'amazon', websiteUrl: 'https://www.amazon.in', affiliateNetwork: 'CUELINKS', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'merch-flipkart', name: 'Flipkart', slug: 'flipkart', websiteUrl: 'https://www.flipkart.com', affiliateNetwork: 'CUELINKS', isActive: true, createdAt: new Date(), updatedAt: new Date() },
];
