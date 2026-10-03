import { z } from 'zod'

export const updateFlowchartNodeSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'done', 'blocked']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  effort: z.enum(['low', 'medium', 'high']).optional(),
})

export type UpdateFlowchartNodeInput = z.infer<typeof updateFlowchartNodeSchema>
