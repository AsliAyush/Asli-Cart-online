import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { setupTestEnvironment } from './testHelper.js';

let app: any;
let pmToken: string;
let custToken: string;
let adminToken: string;
let testStore: any;

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

describe('Super Admin Offer Approval, Rejection, and Publishing Module', () => {
  let createdProductId: string;

  beforeEach(async () => {
    const env = await setupTestEnvironment();
    pmToken = env.productManagerToken;
    custToken = env.customerToken;
    adminToken = env.superAdminToken;
    testStore = env.store;
    app = createApp();

    // Create a product to attach offers to
    const prodRes = await request(app)
      .post('/api/v1/product-manager/products')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        name: 'Apple iPad Air M2',
        categoryId: 'cat-electronics',
        mainImage: 'https://example.com/ipad.jpg',
        brand: 'Apple',
      });

    createdProductId = prodRes.body.data.id;

    // Set product status to PUBLISHED in store so customer offer tests can view it once published
    const prod = testStore.products.find((p: any) => p.id === createdProductId);
    if (prod) prod.status = 'PUBLISHED';
  });

  // Helper to create an offer
  async function createDraftOffer(title = 'iPad Deal') {
    const res = await request(app)
      .post('/api/v1/product-manager/offers')
      .set('Authorization', `Bearer ${pmToken}`)
      .send({
        productId: createdProductId,
        merchantId: 'merch-amazon',
        title,
        originalPrice: 59900,
        sellingPrice: 54900,
        currency: 'INR',
        originalUrl: 'https://www.amazon.in/dp/B0D1234567',
        availability: 'IN_STOCK',
      });
    return res.body.data.id;
  }

  it('1. Product Manager submission for approval transitions offer to PENDING_APPROVAL', async () => {
    const offerId = await createDraftOffer('PM Submit Test');

    const submitRes = await request(app)
      .patch(`/api/v1/product-manager/offers/${offerId}/submit-approval`)
      .set('Authorization', `Bearer ${pmToken}`);

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.success).toBe(true);
    expect(submitRes.body.data.status).toBe('PENDING_APPROVAL');
  });

  it('2. Super Admin approval transitions offer from PENDING_APPROVAL to APPROVED', async () => {
    const offerId = await createDraftOffer('Admin Approve Test');

    // Submit for review
    await request(app)
      .patch(`/api/v1/product-manager/offers/${offerId}/submit-approval`)
      .set('Authorization', `Bearer ${pmToken}`);

    // Super Admin approves
    const approveRes = await request(app)
      .patch(`/api/v1/admin/offers/${offerId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.success).toBe(true);
    expect(approveRes.body.data.status).toBe('APPROVED');
    expect(approveRes.body.data.rejectionReason).toBeNull();
  });

  it('3. Super Admin rejection transitions offer from PENDING_APPROVAL to REJECTED with reason', async () => {
    const offerId = await createDraftOffer('Admin Reject Test');

    // Submit for review
    await request(app)
      .patch(`/api/v1/product-manager/offers/${offerId}/submit-approval`)
      .set('Authorization', `Bearer ${pmToken}`);

    // Super Admin rejects
    const rejectRes = await request(app)
      .patch(`/api/v1/admin/offers/${offerId}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Selling price does not match current merchant listing.' });

    expect(rejectRes.status).toBe(200);
    expect(rejectRes.body.success).toBe(true);
    expect(rejectRes.body.data.status).toBe('REJECTED');
    expect(rejectRes.body.data.rejectionReason).toBe('Selling price does not match current merchant listing.');
  });

  it('4. Super Admin publishing transitions offer from APPROVED to PUBLISHED', async () => {
    const offerId = await createDraftOffer('Admin Publish Test');

    // PM submits
    await request(app)
      .patch(`/api/v1/product-manager/offers/${offerId}/submit-approval`)
      .set('Authorization', `Bearer ${pmToken}`);

    // Admin approves
    await request(app)
      .patch(`/api/v1/admin/offers/${offerId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    // Admin publishes
    const publishRes = await request(app)
      .patch(`/api/v1/admin/offers/${offerId}/publish`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(publishRes.status).toBe(200);
    expect(publishRes.body.success).toBe(true);
    expect(publishRes.body.data.status).toBe('PUBLISHED');
  });

  it('5. Product Manager attempting to approve is blocked with 403 Forbidden', async () => {
    const offerId = await createDraftOffer('PM Unauthorized Approve');

    await request(app)
      .patch(`/api/v1/product-manager/offers/${offerId}/submit-approval`)
      .set('Authorization', `Bearer ${pmToken}`);

    const res = await request(app)
      .patch(`/api/v1/admin/offers/${offerId}/approve`)
      .set('Authorization', `Bearer ${pmToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('6. Customer attempting to approve is blocked with 403 Forbidden', async () => {
    const offerId = await createDraftOffer('Customer Unauthorized Approve');

    const res = await request(app)
      .patch(`/api/v1/admin/offers/${offerId}/approve`)
      .set('Authorization', `Bearer ${custToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('7. Publishing a DRAFT offer directly is rejected with 400 Bad Request', async () => {
    const offerId = await createDraftOffer('Draft Publish Block Test');

    const res = await request(app)
      .patch(`/api/v1/admin/offers/${offerId}/publish`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Offer must be APPROVED by Admin before publishing');
  });

  it('8. Publishing a REJECTED offer directly is rejected with 400 Bad Request', async () => {
    const offerId = await createDraftOffer('Rejected Publish Block Test');

    // PM submits
    await request(app)
      .patch(`/api/v1/product-manager/offers/${offerId}/submit-approval`)
      .set('Authorization', `Bearer ${pmToken}`);

    // Admin rejects
    await request(app)
      .patch(`/api/v1/admin/offers/${offerId}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Invalid affiliate parameters' });

    // Attempt to publish rejected offer
    const res = await request(app)
      .patch(`/api/v1/admin/offers/${offerId}/publish`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Offer must be APPROVED by Admin before publishing');
  });

  it('9. Invalid state transitions - cannot approve offer not in PENDING_APPROVAL', async () => {
    const offerId = await createDraftOffer('Draft Direct Approve');

    // Attempt to approve DRAFT offer directly
    const res = await request(app)
      .patch(`/api/v1/admin/offers/${offerId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Only offers in PENDING_APPROVAL can be approved');
  });

  it('10. Public API hiding unpublished offers - customer cannot see DRAFT, PENDING, or REJECTED offers', async () => {
    const offerId = await createDraftOffer('Public Visibility Test Deal');

    // 1. DRAFT state: Customer checks compare and single offer endpoint
    let compareRes = await request(app)
      .get(`/api/v1/customer/offers/compare/${createdProductId}`);
    expect(compareRes.status).toBe(200);
    expect(compareRes.body.data.offers).toHaveLength(0);

    let getOfferRes = await request(app)
      .get(`/api/v1/customer/offers/${offerId}`);
    expect(getOfferRes.status).toBe(404);

    // 2. PENDING_APPROVAL state: Customer still cannot see it
    await request(app)
      .patch(`/api/v1/product-manager/offers/${offerId}/submit-approval`)
      .set('Authorization', `Bearer ${pmToken}`);

    compareRes = await request(app)
      .get(`/api/v1/customer/offers/compare/${createdProductId}`);
    expect(compareRes.body.data.offers).toHaveLength(0);

    getOfferRes = await request(app)
      .get(`/api/v1/customer/offers/${offerId}`);
    expect(getOfferRes.status).toBe(404);

    // 3. APPROVED state: Still not public until PUBLISHED
    await request(app)
      .patch(`/api/v1/admin/offers/${offerId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    compareRes = await request(app)
      .get(`/api/v1/customer/offers/compare/${createdProductId}`);
    expect(compareRes.body.data.offers).toHaveLength(0);

    getOfferRes = await request(app)
      .get(`/api/v1/customer/offers/${offerId}`);
    expect(getOfferRes.status).toBe(404);

    // 4. PUBLISHED state: Now visible to customer on both compare and detail endpoints!
    await request(app)
      .patch(`/api/v1/admin/offers/${offerId}/publish`)
      .set('Authorization', `Bearer ${adminToken}`);

    compareRes = await request(app)
      .get(`/api/v1/customer/offers/compare/${createdProductId}`);
    expect(compareRes.body.data.offers).toHaveLength(1);
    expect(compareRes.body.data.offers[0].id).toBe(offerId);

    getOfferRes = await request(app)
      .get(`/api/v1/customer/offers/${offerId}`);
    expect(getOfferRes.status).toBe(200);
    expect(getOfferRes.body.data.id).toBe(offerId);
    expect(getOfferRes.body.data.title).toBe('Public Visibility Test Deal');
  });

  it('11. Audit log creation records events for submit, approve, reject, and publish', async () => {
    const offerId = await createDraftOffer('Audit Log Verification Offer');

    // 1. Submit
    await request(app)
      .patch(`/api/v1/product-manager/offers/${offerId}/submit-approval`)
      .set('Authorization', `Bearer ${pmToken}`);

    // 2. Reject
    await request(app)
      .patch(`/api/v1/admin/offers/${offerId}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Audit test reason' });

    // 3. Resubmit
    await request(app)
      .patch(`/api/v1/product-manager/offers/${offerId}/submit-approval`)
      .set('Authorization', `Bearer ${pmToken}`);

    // 4. Approve
    await request(app)
      .patch(`/api/v1/admin/offers/${offerId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    // 5. Publish
    await request(app)
      .patch(`/api/v1/admin/offers/${offerId}/publish`)
      .set('Authorization', `Bearer ${adminToken}`);

    // Verify audit logs in test store
    const offerAuditLogs = testStore.auditLogs.filter((l: any) => l.entityId === offerId);
    const actions = offerAuditLogs.map((l: any) => l.action);

    expect(actions).toContain('offer.submit_approval');
    expect(actions).toContain('offer.reject');
    expect(actions).toContain('offer.approve');
    expect(actions).toContain('offer.publish');

    const rejectLog = offerAuditLogs.find((l: any) => l.action === 'offer.reject');
    expect(rejectLog.metadata.rejectionReason).toBe('Audit test reason');
  });

  it('12. Super Admin can list and view offers through GET /api/v1/admin/offers', async () => {
    const offerId = await createDraftOffer('Admin List Test');

    const listRes = await request(app)
      .get('/api/v1/admin/offers')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(listRes.body.data.items.length).toBeGreaterThan(0);

    const getRes = await request(app)
      .get(`/api/v1/admin/offers/${offerId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.success).toBe(true);
    expect(getRes.body.data.id).toBe(offerId);
  });
});

