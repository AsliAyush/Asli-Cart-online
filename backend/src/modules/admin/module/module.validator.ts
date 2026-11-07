import { z } from 'zod';

export const moduleIdParamSchema = z.object({
  id: z.string().min(1, 'Module ID is required'),
});

