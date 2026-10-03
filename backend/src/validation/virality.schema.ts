import { z } from 'zod'

export const updateViralityConfigSchema = z.object({
  metricLabel: z.string().trim().min(1, 'Metric label is required').max(100),
  threshold: z.number().int().min(0),
})

export type UpdateViralityConfigInput = z.infer<typeof updateViralityConfigSchema>
