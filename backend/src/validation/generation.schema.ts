import { z } from 'zod'
import { paginationQuerySchema } from '../lib/pagination.js'

export const generateContentSchema = z
  .object({
    flowchartNodeId: z.string().uuid().optional(),
    productId: z.string().uuid().optional(),
    topic: z.string().trim().min(1).max(300).optional(),
    platform: z.string().trim().min(1).max(50).optional(),
    userInstructions: z.string().trim().max(2000).optional(),
  })
  .refine((data) => data.flowchartNodeId || data.topic, {
    message: 'Either flowchartNodeId or topic is required',
    path: ['topic'],
  })

export const regenerateSchema = z.object({
  targetLabel: z.string().trim().min(1).max(100),
  reason: z.string().trim().min(1, 'A reason is required').max(1000),
  reasonOrigin: z.enum(['text', 'speech']).default('text'),
})

export const rejectSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
})

export const generationListQuerySchema = paginationQuerySchema.extend({
  stage: z.enum(['draft', 'generated', 'review', 'approved', 'published', 'archived']).optional(),
})

export type GenerateContentInput = z.infer<typeof generateContentSchema>
export type RegenerateInput = z.infer<typeof regenerateSchema>
export type RejectInput = z.infer<typeof rejectSchema>
