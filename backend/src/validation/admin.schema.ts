import { z } from 'zod'
import { paginationQuerySchema } from '../lib/pagination.js'

export const createUserSchema = z.object({
  username: z.string().trim().min(3, 'Username must be at least 3 characters').max(50),
  email: z.string().trim().email('Must be a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
  role: z.enum(['admin', 'user']).default('user'),
})

export const updateUserRoleSchema = z.object({
  role: z.enum(['admin', 'user']),
})

export const userListQuerySchema = paginationQuerySchema

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>
