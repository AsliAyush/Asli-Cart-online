import { z } from 'zod';

export const listAuditLogsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .optional()
    .default('20')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100)),
  moduleName: z.string().optional(),
  action: z.string().optional(),
  actorUserId: z.string().optional(),
});

export const auditLogIdParamSchema = z.object({
  id: z.string().min(1, 'Audit log ID is required'),
});

export type ListAuditLogsQueryInput = z.infer<typeof listAuditLogsQuerySchema>;
export type AuditLogIdParamInput = z.infer<typeof auditLogIdParamSchema>;

