import { z } from 'zod'
import { paginationQuerySchema } from '../lib/pagination.js'

export const createContentRuleSchema = z.object({
  category: z.string().trim().min(1, 'Category is required').max(100),
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(2000).optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
})

export const updateContentRuleSchema = z.object({
  category: z.string().trim().min(1).max(100).optional(),
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  /** Admin-only — see requireRole('ADMIN') gating in the controller. A
   * locked rule can't be edited or deleted by a non-admin. */
  isLocked: z.boolean().optional(),
})

export const contentRuleListQuerySchema = paginationQuerySchema.extend({
  category: z.string().trim().min(1).optional(),
})

export type CreateContentRuleInput = z.infer<typeof createContentRuleSchema>
export type UpdateContentRuleInput = z.infer<typeof updateContentRuleSchema>
