import type { FastifyReply, FastifyRequest } from 'fastify'
import type { Role } from '@prisma/client'
import { resolveSession } from '../services/auth.service.js'
import { ForbiddenError, UnauthenticatedError } from '../lib/errors.js'
import { SESSION_COOKIE_NAME } from '../lib/cookies.js'

/**
 * Resolves the session cookie (if present) onto `request.principal`, but
 * does NOT reject the request if there isn't one — use this on public
 * routes that behave differently when logged in (none currently), or
 * compose with `requireAuth` below for routes that must reject.
 */
export async function attachPrincipal(request: FastifyRequest, _reply: FastifyReply) {
  const raw = request.cookies[SESSION_COOKIE_NAME]
  if (!raw) return

  const unsigned = request.unsignCookie(raw)
  if (!unsigned.valid || !unsigned.value) return

  const principal = await resolveSession(unsigned.value)
  if (principal) request.principal = principal
}

/**
 * Every protected route uses this. Per Chunk 2 blueprint §2.1: "Auth"
 * column of "session" means this ran first.
 */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  await attachPrincipal(request, reply)
  if (!request.principal) {
    throw new UnauthenticatedError()
  }
}

/**
 * Composes with requireAuth — role is checked by a single shared
 * middleware (Chunk 2 blueprint §4.1), never re-implemented per-handler,
 * so the "who can do what" list stays auditable from the route
 * registration alone.
 */
export function requireRole(role: Role) {
  return async function roleCheck(request: FastifyRequest, _reply: FastifyReply) {
    if (!request.principal) {
      throw new UnauthenticatedError()
    }
    if (request.principal.role !== role) {
      throw new ForbiddenError()
    }
  }
}
