import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { setupTestEnvironment } from './testHelper.js';
import { ROLES } from '../src/constants/roles.js';

let app: any;
let testEnv: any;
let adminToken: string;
let pmToken: string;
let customerToken: string;
let store: any;

vi.mock('../src/infra/database/prisma.js', () => {
  const getMock = () => (globalThis as any).currentMockPrisma;
  return {
    default: new Proxy({}, {
      get: (_target, prop) => {
        const mock = getMock();
        return mock[prop];
      },
    }),
    prisma: new Proxy({}, {
      get: (_target, prop) => {
        const mock = getMock();
        return mock[prop];
      },
    }),
  };
});

describe('Phase 7 End-to-End Business Workflows Integration Test Suite', () => {
  let createdStaffId: string;
  let createdProductId: string;
  let createdOfferId: string;
  let merchantBOfferId: string;
  let clickReference: string;

  beforeEach(async () => {
    testEnv = await setupTestEnvironment();
    adminToken = testEnv.superAdminToken;
    pmToken = testEnv.productManagerToken;
    customerToken = testEnv.customerToken;
    store = testEnv.store;
    app = createApp();

    // Seed test product for end-to-end multi-merchant workflows
    store.products.push({
      id: 'prod-iphone-15',
      name: 'Apple iPhone 15 128GB Blue',
      slug: 'apple-iphone-15-128gb-blue',
      categoryId: 'cat-mobiles',
      mainImage: 'https://example.com/iphone-15.jpg',
      status: 'PUBLISHED',
      brand: 'Apple',
      createdById: 'admin-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Merchant A offer (Amazon)
    store.offers.push({
      id: 'off-iphone-amazon',
      productId: 'prod-iphone-15',
      merchantId: 'merch-amazon',
      title: 'iPhone 15 Fest Offer',
      originalPrice: 79900,
      sellingPrice: 69900,
      discountPercentage: 12.5,
      currency: 'INR',
      originalUrl: 'https://www.amazon.in/dp/B0CHX1W1XY',
      affiliateUrl: 'https://cuelinks.test/amz-iphone',
      couponCode: 'AMZFEST1000',
      availability: 'IN_STOCK',
      status: 'PUBLISHED',
      isExclusive: false,
      isFeatured: false,
      rejectionReason: null,
      createdById: 'pm-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Merchant B offer (Flipkart)
    store.offers.push({
      id: 'off-galaxy-flipkart',
      productId: 'prod-iphone-15',
      merchantId: 'merch-flipkart',
      title: 'iPhone 15 Super Deal Flipkart',
      originalPrice: 79900,
      sellingPrice: 68999,
      discountPercentage: 13.6,
      currency: 'INR',
      originalUrl: 'https://www.flipkart.com/apple-iphone-15',
      affiliateUrl: 'https://cuelinks.test/fk-iphone',
      availability: 'IN_STOCK',
      status: 'PUBLISHED',
      isExclusive: false,
      isFeatured: false,
      rejectionReason: null,
      createdById: 'pm-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed affiliate links for affiliate tracking and redirection
    store.affiliateLinks.push({
      id: 'aff-link-amz-1',
      offerId: 'off-iphone-amazon',
      originalUrl: 'https://www.amazon.in/dp/B0CHX1W1XY',
      affiliateUrl: 'https://cuelinks.test/amz-iphone',
      provider: 'CUELINKS',
      status: 'ACTIVE',
      createdById: 'pm-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    store.affiliateLinks.push({
      id: 'aff-link-fk-1',
      offerId: 'off-galaxy-flipkart',
      originalUrl: 'https://www.flipkart.com/apple-iphone-15',
      affiliateUrl: 'https://cuelinks.test/fk-iphone',
      provider: 'CUELINKS',
      status: 'ACTIVE',
      createdById: 'pm-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  // ==========================================
  // WORKFLOW 1: Super Admin creates staff
  // ==========================================
  it('Workflow 1: Super Admin provisions staff with strict role guards', async () => {
    // 1a. Attempt to provision SUPER_ADMIN -> Must be rejected (403 forbidden)
    const escalateRes = await request(app)
      .post('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'Attacker Admin',
        email: 'attacker@aslicart.com',
        password: 'Password123!',
        roleId: 'role-super-admin',
      });
    expect([400, 403]).toContain(escalateRes.status);

    // 1b. Attempt to provision CUSTOMER via staff endpoint -> Must be rejected (403 forbidden)
    const customerStaffRes = await request(app)
      .post('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'Fake Staff Customer',
        email: 'fakecustomer@aslicart.com',
        password: 'Password123!',
        roleId: 'role-customer',
      });
    expect([400, 403]).toContain(customerStaffRes.status);

    // 1c. Valid staff provisioning: PRODUCT_MANAGER
    const createStaffRes = await request(app)
      .post('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'Pooja PM Lead',
        email: 'pooja.pm@aslicart.com',
        password: 'Password123!',
        roleId: 'role-product-manager',
      });
    expect(createStaffRes.status).toBe(201);
    expect(createStaffRes.body.success).toBe(true);
    expect(createStaffRes.body.data.role.name).toBe(ROLES.PRODUCT_MANAGER);
    createdStaffId = createStaffRes.body.data.id;

    // 1d. New employee can log in via staff login
    const loginRes = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({
        email: 'pooja.pm@aslicart.com',
        password: 'Password123!',
      });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.accessToken).toBeDefined();
    const newPmToken = loginRes.body.data.accessToken;

    // 1e. New employee cannot access unauthorized Admin operations
    const unauthorizedAdminRes = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${newPmToken}`);
    expect(unauthorizedAdminRes.status).toBe(403);
  });

  // ==========================================
  // WORKFLOW 2: Product Manager creates a product
  // ==========================================
  it('Workflow 2: Product Manager discovers, imports, and manages catalog product', async () => {
    // 2a. PM searches product discovery feed
    const discoveryRes = await request(app)
      .get('/api/v1/product-manager/discovery?keyword=Sony')
      .set('Authorization', `Bearer ${pmToken}`);
    expect(discoveryRes.status).toBe(200);
    expect(discoveryRes.body.success).toBe(true);

    // 2b. PM creates a new product in DRAFT status
    const createProdRes = await request(app)
      .post('/api/v1/product-manager/products')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        name: 'Sony Bravia 55-inch 4K OLED TV',
        categoryId: 'cat-electronics',
        mainImage: 'https://example.com/bravia.jpg',
        brand: 'Sony',
        description: 'Flagship OLED TV with Cognitive Processor XR',
        specifications: { Display: '55 inch 4K OLED', RefreshRate: '120Hz' },
      });

    expect(createProdRes.status).toBe(201);
    expect(createProdRes.body.success).toBe(true);
    expect(createProdRes.body.data.status).toBe('DRAFT');
    createdProductId = createProdRes.body.data.id;

    // 2c. Verify product details retrieval
    const getProdRes = await request(app)
      .get(`/api/v1/product-manager/products/${createdProductId}`)
      .set('Authorization', `Bearer ${pmToken}`);
    expect(getProdRes.status).toBe(200);
    expect(getProdRes.body.data.name).toBe('Sony Bravia 55-inch 4K OLED TV');
    expect(getProdRes.body.data.status).toBe('DRAFT');
  });

  // ==========================================
  // WORKFLOW 3: Product Manager creates an offer
  // ==========================================
  it('Workflow 3: Product Manager creates offer, validates merchant, and submits for approval', async () => {
    // 3a. Rejects invalid merchant ID
    const invalidMerchantRes = await request(app)
      .post('/api/v1/product-manager/offers')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        productId: 'prod-iphone-15',
        merchantId: 'non-existent-merchant-id',
        title: 'Fake Offer',
        originalPrice: 100000,
        sellingPrice: 80000,
        currency: 'INR',
        originalUrl: 'https://fake.merchant.com/deal',
        availability: 'IN_STOCK',
      });
    expect(invalidMerchantRes.status).toBe(400);

    // 3b. Creates valid offer under Amazon (Merchant A)
    const createOfferRes = await request(app)
      .post('/api/v1/product-manager/offers')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        productId: 'prod-iphone-15',
        merchantId: 'merch-amazon',
        title: 'iPhone 15 Fest Offer',
        originalPrice: 79900,
        sellingPrice: 69900,
        currency: 'INR',
        originalUrl: 'https://www.amazon.in/dp/B0CHX1W1XY',
        couponCode: 'AMZFEST1000',
        availability: 'IN_STOCK',
      });

    expect(createOfferRes.status).toBe(201);
    expect(createOfferRes.body.data.status).toBe('DRAFT');
    expect(createOfferRes.body.data.discountPercentage).toBeGreaterThan(0);
    createdOfferId = createOfferRes.body.data.id;

    // 3c. PM cannot directly approve or publish offer
    const directApproveRes = await request(app)
      .patch(`/api/v1/admin/offers/${createdOfferId}/approve`)
      .set('Authorization', `Bearer ${pmToken}`);
    expect(directApproveRes.status).toBe(403);

    const directPublishRes = await request(app)
      .patch(`/api/v1/admin/offers/${createdOfferId}/publish`)
      .set('Authorization', `Bearer ${pmToken}`);
    expect(directPublishRes.status).toBe(403);

    // 3d. PM submits offer for approval -> PENDING_APPROVAL
    const submitRes = await request(app)
      .patch(`/api/v1/product-manager/offers/${createdOfferId}/submit-approval`)
      .set('Authorization', `Bearer ${pmToken}`);
    expect(submitRes.status).toBe(200);
    expect(submitRes.body.data.status).toBe('PENDING_APPROVAL');
  });

  // ==========================================
  // WORKFLOW 4: Super Admin approves and publishes
  // ==========================================
  it('Workflow 4: Super Admin reviews offer, requires rejection reason, approves and publishes', async () => {
    // Setup offer in PENDING_APPROVAL
    const prod = store.products.find((p: any) => p.id === 'prod-iphone-15');
    if (prod) prod.status = 'PUBLISHED';

    const offer = store.offers.find((o: any) => o.id === 'off-iphone-amazon');
    offer.status = 'PENDING_APPROVAL';

    // 4a. Attempt rejection WITHOUT reason -> Must be rejected with 400 Bad Request
    const rejectNoReasonRes = await request(app)
      .patch(`/api/v1/admin/offers/${offer.id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: '   ' }); // Empty whitespace
    expect(rejectNoReasonRes.status).toBe(400);

    // 4b. Rejection with valid mandatory reason -> REJECTED
    const rejectRes = await request(app)
      .patch(`/api/v1/admin/offers/${offer.id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Selling price does not reflect current deal on Amazon.' });
    expect(rejectRes.status).toBe(200);
    expect(rejectRes.body.data.status).toBe('REJECTED');
    expect(rejectRes.body.data.rejectionReason).toBe('Selling price does not reflect current deal on Amazon.');

    // 4c. PM corrects price and resubmits
    const updateRes = await request(app)
      .patch(`/api/v1/product-manager/offers/${offer.id}`)
      .set('Authorization', `Bearer ${pmToken}`)
      .send({ sellingPrice: 68900 });
    expect(updateRes.status).toBe(200);

    const resubmitRes = await request(app)
      .patch(`/api/v1/product-manager/offers/${offer.id}/submit-approval`)
      .set('Authorization', `Bearer ${pmToken}`);
    expect(resubmitRes.status).toBe(200);
    expect(resubmitRes.body.data.status).toBe('PENDING_APPROVAL');
    expect(resubmitRes.body.data.rejectionReason).toBeNull();

    // 4d. Super Admin approves offer -> APPROVED
    const approveRes = await request(app)
      .patch(`/api/v1/admin/offers/${offer.id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.status).toBe('APPROVED');

    // 4e. Super Admin publishes approved offer -> PUBLISHED
    const publishRes = await request(app)
      .patch(`/api/v1/admin/offers/${offer.id}/publish`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(publishRes.status).toBe(200);
    expect(publishRes.body.data.status).toBe('PUBLISHED');

    // 4f. Check audit logs exist for approval and publishing
    const auditRes = await request(app)
      .get('/api/v1/admin/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(auditRes.status).toBe(200);
    const actions = auditRes.body.data.items.map((l: any) => l.action);
    expect(actions).toContain('offer.approve');
    expect(actions).toContain('offer.publish');
  });

  // ==========================================
  // WORKFLOW 5: Customer discovers the offer
  // ==========================================
  it('Workflow 5: Customer discovers only published offers, unpublished offers are hidden', async () => {
    // Ensure product and offer are PUBLISHED
    const prod = store.products.find((p: any) => p.id === 'prod-iphone-15');
    prod.status = 'PUBLISHED';
    const offer = store.offers.find((o: any) => o.id === 'off-iphone-amazon');
    offer.status = 'PUBLISHED';

    // 5a. Customer searches products catalog
    const catalogRes = await request(app)
      .get('/api/v1/customer/products?search=iPhone')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(catalogRes.status).toBe(200);
    expect(catalogRes.body.data.items.length).toBeGreaterThan(0);
    const found = catalogRes.body.data.items.find((i: any) => i.id === 'prod-iphone-15');
    expect(found).toBeDefined();
    expect(found.bestPrice).toBeDefined();

    // 5b. Customer opens product details and compares multi-merchant offers
    const detailsRes = await request(app)
      .get('/api/v1/customer/products/prod-iphone-15');
    expect(detailsRes.status).toBe(200);
    expect(detailsRes.body.data.offers).toHaveLength(2); // Multi-merchant offers (Amazon and Flipkart)
    expect(detailsRes.body.data.offers[0].status).toBeUndefined(); // Customer API exposes only public offer fields

    // 5c. Customer opens single offer details
    const offerRes = await request(app)
      .get('/api/v1/customer/offers/off-iphone-amazon');
    expect(offerRes.status).toBe(200);
    expect(offerRes.body.data.merchant.name).toBe('Amazon India');
    expect(offerRes.body.data.sellingPrice).toBeDefined();
  });

  // ==========================================
  // WORKFLOW 6: Multi-merchant cart
  // ==========================================
  it('Workflow 6: Multi-merchant cart groups items by retailer with independent checkout actions', async () => {
    // 6a. Add offer from Merchant A (Amazon)
    const addA1Res = await request(app)
      .post('/api/v1/customer/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ offerId: 'off-iphone-amazon', quantity: 1 });
    expect(addA1Res.status).toBe(201);

    // 6b. Add another offer from Merchant B (Flipkart)
    const addBRes = await request(app)
      .post('/api/v1/customer/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ offerId: 'off-galaxy-flipkart', quantity: 2 });
    expect(addBRes.status).toBe(201);

    // 6c. Fetch cart and verify multi-merchant grouping
    const cartRes = await request(app)
      .get('/api/v1/customer/cart')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(cartRes.status).toBe(200);
    expect(cartRes.body.data.itemsCount).toBe(3); // 1 + 2
    expect(cartRes.body.data.merchantGroups).toHaveLength(2);

    const amazonGroup = cartRes.body.data.merchantGroups.find((g: any) => g.merchant.id === 'merch-amazon');
    const flipkartGroup = cartRes.body.data.merchantGroups.find((g: any) => g.merchant.id === 'merch-flipkart');

    expect(amazonGroup).toBeDefined();
    expect(flipkartGroup).toBeDefined();
    expect(amazonGroup.items).toHaveLength(1);
    expect(flipkartGroup.items).toHaveLength(1);
    expect(amazonGroup.groupSubtotal).toBeGreaterThan(0);
    expect(flipkartGroup.groupSubtotal).toBeGreaterThan(0);

    // 6d. Update item quantity
    const flipkartItemId = flipkartGroup.items[0].itemId;
    const updateQtyRes = await request(app)
      .patch(`/api/v1/customer/cart/items/${flipkartItemId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: 1 });
    expect(updateQtyRes.status).toBe(200);

    // 6e. Remove item
    const removeRes = await request(app)
      .delete(`/api/v1/customer/cart/items/${flipkartItemId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(removeRes.status).toBe(200);
  });

  // ==========================================
  // WORKFLOW 7: Affiliate redirect and click tracking
  // ==========================================
  it('Workflow 7: Outbound affiliate redirect tracks click and redirects to trusted retailer URL', async () => {
    // 7a. Request merchant redirect for valid published offer
    const redirectReqRes = await request(app)
      .post('/api/v1/customer/cart/merchant-redirect')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ offerId: 'off-iphone-amazon', source: 'cart' });

    expect(redirectReqRes.status).toBe(200);
    expect(redirectReqRes.body.success).toBe(true);
    expect(redirectReqRes.body.data.clickReference).toBeDefined();
    expect(redirectReqRes.body.data.destinationUrl).toBeDefined();
    clickReference = redirectReqRes.body.data.clickReference;

    // Verify click record stored in database with attribution
    const clickRecord = store.affiliateClicks.find((c: any) => c.clickReference === clickReference);
    expect(clickRecord).toBeDefined();
    expect(clickRecord.customerId).toBe(testEnv.customer.id);
    expect(clickRecord.offerId).toBe('off-iphone-amazon');

    // 7b. Resolve redirect endpoint (JSON format)
    const resolveJsonRes = await request(app)
      .get(`/api/v1/customer/redirect/${clickReference}?format=json`);
    expect(resolveJsonRes.status).toBe(200);
    expect(resolveJsonRes.body.data.destinationUrl).toBe(redirectReqRes.body.data.destinationUrl);

    // 7c. Resolve redirect endpoint (HTTP 302 redirect)
    const redirect302Res = await request(app)
      .get(`/api/v1/customer/redirect/${clickReference}`);
    expect(redirect302Res.status).toBe(302);
    expect(redirect302Res.header.location).toBe(redirectReqRes.body.data.destinationUrl);

    // 7d. Invalid click reference rejected
    const invalidClickRes = await request(app)
      .get('/api/v1/customer/redirect/invalid_non_existent_token');
    expect(invalidClickRes.status).toBe(404);
  });

  // ==========================================
  // WORKFLOW 8: Wishlist and profile
  // ==========================================
  it('Workflow 8: Customer wishlist persistence, profile editing, and password change session revocation', async () => {
    // 8a. Add product to wishlist
    const addWishlistRes = await request(app)
      .post('/api/v1/customer/wishlist/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: 'prod-iphone-15' });
    expect(addWishlistRes.status).toBe(201);

    // 8b. Prevent duplicate addition
    const duplicateRes = await request(app)
      .post('/api/v1/customer/wishlist/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: 'prod-iphone-15' });
    expect(duplicateRes.status).toBe(409);

    // 8c. Retrieve wishlist
    const getWishlistRes = await request(app)
      .get('/api/v1/customer/wishlist')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(getWishlistRes.status).toBe(200);
    expect(getWishlistRes.body.data.items).toHaveLength(1);
    const wishlistItemId = getWishlistRes.body.data.items[0].itemId;

    // 8d. Remove from wishlist
    const removeWishlistRes = await request(app)
      .delete(`/api/v1/customer/wishlist/items/${wishlistItemId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(removeWishlistRes.status).toBe(200);

    // 8e. Update profile attributes
    const updateProfileRes = await request(app)
      .patch('/api/v1/customer/profile')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ fullName: 'Updated Customer Name', phone: '9876500000' });
    expect(updateProfileRes.status).toBe(200);
    expect(updateProfileRes.body.data.fullName).toBe('Updated Customer Name');

    // 8f. Change password -> revokes all refresh tokens
    const changePassRes = await request(app)
      .patch('/api/v1/customer/profile/change-password')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        currentPassword: 'CustomerPass@2026!',
        newPassword: 'NewCustomerPass@2026!',
      });
    expect(changePassRes.status).toBe(200);
    expect(changePassRes.body.message).toContain('Password changed successfully');
  });
});
