import { describe, it, expect } from 'vitest';
import {
  createProductSchema,
  updateProductSchema,
  httpsImageUrlSchema,
} from '../src/modules/product_manager/product/product.validator.js';
import { storageService } from '../src/infra/storage/s3.js';
import { AppError } from '../src/utils/appError.js';

describe('Task 4: S3 Strategy & Image URL Security Validation', () => {
  it('IMG-01: accepts valid secure HTTPS image URLs', () => {
    const validUrl = 'https://images.unsplash.com/photo-123456789.jpg';
    expect(() => httpsImageUrlSchema.parse(validUrl)).not.toThrow();

    const validProduct = {
      name: 'Sony WH-1000XM5',
      categoryId: 'cat_electronics',
      mainImage: 'https://m.media-amazon.com/images/I/71o8Q5XJS5L._SL1500_.jpg',
      additionalImages: [
        'https://m.media-amazon.com/images/I/81x123.jpg',
        'https://cdn.croma.com/product/sony.png',
      ],
    };
    expect(() => createProductSchema.parse(validProduct)).not.toThrow();
  });

  it('IMG-02: rejects insecure HTTP image URLs', () => {
    const insecureHttp = 'http://images.unsplash.com/photo-123456789.jpg';
    expect(() => httpsImageUrlSchema.parse(insecureHttp)).toThrow(
      'Image URL must use secure HTTPS protocol'
    );

    const productWithHttp = {
      name: 'Sony WH-1000XM5',
      categoryId: 'cat_electronics',
      mainImage: insecureHttp,
    };
    expect(() => createProductSchema.parse(productWithHttp)).toThrow();
  });

  it('IMG-03: rejects dangerous and unsafe protocols (javascript:, data:, ftp:, file:)', () => {
    const unsafeUrls = [
      'javascript:alert("xss")',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
      'ftp://ftp.example.com/image.png',
      'file:///etc/passwd',
      'blob:https://example.com/1234',
    ];

    for (const url of unsafeUrls) {
      expect(() => httpsImageUrlSchema.parse(url)).toThrow();
    }
  });

  it('IMG-04: rejects empty, whitespace, or malformed image URLs', () => {
    const invalidUrls = ['', '   ', 'not-a-url', 'https://', 'http://'];

    for (const url of invalidUrls) {
      expect(() => httpsImageUrlSchema.parse(url)).toThrow();
    }
  });

  it('IMG-05: S3StorageService throws clear error stating binary S3 uploads are deferred in MVP Phase 1', async () => {
    await expect(
      storageService.uploadFile(Buffer.from('fake'), 'key.jpg', 'image/jpeg')
    ).rejects.toThrow(
      'Direct binary file uploads to S3 are deferred in MVP Phase 1. Product managers must provide verified external HTTPS image URLs.'
    );

    await expect(storageService.getSignedDownloadUrl('key.jpg')).rejects.toThrow(
      'S3 presigned download URLs are deferred in MVP Phase 1'
    );
  });
});
