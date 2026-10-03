import { z } from 'zod'

export const brandUpdateSchema = z.object({
  brandName: z.string().trim().max(200).optional(),
  voiceDescription: z.string().max(2000).optional(),
  toneNotes: z.string().max(2000).optional(),
  bannedPhrases: z.array(z.string().trim().min(1)).max(100).optional(),
})

export type BrandUpdateInput = z.infer<typeof brandUpdateSchema>
