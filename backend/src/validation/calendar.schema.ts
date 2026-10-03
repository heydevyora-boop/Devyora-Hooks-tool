import { z } from 'zod'
import { paginationQuerySchema } from '../lib/pagination.js'

export const createCalendarEntrySchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  date: z.coerce.date(),
  productId: z.string().uuid().optional(),
  contentType: z.enum(['reel', 'carousel', 'static', 'story', 'empty']).optional(),
  platform: z.string().trim().min(1).max(50).default('instagram'),
  gridPosition: z.number().int().min(0).optional(),
  strategyId: z.string().uuid().optional(),
  notes: z.string().trim().max(2000).optional(),
})

export const updateCalendarEntrySchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  date: z.coerce.date().optional(),
  productId: z.string().uuid().nullable().optional(),
  contentType: z.enum(['reel', 'carousel', 'static', 'story', 'empty']).optional(),
  platform: z.string().trim().min(1).max(50).optional(),
  gridPosition: z.number().int().min(0).nullable().optional(),
  strategyId: z.string().uuid().nullable().optional(),
  status: z.enum(['planned', 'scheduled', 'published', 'skipped']).optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
})

export const rescheduleCalendarEntrySchema = z.object({
  date: z.coerce.date(),
})

export const calendarListQuerySchema = paginationQuerySchema.extend({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  productId: z.string().uuid().optional(),
  status: z.enum(['planned', 'scheduled', 'published', 'skipped']).optional(),
  platform: z.string().trim().min(1).optional(),
  q: z.string().trim().min(1).optional(),
})

export type CreateCalendarEntryInput = z.infer<typeof createCalendarEntrySchema>
export type UpdateCalendarEntryInput = z.infer<typeof updateCalendarEntrySchema>
export type RescheduleCalendarEntryInput = z.infer<typeof rescheduleCalendarEntrySchema>
