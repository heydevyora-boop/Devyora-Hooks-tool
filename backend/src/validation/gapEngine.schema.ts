import { z } from 'zod'

export const gapAnalysisQuerySchema = z.object({
  productIds: z
    .string()
    .optional()
    .transform((value) => (value ? value.split(',').filter(Boolean) : undefined)),
})
