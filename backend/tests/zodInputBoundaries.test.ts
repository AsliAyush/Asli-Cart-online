import { describe, it, expect, vi } from 'vitest';
import {
  createProductSchema,
  updateProductSchema,
  productSpecificationsSchema,
  specificationValueSchema,
  preRecordSpecificationsCheck,
} from '../src/modules/product_manager/product/product.validator.js';
import { updateRolePermissionsSchema } from '../src/modules/admin/role/role.validator.js';
import { createOfferSchema } from '../src/modules/product_manager/offer/offer.validator.js';

describe('Phase 5.3 & 5.4: Zod Collection & Input Boundary Security QA', () => {
  describe('1. Array Length Boundaries', () => {
    it('ARRAY-01: accepts role permissionIds array up to maximum limit of 200', () => {
      const validPermissions = Array.from({ length: 200 }, (_, i) => `perm_${i + 1}`);
      const result = updateRolePermissionsSchema.safeParse({ permissionIds: validPermissions });
      expect(result.success).toBe(true);
    });

    it('ARRAY-02: rejects role permissionIds array exceeding limit of 200 items', () => {
      const oversizedPermissions = Array.from({ length: 201 }, (_, i) => `perm_${i + 1}`);
      const result = updateRolePermissionsSchema.safeParse({ permissionIds: oversizedPermissions });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/Cannot exceed 200 permissions/);
      }
    });

    it('ARRAY-03: rejects role permissionIds element exceeding 100 characters', () => {
      const longPermissionId = 'p'.repeat(101);
      const result = updateRolePermissionsSchema.safeParse({ permissionIds: [longPermissionId] });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/exceeds 100 characters/);
      }
    });

    it('ARRAY-04: accepts product additionalImages array up to maximum limit of 20', () => {
      const validImages = Array.from({ length: 20 }, (_, i) => `https://example.com/img_${i + 1}.jpg`);
      const payload = {
        name: 'Valid Product',
        categoryId: 'cat_123',
        mainImage: 'https://example.com/main.jpg',
        additionalImages: validImages,
      };
      const result = createProductSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('ARRAY-05: rejects product additionalImages array exceeding limit of 20 items', () => {
      const oversizedImages = Array.from({ length: 21 }, (_, i) => `https://example.com/img_${i + 1}.jpg`);
      const payload = {
        name: 'Valid Product',
        categoryId: 'cat_123',
        mainImage: 'https://example.com/main.jpg',
        additionalImages: oversizedImages,
      };
      const result = createProductSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/Cannot exceed 20 additional images/);
      }
    });
  });

  describe('2. Record & Specification Boundaries', () => {
    it('RECORD-01: accepts product specifications record up to maximum 100 entries', () => {
      const specs: Record<string, string> = {};
      for (let i = 0; i < 100; i++) {
        specs[`attribute_${i}`] = `value_${i}`;
      }
      const result = productSpecificationsSchema.safeParse(specs);
      expect(result.success).toBe(true);
    });

    it('RECORD-02: rejects product specifications record exceeding 100 entries', () => {
      const specs: Record<string, string> = {};
      for (let i = 0; i < 101; i++) {
        specs[`attribute_${i}`] = `value_${i}`;
      }
      const result = productSpecificationsSchema.safeParse(specs);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/cannot exceed 100 entries/);
      }
    });

    it('RECORD-INSTRUMENTED: proves 101 keys are rejected before downstream record/value parsing begins', () => {
      // In Zod pipelines, _def.out is the downstream schema (z.record).
      // We instrument its internal _parse method to verify it is never invoked on oversized input.
      const downstreamSchema = (productSpecificationsSchema as any)._def.out;
      const originalParse = downstreamSchema._parse.bind(downstreamSchema);
      let downstreamInvocationCount = 0;

      downstreamSchema._parse = function (...args: any[]) {
        downstreamInvocationCount++;
        return originalParse(...args);
      };

      try {
        // 1. Test oversized record (101 keys)
        const oversizedSpecs: Record<string, string> = {};
        for (let i = 0; i < 101; i++) {
          oversizedSpecs[`attr_${i}`] = `val_${i}`;
        }
        const failResult = productSpecificationsSchema.safeParse(oversizedSpecs);
        expect(failResult.success).toBe(false);
        expect(downstreamInvocationCount).toBe(0); // Proves zero downstream record parsing!

        // 2. Test valid record (100 keys)
        const validSpecs: Record<string, string> = {};
        for (let i = 0; i < 100; i++) {
          validSpecs[`attr_${i}`] = `val_${i}`;
        }
        const passResult = productSpecificationsSchema.safeParse(validSpecs);
        expect(passResult.success).toBe(true);
        expect(downstreamInvocationCount).toBe(1); // Downstream invoked only for valid payload
      } finally {
        downstreamSchema._parse = originalParse;
      }
    });

    it('RECORD-03: rejects specification key exceeding 100 characters', () => {
      const oversizedKey = 'k'.repeat(101);
      const specs = { [oversizedKey]: 'valid value' };
      const result = productSpecificationsSchema.safeParse(specs);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/cannot exceed 100 characters/);
      }
    });

    it('RECORD-04: rejects specification string value exceeding 1000 characters', () => {
      const oversizedValue = 'v'.repeat(1001);
      const specs = { 'RAM': oversizedValue };
      const result = productSpecificationsSchema.safeParse(specs);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/cannot exceed 1000 characters/);
      }
    });

    it('RECORD-05: accepts varied valid specification value types (string, number, boolean, string array)', () => {
      const validSpecs = {
        'RAM': '16GB DDR5',
        'Storage Capacity (GB)': 512,
        'Touchscreen': false,
        'Supported Codecs': ['AAC', 'LDAC', 'aptX'],
      };
      const result = productSpecificationsSchema.safeParse(validSpecs);
      expect(result.success).toBe(true);
    });

    it('RECORD-06: rejects nested objects inside specifications (prevents uncontrolled AST nesting)', () => {
      const nestedSpecs = {
        'Processor': {
          'Cores': 8,
          'Threads': 16,
        },
      };
      const result = productSpecificationsSchema.safeParse(nestedSpecs);
      expect(result.success).toBe(false);
    });

    it('RECORD-07: rejects specification list value with more than 20 items', () => {
      const longList = Array.from({ length: 21 }, (_, i) => `item_${i}`);
      const specs = { 'Features': longList };
      const result = productSpecificationsSchema.safeParse(specs);
      expect(result.success).toBe(false);
    });

    it('RECORD-08: rejects non-finite numbers (NaN, Infinity, -Infinity)', () => {
      expect(productSpecificationsSchema.safeParse({ 'Power (W)': NaN }).success).toBe(false);
      expect(productSpecificationsSchema.safeParse({ 'Power (W)': Infinity }).success).toBe(false);
      expect(productSpecificationsSchema.safeParse({ 'Power (W)': -Infinity }).success).toBe(false);
      expect(productSpecificationsSchema.safeParse({ 'Power (W)': 65 }).success).toBe(true);
    });

    it('RECORD-09: rejects non-plain objects (arrays, null, Date, functions)', () => {
      expect(productSpecificationsSchema.safeParse(['not', 'an', 'object']).success).toBe(false);
      expect(productSpecificationsSchema.safeParse(null).success).toBe(false);
      expect(productSpecificationsSchema.safeParse(new Date()).success).toBe(false);
      expect(productSpecificationsSchema.safeParse('string').success).toBe(false);
      expect(productSpecificationsSchema.safeParse(12345).success).toBe(false);
    });
  });

  describe('3. String Length & Boundary Hardening', () => {
    it('STR-01: product name accepts 255 characters and rejects 256 characters', () => {
      const validPayload = {
        name: 'a'.repeat(255),
        categoryId: 'cat_1',
        mainImage: 'https://example.com/main.jpg',
      };
      expect(createProductSchema.safeParse(validPayload).success).toBe(true);

      const invalidPayload = {
        ...validPayload,
        name: 'a'.repeat(256),
      };
      expect(createProductSchema.safeParse(invalidPayload).success).toBe(false);
    });

    it('STR-02: product description accepts 10000 characters and rejects 10001 characters', () => {
      const validPayload = {
        name: 'Valid Product',
        categoryId: 'cat_1',
        mainImage: 'https://example.com/main.jpg',
        description: 'd'.repeat(10000),
      };
      expect(createProductSchema.safeParse(validPayload).success).toBe(true);

      const invalidPayload = {
        ...validPayload,
        description: 'd'.repeat(10001),
      };
      expect(createProductSchema.safeParse(invalidPayload).success).toBe(false);
    });

    it('STR-03: offer title accepts 255 characters and rejects 256 characters', () => {
      const validOffer = {
        productId: 'prod_1',
        merchantId: 'merch_1',
        title: 't'.repeat(255),
        originalPrice: 1000,
        sellingPrice: 800,
        originalUrl: 'https://example.com/product',
      };
      expect(createOfferSchema.safeParse(validOffer).success).toBe(true);

      const invalidOffer = {
        ...validOffer,
        title: 't'.repeat(256),
      };
      expect(createOfferSchema.safeParse(invalidOffer).success).toBe(false);
    });

    it('STR-04: offer couponCode accepts 50 characters and rejects 51 characters', () => {
      const validOffer = {
        productId: 'prod_1',
        merchantId: 'merch_1',
        title: 'Valid Title',
        originalPrice: 1000,
        sellingPrice: 800,
        originalUrl: 'https://example.com/product',
        couponCode: 'C'.repeat(50),
      };
      expect(createOfferSchema.safeParse(validOffer).success).toBe(true);

      const invalidOffer = {
        ...validOffer,
        couponCode: 'C'.repeat(51),
      };
      expect(createOfferSchema.safeParse(invalidOffer).success).toBe(false);
    });
  });

  describe('4. Real-World Existing Payloads', () => {
    it('PAYLOAD-01: valid realistic e-commerce product payload parses successfully', () => {
      const payload = {
        name: 'Apple MacBook Air M3 (16GB, 512GB SSD) - Space Grey',
        slug: 'apple-macbook-air-m3-space-grey',
        brand: 'Apple',
        categoryId: 'cat_laptops_01',
        description: 'Supercharged by the next-generation M3 chip, the MacBook Air delivers incredible performance and up to 18 hours of battery life.',
        mainImage: 'https://images.aslicart.com/products/macbook-air-m3-main.jpg',
        additionalImages: [
          'https://images.aslicart.com/products/macbook-air-m3-side.jpg',
          'https://images.aslicart.com/products/macbook-air-m3-keyboard.jpg',
          'https://images.aslicart.com/products/macbook-air-m3-ports.jpg',
        ],
        specifications: {
          'Processor': 'Apple M3 8-core CPU',
          'RAM': '16GB Unified Memory',
          'Storage': '512GB SSD',
          'Display Size (inches)': 13.6,
          'True Tone': true,
          'Color Options': ['Space Grey', 'Midnight', 'Starlight', 'Silver'],
        },
      };

      const result = createProductSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('PAYLOAD-02: valid realistic staff role update payload parses successfully', () => {
      const payload = {
        permissionIds: [
          'perm_products_create',
          'perm_products_read',
          'perm_products_update',
          'perm_offers_create',
          'perm_offers_read',
        ],
      };

      const result = updateRolePermissionsSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });
});
