import { vi } from 'vitest';
import { createMockStore, buildMockPrisma, MockStore } from './mockPrisma.js';
import { PasswordUtil } from '../src/utils/password.js';
import { JwtUtil } from '../src/utils/jwt.js';
import { ROLES } from '../src/constants/roles.js';

export async function setupTestEnvironment() {
  const store = createMockStore();
  (globalThis as any).currentMockPrisma = buildMockPrisma(store);

  // Seed Super Admin
  const adminPasswordHash = await PasswordUtil.hash('SuperAdmin@2026!');
  const superAdmin = {
    id: 'admin-1',
    fullName: 'Super Admin Test',
    email: 'admin@aslicart.com',
    passwordHash: adminPasswordHash,
    roleId: 'role-super-admin',
    isActive: true,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store.users.push(superAdmin);

  // Seed Product Manager
  const pmPasswordHash = await PasswordUtil.hash('ProductManager@2026!');
  const productManager = {
    id: 'pm-1',
    fullName: 'Product Manager Test',
    email: 'pm@aslicart.com',
    passwordHash: pmPasswordHash,
    roleId: 'role-product-manager',
    isActive: true,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store.users.push(productManager);

  // Seed Customer
  const custPasswordHash = await PasswordUtil.hash('CustomerPass@2026!');
  const customer = {
    id: 'cust-1',
    fullName: 'Customer Test',
    email: 'customer@aslicart.com',
    passwordHash: custPasswordHash,
    roleId: 'role-customer',
    isActive: true,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store.users.push(customer);

  const customerCart = {
    id: 'cart-cust-1',
    customerId: customer.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store.carts.push(customerCart);

  const customerWishlist = {
    id: 'wishlist-cust-1',
    customerId: customer.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store.wishlists.push(customerWishlist);

  const superAdminToken = JwtUtil.signAccessToken({
    userId: superAdmin.id,
    email: superAdmin.email,
    roleId: superAdmin.roleId,
    roleName: ROLES.SUPER_ADMIN,
  });

  const productManagerToken = JwtUtil.signAccessToken({
    userId: productManager.id,
    email: productManager.email,
    roleId: productManager.roleId,
    roleName: ROLES.PRODUCT_MANAGER,
  });

  const customerToken = JwtUtil.signAccessToken({
    userId: customer.id,
    email: customer.email,
    roleId: customer.roleId,
    roleName: ROLES.CUSTOMER,
  });

  return {
    store,
    superAdmin,
    productManager,
    customer,
    superAdminToken,
    productManagerToken,
    customerToken,
  };
}

