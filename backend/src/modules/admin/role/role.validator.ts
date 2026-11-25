import { z } from 'zod';

export const roleIdParamSchema = z.object({
  id: z.string().min(1, 'Role ID is required'),
});

export const updateRolePermissionsSchema = z.object({
  permissionIds: z
    .array(z.string().min(1, 'Permission ID cannot be empty').max(100, 'Permission ID exceeds 100 characters'), {
      required_error: 'permissionIds array is required',
    })
    .max(200, 'Cannot exceed 200 permissions per role'),
});

export type UpdateRolePermissionsInput = z.infer<typeof updateRolePermissionsSchema>;

