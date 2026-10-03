/**
 * Standard error envelope + typed error classes, per the Chunk 2 blueprint
 * §2.1 and §7: every error response has the same shape, and the HTTP
 * status/code pairing is fixed per error type so handlers never have to
 * remember which status goes with which situation.
 *
 *   { "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": {...} } }
 */

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'

export class AppError extends Error {
  readonly statusCode: number
  readonly code: ErrorCode
  readonly fields?: Record<string, string>

  constructor(statusCode: number, code: ErrorCode, message: string, fields?: Record<string, string>) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.fields = fields
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', fields?: Record<string, string>) {
    super(400, 'VALIDATION_ERROR', message, fields)
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message = 'Authentication required') {
    super(401, 'UNAUTHENTICATED', message)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(403, 'FORBIDDEN', message)
  }
}

/**
 * Used both for "doesn't exist" AND "exists but isn't yours" — per the
 * blueprint's authorization note: a workspace-scoped 404 is preferred over
 * 403 for individual-resource lookups, so a client can't distinguish
 * "wrong ID" from "someone else's ID" (cross-tenant enumeration).
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, 'NOT_FOUND', message)
  }
}

export class ConflictError extends AppError {
  constructor(message = 'This conflicts with existing state') {
    super(409, 'CONFLICT', message)
  }
}

export function errorBody(code: ErrorCode, message: string, fields?: Record<string, string>) {
  return { error: { code, message, ...(fields ? { fields } : {}) } }
}
