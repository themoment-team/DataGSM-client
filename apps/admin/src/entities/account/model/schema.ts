import { z } from 'zod';

export const AccountFilterSchema = z.object({
  email: z.string().optional(),
  role: z.string().optional(),
  isStudent: z.string().optional(),
  sortBy: z.string().optional(),
});

export type AccountFilterType = z.infer<typeof AccountFilterSchema>;
