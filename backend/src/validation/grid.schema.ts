import { z } from 'zod'
import { paginationQuerySchema } from '../lib/pagination.js'

const slotInputSchema = z.object({
  position: z.number().int().min(0),
  contentType: z.enum(['reel', 'carousel', 'static', 'story', 'empty']).default('empty'),
  /** Product's display name (matches the frontend's <select> which stores
   * the name, not the id — see GridSlotEditor.tsx) — resolved to a real
   * Product row server-side, never stored as free text. */
  productRef: z.string().trim().min(1).optional(),
  label: z.string().trim().max(200).optional(),
})

function uniquePositions(slots: { position: number }[]) {
  return new Set(slots.map((slot) => slot.position)).size === slots.length
}

export const createGridTemplateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  description: z.string().trim().max(1000).optional(),
  slots: z.array(slotInputSchema).default([]).refine(uniquePositions, 'Slot positions must be unique'),
})

export const updateGridTemplateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(1000).optional(),
  slots: z.array(slotInputSchema).refine(uniquePositions, 'Slot positions must be unique').optional(),
})

export const gridListQuerySchema = paginationQuerySchema

export type CreateGridTemplateInput = z.infer<typeof createGridTemplateSchema>
export type UpdateGridTemplateInput = z.infer<typeof updateGridTemplateSchema>
export type SlotInput = z.infer<typeof slotInputSchema>
