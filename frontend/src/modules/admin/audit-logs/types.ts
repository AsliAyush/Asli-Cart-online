/**
 * Asli Cart Super Admin Audit Log Types
 */

export interface AuditLogActor {
  id: string;
  fullName: string;
  email: string;
  role?: {
    id: string;
    name: string;
  };
}

export interface AdminAuditLog {
  id: string;
  actorUserId: string | null;
  action: string;
  moduleName: string;
  entityId: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  actor: AuditLogActor | null;
}

export interface ListAuditLogsParams {
  page?: number;
  limit?: number;
  moduleName?: string;
  action?: string;
  actorUserId?: string;
}

