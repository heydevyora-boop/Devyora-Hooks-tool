import { z } from 'zod'
import { paginationQuerySchema } from '../lib/pagination.js'

export const approvalListQuerySchema = paginationQuerySchema.extend({
  resolution: z.enum(['pending', 'approved', 'rejected']).optional(),
})
