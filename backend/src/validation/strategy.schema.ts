import { z } from 'zod'
import { paginationQuerySchema } from '../lib/pagination.js'

export const createStrategySchema = z.object({
  goal: z.string().trim().min(1, 'Goal is required').max(200),
  objective: z.string().trim().max(1000).optional(),
  durationWeeks: z.number().int().positive().max(52),
  postingFrequency: z.string().trim().min(1, 'Posting frequency is required').max(100),
  productIds: z.array(z.string().uuid()).min(1, 'Select at least one product'),
  audience: z.string().trim().max(1000).optional(),
  gridTemplateId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
})

export const updateStrategySchema = z.object({
  status: z.enum(['draft', 'active', 'completed', 'archived']).optional(),
})

export const strategyListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['draft', 'active', 'completed', 'archived']).optional(),
})

export type CreateStrategyInput = z.infer<typeof createStrategySchema>
export type UpdateStrategyInput = z.infer<typeof updateStrategySchema>
