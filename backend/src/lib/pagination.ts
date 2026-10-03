import { z } from 'zod'

/**
 * Cursor pagination per Chunk 2 blueprint §2.1: list endpoints accept
 * `?limit=&cursor=`, respond `{ items, nextCursor }`. Cursor is simply the
 * last row's id (all list queries here are ordered by a unique, stable
 * column), which keeps pages correct even if rows are inserted mid-scroll.
 */
export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().uuid().optional(),
})

export type PaginationQuery = z.infer<typeof paginationQuerySchema>

export function buildCursorPage<T extends { id: string }>(rows: T[], limit: number) {
  const hasMore = rows.length > limit
  const items = hasMore ? rows.slice(0, limit) : rows
  const nextCursor = hasMore ? items[items.length - 1]!.id : null
  return { items, nextCursor }
}
