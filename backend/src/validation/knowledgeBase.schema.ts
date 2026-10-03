import { z } from 'zod'

export const knowledgeSearchQuerySchema = z.object({
  q: z.string().trim().min(1, 'A search query is required').max(200),
  limit: z.coerce.number().int().positive().max(20).default(5),
})
