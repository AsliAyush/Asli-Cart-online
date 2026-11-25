// AWS S3 Storage Adapter (MVP Strategy)
// In Phase 1 MVP, direct binary file uploads to AWS S3 are deferred.
// Product Managers provide verified external HTTPS image URLs directly.
// Direct binary upload endpoints will be enabled in Phase 2 alongside media CDN pipeline.

import { AppError } from '../../utils/appError.js';

export interface IStorageService {
  uploadFile(file: Buffer, key: string, contentType: string): Promise<string>;
  getSignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
  deleteFile(key: string): Promise<void>;
}

export class S3StorageService implements IStorageService {
  async uploadFile(_file: Buffer, _key: string, _contentType: string): Promise<string> {
    throw AppError.badRequest(
      'Direct binary file uploads to S3 are deferred in MVP Phase 1. Product managers must provide verified external HTTPS image URLs.'
    );
  }

  async getSignedDownloadUrl(_key: string, _expiresInSeconds = 3600): Promise<string> {
    throw AppError.badRequest(
      'S3 presigned download URLs are deferred in MVP Phase 1. Use verified HTTPS image URLs directly.'
    );
  }

  async deleteFile(_key: string): Promise<void> {
    // S3 delete deferred to Phase 2 media integration
  }
}

export const storageService = new S3StorageService();


