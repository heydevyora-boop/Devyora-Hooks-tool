import { z } from 'zod'
import { paginationQuerySchema } from '../lib/pagination.js'

const stringArray = z.array(z.string().trim().min(1)).max(50).default([])

export const productInputSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required').max(200),
  description: z.string().max(5000).default(''),
  features: stringArray,
  benefits: stringArray,
  applications: stringArray,
  sellingPoints: stringArray,
  targetAudience: z.string().max(500).default(''),
  limitations: stringArray,
  contentAngles: stringArray,
})

export const productUpdateSchema = productInputSchema.partial()

export const productListQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().min(1).max(200).optional(),
})

export type ProductInput = z.infer<typeof productInputSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
