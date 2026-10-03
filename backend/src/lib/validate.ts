import type { ZodType, ZodTypeDef } from 'zod'
import { ValidationError } from './errors.js'

/**
 * Parses `data` against `schema`; throws a ValidationError (→ 400,
 * VALIDATION_ERROR envelope) with per-field messages on failure. Used at
 * every route boundary per Chunk 2 blueprint §7 — invalid input never
 * reaches a controller/service.
 *
 * The `Input = any` (rather than the `ZodSchema<T>` alias, whose Input
 * defaults to `Output`) is deliberate: schemas with `.default()` have a
 * narrower Output than Input (e.g. `limit?: number` in → `limit: number`
 * out). Binding T against both positions makes TS infer a union of the
 * two and silently widens every defaulted field back to optional.
 */
export function parseOrThrow<T>(schema: ZodType<T, ZodTypeDef, any>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    const fields: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || '_root'
      if (!fields[key]) fields[key] = issue.message
    }
    throw new ValidationError('Validation failed', fields)
  }
  return result.data
}
