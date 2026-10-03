import type { FastifyReply, FastifyRequest } from 'fastify'
import { env } from '../config/env.js'
import { prisma } from '../lib/prisma.js'
import { parseOrThrow } from '../lib/validate.js'
import { UnauthenticatedError } from '../lib/errors.js'
import { loginSchema } from '../validation/auth.schema.js'
import { createSession, destroySession, verifyPassword } from '../services/auth.service.js'
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '../lib/cookies.js'

function publicUser(user: { id: string; username: string; role: string; workspaceId: string }) {
  return { id: user.id, username: user.username, role: user.role.toLowerCase() }
}

/**
 * Deliberately generic on failure — never reveals whether the username or
 * the password was the wrong part, matching the existing frontend's own
 * copy exactly ("Invalid username or password."). Looking a user up by
 * username with no workspace filter is fine here specifically because
 * `username` is only unique *within* a workspace (see schema) — login is
 * the one place we must search across all workspaces to find the account
 * at all.
 */
export async function login(request: FastifyRequest, reply: FastifyReply) {
  const { username, password } = parseOrThrow(loginSchema, request.body)

  const user = await prisma.user.findFirst({ where: { username } })
  const passwordOk = user ? await verifyPassword(user.passwordHash, password) : false

  if (!user || !passwordOk) {
    throw new UnauthenticatedError('Invalid username or password.')
  }

  const principal = await createSession(user.id, {
    userAgent: request.headers['user-agent'],
    ipAddress: request.ip,
  })

  reply.setCookie(
    SESSION_COOKIE_NAME,
    principal.sessionId,
    sessionCookieOptions(env.SESSION_TTL_SECONDS, env.isProduction),
  )

  return reply.send({ user: publicUser(user) })
}

export async function logout(request: FastifyRequest, reply: FastifyReply) {
  if (request.principal) {
    await destroySession(request.principal.sessionId)
  }
  reply.clearCookie(SESSION_COOKIE_NAME, { path: '/' })
  return reply.status(204).send()
}

export async function me(request: FastifyRequest, reply: FastifyReply) {
  // requireAuth already guarantees request.principal is set before this runs.
  const principal = request.principal!
  const user = await prisma.user.findUniqueOrThrow({ where: { id: principal.userId } })
  return reply.send({ user: publicUser(user) })
}
