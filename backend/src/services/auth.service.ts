import argon2 from 'argon2'
import { randomUUID } from 'node:crypto'
import { prisma } from '../lib/prisma.js'
import { env } from '../config/env.js'
import type { Role } from '@prisma/client'

export interface SessionPrincipal {
  sessionId: string
  userId: string
  workspaceId: string
  username: string
  role: Role
}

/**
 * Password hashing: argon2id (OWASP's current recommendation for new
 * systems), per Chunk 2 blueprint §3. Never bcrypt/plain/MD5.
 */
export function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id })
}

export function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain).catch(() => false)
}

/**
 * Server-side session, not a bare JWT — per Chunk 2 blueprint §3, chosen
 * specifically so a session can be revoked instantly (sign-out, forced
 * logout on role change) by deleting the row, which a stateless token
 * can't do without an extra denylist. The httpOnly cookie carries only
 * this row's id.
 */
export async function createSession(
  userId: string,
  meta: { userAgent?: string; ipAddress?: string },
): Promise<SessionPrincipal> {
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_SECONDS * 1000)
  const session = await prisma.session.create({
    data: {
      id: randomUUID(),
      userId,
      expiresAt,
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
    },
    include: { user: true },
  })

  await prisma.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } })

  return {
    sessionId: session.id,
    userId: session.user.id,
    workspaceId: session.user.workspaceId,
    username: session.user.username,
    role: session.user.role,
  }
}

/**
 * Resolves a session id (from the signed cookie) to the current principal,
 * sliding the expiry forward on activity. Returns null for missing,
 * expired, or revoked sessions — callers treat that as "not authenticated",
 * never a 500.
 */
export async function resolveSession(sessionId: string): Promise<SessionPrincipal | null> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  })

  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } }).catch(() => {})
    return null
  }

  // Sliding expiration: push the TTL forward on each authenticated request,
  // but only write to the DB at most once a minute to avoid hammering it.
  const staleBy = Date.now() - session.lastSeenAt.getTime()
  if (staleBy > 60_000) {
    await prisma.session
      .update({
        where: { id: session.id },
        data: {
          lastSeenAt: new Date(),
          expiresAt: new Date(Date.now() + env.SESSION_TTL_SECONDS * 1000),
        },
      })
      .catch(() => {})
  }

  return {
    sessionId: session.id,
    userId: session.user.id,
    workspaceId: session.user.workspaceId,
    username: session.user.username,
    role: session.user.role,
  }
}

export async function destroySession(sessionId: string): Promise<void> {
  await prisma.session.delete({ where: { id: sessionId } }).catch(() => {
    // Already gone — deleting a non-existent session is not an error.
  })
}

export async function findUserByUsername(workspaceId: string | undefined, username: string) {
  return prisma.user.findFirst({
    where: workspaceId ? { workspaceId, username } : { username },
  })
}
