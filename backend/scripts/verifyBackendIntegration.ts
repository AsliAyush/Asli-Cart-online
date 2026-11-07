import supertest from 'supertest';
import { createApp } from '../src/app.js';
import prisma from '../src/infra/database/prisma.js';
import { env } from '../src/config/env.js';
import { ROLES } from '../src/constants/roles.js';

interface VerificationResult {
  step: string;
  status: 'PASS' | 'FAIL';
  details?: string;
  durationMs?: number;
}

const results: VerificationResult[] = [];

function record(step: string, passed: boolean, details?: string, start?: number) {
  const durationMs = start ? Date.now() - start : undefined;
  results.push({
    step,
    status: passed ? 'PASS' : 'FAIL',
    details,
    durationMs,
  });
  const symbol = passed ? '✅' : '❌';
  console.log(`${symbol} [${passed ? 'PASS' : 'FAIL'}] ${step}${details ? ` - ${details}` : ''}${durationMs !== undefined ? ` (${durationMs}ms)` : ''}`);
}

async function runComprehensiveVerification() {
  console.log('========================================================================');
  console.log('🚀 ASLICART BACKEND INTEGRATION & VERIFICATION RUNNER');
  console.log('========================================================================\n');

  const app = createApp();
  const request = supertest(app);

  // Tracking entities for targeted, non-destructive cleanup
  const cleanupIds = {
    userIds: [] as string[],
    productIds: [] as string[],
    offerIds: [] as string[],
    clickIds: [] as string[],
  };

  try {
    // ========================================================================
    // PHASE 2: REAL NEON DATABASE VERIFICATION
    // ========================================================================
    console.log('\n--- PHASE 2: REAL NEON DATABASE VERIFICATION ---');

    // 1. Connectivity test
    const t0 = Date.now();
    try {
      const dbCheck = await prisma.$queryRaw<Array<{ connected: number }>>`SELECT 1 as connected`;
      const isConnected = Array.isArray(dbCheck) && dbCheck.length > 0 && dbCheck[0].connected === 1;
      record('Neon DB Connectivity (SELECT 1)', isConnected, 'Connection active via Neon connection pool', t0);
    } catch (err: any) {
      record('Neon DB Connectivity (SELECT 1)', false, err.message, t0);
      throw err;
    }

    // 2. Table count & existence check
    const t1 = Date.now();
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    const tableNames = tables.map((t) => t.table_name);
    const expectedTables = [
      '_prisma_migrations', 'users', 'roles', 'modules', 'module_permissions',
      'role_module_permissions', 'refresh_tokens', 'audit_logs', 'categories',
      'merchants', 'products', 'offers', 'price_histories', 'affiliate_links',
      'discovered_products', 'carts', 'cart_items', 'wishlists', 'wishlist_items',
      'affiliate_clicks'
    ];
    const missingTables = expectedTables.filter((t) => !tableNames.includes(t));
    record(
      'Neon DB Schema Tables Existence',
      missingTables.length === 0,
      `Found ${tableNames.length} tables. Missing: ${missingTables.length > 0 ? missingTables.join(', ') : 'None'}`,
      t1
    );

    // 3. Roles verification
    const t2 = Date.now();
    const existingRoles = await prisma.role.findMany({ select: { name: true, isSystem: true } });
    const roleNames = existingRoles.map((r) => r.name);
    const requiredRoles = [ROLES.SUPER_ADMIN, ROLES.PRODUCT_MANAGER, ROLES.SOCIAL_MEDIA_MANAGER, ROLES.CUSTOMER];
    const missingRoles = requiredRoles.filter((r) => !roleNames.includes(r));
    record(
      'System Roles Seeded in Neon',
      missingRoles.length === 0,
      `Roles found: ${roleNames.join(', ')}`,
      t2
    );

    // 4. Modules & permissions verification
    const t3 = Date.now();
    const moduleCount = await prisma.module.count();
    const permCount = await prisma.modulePermission.count();
    const rolePermCount = await prisma.roleModulePermission.count();
    record(
      'Modules & Permissions Seeded',
      moduleCount >= 7 && permCount >= 20,
      `Modules: ${moduleCount}, Permissions: ${permCount}, Role-Permission Mappings: ${rolePermCount}`,
      t3
    );

    // 5. Super Admin Bootstrap verification
    const t4 = Date.now();
    const superAdmin = await prisma.user.findFirst({
      where: {
        role: { name: ROLES.SUPER_ADMIN },
        isActive: true,
      },
      include: { role: true },
    });
    record(
      'Super Admin Bootstrap User Exists',
      Boolean(superAdmin && superAdmin.role.name === ROLES.SUPER_ADMIN),
      superAdmin ? `Super Admin verified: ${superAdmin.email}` : 'No super admin found',
      t4
    );

    // 6. Base Categories & Merchants check
    const t5 = Date.now();
    const categoryCount = await prisma.category.count();
    const merchantCount = await prisma.merchant.count();
    record(
      'Base Categories & Merchants Seeded',
      categoryCount >= 5 && merchantCount >= 5,
      `Categories: ${categoryCount}, Merchants: ${merchantCount}`,
      t5
    );

    // ========================================================================
    // PHASE 3: REAL API SMOKE TESTS (HTTP via Express & Neon DB)
    // ========================================================================
    console.log('\n--- PHASE 3: REAL API SMOKE TESTS ---');

    // --- A. ADMIN SMOKE TESTS ---
    const adminEmail = env.ADMIN_BOOTSTRAP_EMAIL;
    const adminPassword = env.ADMIN_BOOTSTRAP_PASSWORD;
    let adminAccessToken = '';

    const tAdminLogin = Date.now();
    const adminLoginRes = await request.post('/api/v1/admin/auth/login').send({
      email: adminEmail,
      password: adminPassword,
    });
    const retrievedAdminToken = adminLoginRes.body?.data?.accessToken || adminLoginRes.body?.data?.tokens?.accessToken;
    if (adminLoginRes.status === 200 && retrievedAdminToken) {
      adminAccessToken = retrievedAdminToken;
      record('Admin API: Login with bootstrap credentials', true, 'Access token generated', tAdminLogin);
    } else {
      record('Admin API: Login with bootstrap credentials', false, `Status ${adminLoginRes.status}: ${JSON.stringify(adminLoginRes.body)}`, tAdminLogin);
    }

    // Admin Profile
    const tAdminMe = Date.now();
    const adminMeRes = await request
      .get('/api/v1/admin/auth/me')
      .set('Authorization', `Bearer ${adminAccessToken}`);
    record(
      'Admin API: GET /api/v1/admin/auth/me',
      adminMeRes.status === 200 && adminMeRes.body?.data?.roleName === ROLES.SUPER_ADMIN,
      `Admin ID: ${adminMeRes.body?.data?.id}, Role: ${adminMeRes.body?.data?.roleName}`,
      tAdminMe
    );

    // Admin List Users
    const tAdminUsers = Date.now();
    const adminUsersRes = await request
      .get('/api/v1/admin/users?page=1&limit=10')
      .set('Authorization', `Bearer ${adminAccessToken}`);
    record(
      'Admin API: GET /api/v1/admin/users (List Users)',
      adminUsersRes.status === 200 && Array.isArray(adminUsersRes.body?.data?.items),
      `Total users: ${adminUsersRes.body?.data?.total || adminUsersRes.body?.data?.items?.length}`,
      tAdminUsers
    );

    // Admin List Audit Logs (verifying newly wired route)
    const tAdminAudit = Date.now();
    const adminAuditRes = await request
      .get('/api/v1/admin/audit-logs?page=1&limit=5')
      .set('Authorization', `Bearer ${adminAccessToken}`);
    record(
      'Admin API: GET /api/v1/admin/audit-logs (Audit Trail)',
      adminAuditRes.status === 200 && Array.isArray(adminAuditRes.body?.data?.items),
      `Logs retrieved: ${adminAuditRes.body?.data?.items?.length}`,
      tAdminAudit
    );

    // --- B. PRODUCT MANAGER SMOKE TESTS ---
    const pmRole = await prisma.role.findUnique({ where: { name: ROLES.PRODUCT_MANAGER } });
    if (!pmRole) throw new Error('Product Manager role not found');

    const testPmEmail = `test.pm.${Date.now()}@aslicart.verify`;
    const bcrypt = await import('bcrypt');
    const pmPasswordHash = await bcrypt.default.hash('PmPassword@123', 10);

    const testPmUser = await prisma.user.create({
      data: {
        email: testPmEmail,
        passwordHash: pmPasswordHash,
        fullName: 'Test ProductManager',
        roleId: pmRole.id,
        isActive: true,
      },
    });
    cleanupIds.userIds.push(testPmUser.id);

    // PM Login
    const tPmLogin = Date.now();
    const pmLoginRes = await request.post('/api/v1/admin/auth/login').send({
      email: testPmEmail,
      password: 'PmPassword@123',
    });
    const pmAccessToken = pmLoginRes.body?.data?.accessToken || pmLoginRes.body?.data?.tokens?.accessToken;
    record(
      'Product Manager API: Login',
      pmLoginRes.status === 200 && Boolean(pmAccessToken),
      `PM User ID: ${testPmUser.id}`,
      tPmLogin
    );

    // Get an existing seeded category & merchant
    const seedCategory = await prisma.category.findFirst();
    const seedMerchant = await prisma.merchant.findFirst();
    if (!seedCategory || !seedMerchant) throw new Error('Seeded categories or merchants missing');

    // PM: Create a Product
    const tPmCreateProduct = Date.now();
    const testProductSlug = `test-verify-headphones-${Date.now()}`;
    const createProductRes = await request
      .post('/api/v1/product-manager/products')
      .set('Authorization', `Bearer ${pmAccessToken}`)
      .send({
        name: '[TEST-VERIFY] Wireless Noise-Cancelling Headphones',
        slug: testProductSlug,
        brand: 'AsliAudio',
        categoryId: seedCategory.id,
        description: 'Test product for backend integration verification',
        mainImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        specifications: { color: 'Black', bluetooth: '5.3' },
      });
    const createdProduct = createProductRes.body?.data;
    if (createdProduct?.id) cleanupIds.productIds.push(createdProduct.id);
    record(
      'Product Manager API: Create Product',
      createProductRes.status === 201 && Boolean(createdProduct?.id),
      `Product ID: ${createdProduct?.id}, Initial Status: ${createdProduct?.status}`,
      tPmCreateProduct
    );

    // PM: Create a Merchant Offer
    const tPmCreateOffer = Date.now();
    const createOfferRes = await request
      .post('/api/v1/product-manager/offers')
      .set('Authorization', `Bearer ${pmAccessToken}`)
      .send({
        productId: createdProduct.id,
        merchantId: seedMerchant.id,
        title: '[TEST-VERIFY] Amazon 40% Off Deal',
        originalPrice: 4999,
        sellingPrice: 2999,
        currency: 'INR',
        originalUrl: 'https://www.amazon.in/dp/B0TESTVERIFY',
        availability: 'IN_STOCK',
      });
    const createdOffer = createOfferRes.body?.data;
    if (createdOffer?.id) cleanupIds.offerIds.push(createdOffer.id);
    record(
      'Product Manager API: Create Merchant Offer',
      createOfferRes.status === 201 && Boolean(createdOffer?.id),
      `Offer ID: ${createdOffer?.id}, Initial Status: ${createdOffer?.status}`,
      tPmCreateOffer
    );

    // PM: Submit Offer for Approval
    const tPmSubmitApproval = Date.now();
    const submitApprovalRes = await request
      .patch(`/api/v1/product-manager/offers/${createdOffer.id}/submit-approval`)
      .set('Authorization', `Bearer ${pmAccessToken}`);
    record(
      'Product Manager API: Submit Offer for Approval',
      submitApprovalRes.status === 200 && submitApprovalRes.body?.data?.status === 'PENDING_APPROVAL',
      `Updated Status: ${submitApprovalRes.body?.data?.status}`,
      tPmSubmitApproval
    );

    // PM: Verify Unauthorized Direct Publishing is Rejected
    const tPmDirectPublish = Date.now();
    const unauthorizedPublishRes = await request
      .patch(`/api/v1/product-manager/offers/${createdOffer.id}/status`)
      .set('Authorization', `Bearer ${pmAccessToken}`)
      .send({ status: 'PUBLISHED' });
    record(
      'Product Manager API: Unauthorized Direct Publishing Rejected',
      unauthorizedPublishRes.status === 400 || unauthorizedPublishRes.status === 403,
      `Status code: ${unauthorizedPublishRes.status} (Properly blocked by schema validation)`,
      tPmDirectPublish
    );

    // Publish product & offer for downstream customer discovery flow
    await prisma.product.update({
      where: { id: createdProduct.id },
      data: { status: 'PUBLISHED' },
    });
    await prisma.offer.update({
      where: { id: createdOffer.id },
      data: {
        status: 'PUBLISHED',
        affiliateUrl: 'https://www.amazon.in/dp/B0TESTVERIFY?tag=aslicart-21',
      },
    });

    // Create an AffiliateLink for this offer so redirect resolution succeeds
    await prisma.affiliateLink.create({
      data: {
        offerId: createdOffer.id,
        originalUrl: 'https://www.amazon.in/dp/B0TESTVERIFY',
        affiliateUrl: 'https://www.amazon.in/dp/B0TESTVERIFY?tag=aslicart-21',
        createdById: testPmUser.id,
      },
    });

    // --- C. CUSTOMER SMOKE TESTS ---
    const testCustomerEmail = `test.customer.${Date.now()}@aslicart.verify`;
    const customerPassword = 'CustomerSecurePassword@123';

    // 1. Customer Registration
    const tCustReg = Date.now();
    const customerRegRes = await request.post('/api/v1/customer/auth/register').send({
      email: testCustomerEmail,
      password: customerPassword,
      fullName: 'Integration Tester',
      phone: '+919876543210',
    });
    const customerData = customerRegRes.body?.data?.user;
    const customerToken = customerRegRes.body?.data?.accessToken;
    if (customerData?.id) cleanupIds.userIds.push(customerData.id);
    record(
      'Customer API: Register Customer Account',
      customerRegRes.status === 201 && Boolean(customerToken),
      `Customer ID: ${customerData?.id}`,
      tCustReg
    );

    // 2. Customer Profile
    const tCustProfile = Date.now();
    const customerProfileRes = await request
      .get('/api/v1/customer/profile')
      .set('Authorization', `Bearer ${customerToken}`);
    record(
      'Customer API: GET /api/v1/customer/profile',
      customerProfileRes.status === 200 && customerProfileRes.body?.data?.email === testCustomerEmail,
      `Email: ${customerProfileRes.body?.data?.email}, Phone: ${customerProfileRes.body?.data?.phone}`,
      tCustProfile
    );

    // 3. Browse Products (Public endpoint)
    const tCustProducts = Date.now();
    const custProductsRes = await request.get('/api/v1/customer/products?page=1&limit=10');
    const foundTestProduct = custProductsRes.body?.data?.items?.some((p: any) => p.id === createdProduct.id);
    record(
      'Customer API: Public Product Catalog Browsing',
      custProductsRes.status === 200 && Array.isArray(custProductsRes.body?.data?.items) && foundTestProduct,
      `Items returned: ${custProductsRes.body?.data?.items?.length}, Published test product visible: ${foundTestProduct}`,
      tCustProducts
    );

    // 4. Compare Offers for Product
    const tCustOffers = Date.now();
    const custOffersRes = await request.get(`/api/v1/customer/offers/compare/${createdProduct.id}`);
    record(
      'Customer API: Compare Offers for Product',
      custOffersRes.status === 200 && Array.isArray(custOffersRes.body?.data?.offers) && custOffersRes.body.data.offers.length > 0,
      `Offers compared: ${custOffersRes.body?.data?.offers?.length}, Lowest Price: ₹${custOffersRes.body?.data?.priceSummary?.minPrice}`,
      tCustOffers
    );

    // 5. Add to Cart
    const tCustAddToCart = Date.now();
    const addToCartRes = await request
      .post('/api/v1/customer/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        offerId: createdOffer.id,
        quantity: 1,
      });
    const cartItemId = addToCartRes.body?.data?.id;
    record(
      'Customer API: Add Offer to Cart',
      addToCartRes.status === 201 && Boolean(cartItemId),
      `Cart Item ID: ${cartItemId}, Offer ID: ${addToCartRes.body?.data?.offerId}`,
      tCustAddToCart
    );

    // 6. View Cart
    const tCustViewCart = Date.now();
    const viewCartRes = await request
      .get('/api/v1/customer/cart')
      .set('Authorization', `Bearer ${customerToken}`);
    record(
      'Customer API: View Shopping Cart',
      viewCartRes.status === 200 && viewCartRes.body?.data?.items?.length > 0,
      `Cart Subtotal: ₹${viewCartRes.body?.data?.subtotal}`,
      tCustViewCart
    );

    // 7. Update Item Quantity in Cart
    const tCustUpdateCart = Date.now();
    const updateCartRes = await request
      .patch(`/api/v1/customer/cart/items/${cartItemId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: 3 });
    record(
      'Customer API: Update Item Quantity in Cart',
      updateCartRes.status === 200 && updateCartRes.body?.data?.quantity === 3,
      `Updated Quantity: ${updateCartRes.body?.data?.quantity}`,
      tCustUpdateCart
    );

    // 8. Add Product to Wishlist
    const tCustAddWishlist = Date.now();
    const addWishlistRes = await request
      .post('/api/v1/customer/wishlist/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId: createdProduct.id,
      });
    const wishlistItemId = addWishlistRes.body?.data?.item?.itemId || addWishlistRes.body?.data?.id;
    record(
      'Customer API: Add Product to Wishlist',
      addWishlistRes.status === 201 && Boolean(wishlistItemId),
      `Wishlist Item ID: ${wishlistItemId}`,
      tCustAddWishlist
    );

    // 9. View Wishlist
    const tCustViewWishlist = Date.now();
    const viewWishlistRes = await request
      .get('/api/v1/customer/wishlist')
      .set('Authorization', `Bearer ${customerToken}`);
    record(
      'Customer API: View Wishlist',
      viewWishlistRes.status === 200 && viewWishlistRes.body?.data?.items?.length >= 1,
      `Wishlist Items: ${viewWishlistRes.body?.data?.items?.length}`,
      tCustViewWishlist
    );

    // 10. Trigger Merchant Redirect from Cart
    const tCustRedirect = Date.now();
    const merchantRedirectRes = await request
      .post('/api/v1/customer/cart/merchant-redirect')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        offerId: createdOffer.id,
        source: 'cart',
      });
    const clickRef = merchantRedirectRes.body?.data?.clickReference;
    const redirectPath = merchantRedirectRes.body?.data?.redirectPath;
    record(
      'Customer API: Trigger Merchant Redirect for Deal',
      merchantRedirectRes.status === 200 && Boolean(clickRef) && Boolean(redirectPath),
      `Generated Click Reference: ${clickRef}`,
      tCustRedirect
    );

    // 11. Resolve Redirect & Click Attribution Tracking
    const tResolveRedirect = Date.now();
    const resolveRedirectRes = await request.get(`/api/v1/customer/redirect/${clickRef}?format=json`);
    record(
      'Customer API: Resolve Outbound Redirect with Attribution',
      resolveRedirectRes.status === 200 && resolveRedirectRes.body?.data?.destinationUrl?.includes('amazon.in'),
      `Destination: ${resolveRedirectRes.body?.data?.destinationUrl}`,
      tResolveRedirect
    );

    // 12. Verify Click Tracking in Neon DB
    const tDbClick = Date.now();
    const clickRecord = await prisma.affiliateClick.findFirst({
      where: { clickReference: clickRef },
    });
    if (clickRecord?.id) cleanupIds.clickIds.push(clickRecord.id);
    record(
      'Affiliate Click Tracking Record Persisted in Neon DB',
      Boolean(clickRecord && clickRecord.customerId === customerData.id),
      `Stored Click ID: ${clickRecord?.id}, Customer ID Match: ${clickRecord?.customerId === customerData.id}`,
      tDbClick
    );

    // ========================================================================
    // PHASE 4: AUTHORIZATION AND SECURITY VERIFICATION
    // ========================================================================
    console.log('\n--- PHASE 4: AUTHORIZATION & SECURITY GUARDS VERIFICATION ---');

    // 1. Guest accessing protected route (Cart) -> 401
    const tGuestCart = Date.now();
    const guestCartRes = await request.get('/api/v1/customer/cart');
    record(
      'Security: Guest accessing protected route (/customer/cart) rejected with 401',
      guestCartRes.status === 401,
      `Response status: ${guestCartRes.status}`,
      tGuestCart
    );

    // 2. Customer accessing Admin route -> 403
    const tCustAdmin = Date.now();
    const custAdminRes = await request
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${customerToken}`);
    record(
      'Security: Customer accessing Admin route (/admin/users) rejected with 403',
      custAdminRes.status === 403,
      `Response status: ${custAdminRes.status}`,
      tCustAdmin
    );

    // 3. Customer accessing Product Manager route -> 403
    const tCustPm = Date.now();
    const custPmRes = await request
      .post('/api/v1/product-manager/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        name: 'Malicious Product',
        categoryId: seedCategory.id,
        mainImage: 'https://evil.com/img.png',
      });
    record(
      'Security: Customer accessing PM route (/product-manager/products) rejected with 403',
      custPmRes.status === 403,
      `Response status: ${custPmRes.status}`,
      tCustPm
    );

    // 4. IDOR Protection: Customer B trying to modify Customer A's cart item -> 404/403
    const customerBRegRes = await request.post('/api/v1/customer/auth/register').send({
      email: `customer.b.${Date.now()}@aslicart.verify`,
      password: 'CustomerBPassword@123',
      fullName: 'Customer B',
    });
    const customerBToken = customerBRegRes.body?.data?.accessToken;
    if (customerBRegRes.body?.data?.user?.id) cleanupIds.userIds.push(customerBRegRes.body.data.user.id);

    const tIdorCart = Date.now();
    const idorCartRes = await request
      .patch(`/api/v1/customer/cart/items/${cartItemId}`)
      .set('Authorization', `Bearer ${customerBToken}`)
      .send({ quantity: 99 });
    record(
      'Security: IDOR Prevention on Cart Item Modification',
      idorCartRes.status === 404 || idorCartRes.status === 403,
      `Customer B update Customer A item status: ${idorCartRes.status}`,
      tIdorCart
    );

    // 5. Product Manager cannot grant Super Admin role -> 403
    const tPmRoleGrant = Date.now();
    const pmGrantRes = await request
      .post('/api/v1/admin/users')
      .set('Authorization', `Bearer ${pmAccessToken}`)
      .send({ email: 'fakeadmin@aslicart.com' });
    record(
      'Security: Product Manager cannot access Admin User Management',
      pmGrantRes.status === 403,
      `PM access to /admin/users status: ${pmGrantRes.status}`,
      tPmRoleGrant
    );

    // 6. Unpublished/Draft Products Hidden from Customer Browsing
    const tDraftHidden = Date.now();
    const draftProductSlug = `draft-product-${Date.now()}`;
    const draftProduct = await prisma.product.create({
      data: {
        name: '[TEST-VERIFY] Unpublished Draft Product',
        slug: draftProductSlug,
        status: 'DRAFT',
        categoryId: seedCategory.id,
        createdById: testPmUser.id,
        mainImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
      },
    });
    cleanupIds.productIds.push(draftProduct.id);

    const checkCatalogRes = await request.get('/api/v1/customer/products?search=Unpublished');
    const isDraftVisible = checkCatalogRes.body?.data?.items?.some((p: any) => p.id === draftProduct.id);
    record(
      'Security: Unpublished / Draft Products Hidden from Customer Catalog',
      !isDraftVisible,
      `Draft product returned in catalog: ${isDraftVisible ? 'YES (LEAK)' : 'NO (PROTECTED)'}`,
      tDraftHidden
    );

    // 7. Open Redirect Prevention: Invalid clickReference returns 404
    const tOpenRedirect = Date.now();
    const maliciousRedirectRes = await request.get('/api/v1/customer/redirect/malicious-random-ref-12345?format=json');
    record(
      'Security: Open Redirect Rejected (Arbitrary click reference rejected)',
      maliciousRedirectRes.status === 404,
      `Status for invalid click reference: ${maliciousRedirectRes.status}`,
      tOpenRedirect
    );

  } catch (err: any) {
    console.error('\n❌ Unhandled error during verification run:', err);
  } finally {
    // ========================================================================
    // SAFE CLEANUP: Delete only [TEST-VERIFY] entities created during this run
    // ========================================================================
    console.log('\n--- CLEANUP: Safely removing integration test artifacts ---');
    try {
      // 1. Delete affiliate clicks
      if (cleanupIds.clickIds.length > 0) {
        await prisma.affiliateClick.deleteMany({
          where: { id: { in: cleanupIds.clickIds } },
        });
        console.log(`🧹 Deleted ${cleanupIds.clickIds.length} test affiliate clicks`);
      }

      // 2. Delete cart items & carts for test users
      if (cleanupIds.userIds.length > 0) {
        await prisma.cartItem.deleteMany({
          where: { cart: { customerId: { in: cleanupIds.userIds } } },
        });
        await prisma.cart.deleteMany({
          where: { customerId: { in: cleanupIds.userIds } },
        });
        await prisma.wishlistItem.deleteMany({
          where: { wishlist: { customerId: { in: cleanupIds.userIds } } },
        });
        await prisma.wishlist.deleteMany({
          where: { customerId: { in: cleanupIds.userIds } },
        });
        await prisma.refreshToken.deleteMany({
          where: { userId: { in: cleanupIds.userIds } },
        });
        await prisma.auditLog.deleteMany({
          where: { actorUserId: { in: cleanupIds.userIds } },
        });
      }

      // 3. Delete affiliate links for test offers
      if (cleanupIds.offerIds.length > 0) {
        await prisma.affiliateLink.deleteMany({
          where: { offerId: { in: cleanupIds.offerIds } },
        });
        // 4. Delete price history
        await prisma.priceHistory.deleteMany({
          where: { offerId: { in: cleanupIds.offerIds } },
        });
        // 5. Delete offers
        await prisma.offer.deleteMany({
          where: { id: { in: cleanupIds.offerIds } },
        });
        console.log(`🧹 Deleted ${cleanupIds.offerIds.length} test offers`);
      }

      // 6. Delete products
      if (cleanupIds.productIds.length > 0) {
        await prisma.product.deleteMany({
          where: { id: { in: cleanupIds.productIds } },
        });
        console.log(`🧹 Deleted ${cleanupIds.productIds.length} test products`);
      }

      // 7. Delete test users
      if (cleanupIds.userIds.length > 0) {
        await prisma.user.deleteMany({
          where: { id: { in: cleanupIds.userIds } },
        });
        console.log(`🧹 Deleted ${cleanupIds.userIds.length} test users`);
      }

      console.log('✅ Targeted cleanup finished. Seed data and real accounts untouched.');
    } catch (cleanupErr: any) {
      console.error('⚠️ Cleanup encountered an error:', cleanupErr.message);
    } finally {
      await prisma.$disconnect();
    }
  }

  // Print summary report
  console.log('\n========================================================================');
  console.log('📊 VERIFICATION SUMMARY');
  console.log('========================================================================');
  const passedCount = results.filter((r) => r.status === 'PASS').length;
  const failedCount = results.filter((r) => r.status === 'FAIL').length;
  console.log(`Total Checks: ${results.length}`);
  console.log(`Passed:       ${passedCount}`);
  console.log(`Failed:       ${failedCount}`);
  console.log(`Success Rate: ${Math.round((passedCount / results.length) * 100)}%`);
  console.log('========================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runComprehensiveVerification();
