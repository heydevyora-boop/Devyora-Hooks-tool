import { z } from 'zod'
import { paginationQuerySchema } from '../lib/pagination.js'

/**
 * Matches the frontend's InspirationPattern exactly (Chunk 2 blueprint
 * §10) — derived analysis of a source (hook/narrative/visual/CTA pattern,
 * topic, format, content angle), never the source's raw content. The raw
 * content stays on the linked ContentSource row.
 */
const patternSchema = z.object({
  hookPattern: z.string().trim().max(500).default(''),
  topic: z.string().trim().max(200).default(''),
  format: z.string().trim().max(100).default(''),
  narrativeStructure: z.string().trim().max(500).default(''),
  visualPattern: z.string().trim().max(500).default(''),
  ctaPattern: z.string().trim().max(500).default(''),
  contentAngle: z.string().trim().max(500).default(''),
})

export const createInspirationSchema = z.object({
  contentSourceId: z.string().uuid(),
  pattern: patternSchema,
  notes: z.string().trim().max(2000).optional(),
})

export const updateInspirationSchema = z.object({
  pattern: patternSchema.partial().optional(),
  notes: z.string().trim().max(2000).optional(),
})

export const inspirationListQuerySchema = paginationQuerySchema

export type CreateInspirationInput = z.infer<typeof createInspirationSchema>
export type UpdateInspirationInput = z.infer<typeof updateInspirationSchema>
