import { z } from 'zod'

/** Query params Instagram appends to our redirect_uri after the user
 * approves (or denies) the Business Login consent screen. */
export const instagramCallbackQuerySchema = z.object({
  code: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  error: z.string().optional(),
  error_reason: z.string().optional(),
  error_description: z.string().optional(),
})

export type InstagramCallbackQuery = z.infer<typeof instagramCallbackQuerySchema>
