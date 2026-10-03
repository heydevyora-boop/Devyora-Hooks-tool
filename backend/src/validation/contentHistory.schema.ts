import { z } from 'zod'
import { paginationQuerySchema } from '../lib/pagination.js'

const formatEnum = z.enum(['Reel', 'Carousel', 'Static', 'Story', 'Video'])
const statusEnum = z.enum(['Published', 'Draft', 'Scheduled'])

export const contentHistoryInputSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(300),
  productId: z.string().uuid().optional(),
  topic: z.string().max(500).default(''),
  format: formatEnum,
  platform: z.string().max(50).default('instagram'),
  date: z.coerce.date({ errorMap: () => ({ message: 'date must be a valid date' }) }),
  hook: z.string().max(2000).optional(),
  status: statusEnum.default('Draft'),
  performanceLabel: z.string().max(100).optional(),
  engagement: z.string().max(200).optional(),
})

export const contentHistoryUpdateSchema = contentHistoryInputSchema.partial()

export const contentHistoryListQuerySchema = paginationQuerySchema.extend({
  productId: z.string().uuid().optional(),
  format: formatEnum.optional(),
  status: statusEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const performanceSnapshotSchema = z.object({
  views: z.number().int().nonnegative().optional(),
  likes: z.number().int().nonnegative().optional(),
  shares: z.number().int().nonnegative().optional(),
  comments: z.number().int().nonnegative().optional(),
  saves: z.number().int().nonnegative().optional(),
  engagementRate: z.number().nonnegative().optional(),
  holdRate3s: z.number().min(0).max(1).optional(),
  source: z.enum(['instagram_sync', 'manual']).default('manual'),
})

export type ContentHistoryInput = z.infer<typeof contentHistoryInputSchema>
export type ContentHistoryUpdateInput = z.infer<typeof contentHistoryUpdateSchema>
export type PerformanceSnapshotInput = z.infer<typeof performanceSnapshotSchema>
