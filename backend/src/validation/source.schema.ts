import { z } from 'zod'
import { paginationQuerySchema } from '../lib/pagination.js'

/**
 * Three intake shapes, matching the frontend's SourceImportPanel exactly
 * (Chunk 1 audit §3.3): a URL (type auto-detected server-side, never
 * trusted from the client), pasted or dictated text (speech-to-text
 * transcription already happens client-side via the Web Speech API — see
 * useSpeechToText.ts — so a "speech" source arrives here as plain text,
 * just tagged with its real origin), or a reference to an already-uploaded
 * MediaAsset (image/video/screenshot/pdf/document).
 */
export const createSourceSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('url'),
    value: z.string().trim().url('Must be a valid URL'),
  }),
  z.object({
    kind: z.literal('text'),
    value: z.string().trim().min(1, 'Text is required').max(20000),
    origin: z.enum(['text', 'speech']).default('text'),
  }),
  z.object({
    kind: z.literal('file'),
    mediaAssetId: z.string().uuid(),
  }),
])

export const sourceListQuerySchema = paginationQuerySchema.extend({
  type: z
    .enum([
      'instagram_url',
      'youtube_url',
      'website_url',
      'other_url',
      'image',
      'video',
      'screenshot',
      'pdf',
      'text',
      'speech',
    ])
    .optional(),
  status: z.enum(['pending', 'processing', 'ready', 'error']).optional(),
})

export type CreateSourceInput = z.infer<typeof createSourceSchema>
