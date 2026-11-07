import { auditLogRepository, AuditLogRepository } from '../repositories/auditLog.repository.js';
import { AppError } from '../utils/appError.js';

export class AuditLogService {
  constructor(private auditRepo: AuditLogRepository = auditLogRepository) {}

  async listLogs(params: {
    page: number;
    limit: number;
    moduleName?: string;
    action?: string;
    actorUserId?: string;
  }) {
    return this.auditRepo.findLogs(params);
  }

  async getLogById(id: string) {
    const log = await this.auditRepo.findById(id);
    if (!log) {
      throw AppError.notFound('Audit log entry not found');
    }
    return log;
  }
}

export const auditLogService = new AuditLogService();

