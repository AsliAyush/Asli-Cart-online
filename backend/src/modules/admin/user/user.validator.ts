import { z } from 'zod';

export const listUsersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100)),
  roleId: z.string().optional(),
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
  search: z.string().optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

export const createEmployeeSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  roleId: z.string().min(1, 'Role ID is required'),
});

export const updateEmployeeSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'isActive boolean flag is required' }),
});

export const updateUserRoleSchema = z.object({
  roleId: z.string().min(1, 'Role ID is required'),
});

