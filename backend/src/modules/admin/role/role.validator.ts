import { z } from 'zod';

export const roleIdParamSchema = z.object({
  id: z.string().min(1, 'Role ID is required'),
});

export const updateRolePermissionsSchema = z.object({
  permissionIds: z.array(z.string().min(1), {
    required_error: 'permissionIds array is required',
  }),
});

export type UpdateRolePermissionsInput = z.infer<typeof updateRolePermissionsSchema>;

