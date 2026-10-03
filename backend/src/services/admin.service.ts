import { prisma } from '../lib/prisma.js'
import { buildCursorPage } from '../lib/pagination.js'
import { ConflictError, NotFoundError } from '../lib/errors.js'
import { hashPassword } from './auth.service.js'
import { getOrCreateBrandProfile } from './brand.service.js'
import { getViralityConfigView } from './virality.service.js'
import { getStatus as getInstagramStatus } from './instagram.service.js'
import { env } from '../config/env.js'
import type { CreateUserInput, UpdateUserRoleInput } from '../validation/admin.schema.js'
import type { User } from '@prisma/client'

/** Never returns passwordHash — this is the one place user rows leave
 * the database, and a password hash must never be part of an API
 * response, even to an admin. */
export function toUserView(user: User) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role.toLowerCase(),
    avatarUrl: user.avatarUrl ?? undefined,
    lastLoginAt: user.lastLoginAt?.toISOString(),
    createdAt: user.createdAt.toISOString(),
  }
}

export async function listUsers(workspaceId: string, opts: { limit: number; cursor?: string }) {
  const rows = await prisma.user.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'asc' },
    take: opts.limit + 1,
    ...(opts.cursor ? { skip: 1, cursor: { id: opts.cursor } } : {}),
  })
  const { items, nextCursor } = buildCursorPage(rows, opts.limit)
  return { items: items.map(toUserView), nextCursor }
}

export async function createUser(workspaceId: string, input: CreateUserInput) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: input.email }, { workspaceId, username: input.username }] },
  })
  if (existing) throw new ConflictError('A user with that username or email already exists')

  const passwordHash = await hashPassword(input.password)
  const user = await prisma.user.create({
    data: {
      workspaceId,
      username: input.username,
      email: input.email,
      passwordHash,
      role: input.role === 'admin' ? 'ADMIN' : 'USER',
    },
  })
  return toUserView(user)
}

export async function updateUserRole(workspaceId: string, id: string, input: UpdateUserRoleInput) {
  const existing = await prisma.user.findFirst({ where: { id, workspaceId } })
  if (!existing) throw new NotFoundError('User not found')

  const user = await prisma.user.update({
    where: { id },
    data: { role: input.role === 'admin' ? 'ADMIN' : 'USER' },
  })
  return toUserView(user)
}

/**
 * A read-only consolidation of every admin-configurable area — brand
 * rules, virality threshold, and integration status — so Settings can
 * render one view instead of firing five separate requests. Each section
 * is still edited through its own existing endpoint
 * (PATCH /brand, /virality-config, etc.); this never duplicates that
 * write path.
 */
export async function getAdminSettings(workspaceId: string) {
  const [workspace, brand, virality, instagram] = await Promise.all([
    prisma.workspace.findUniqueOrThrow({ where: { id: workspaceId } }),
    getOrCreateBrandProfile(workspaceId),
    getViralityConfigView(workspaceId),
    getInstagramStatus(workspaceId),
  ])

  return {
    workspace: { id: workspace.id, name: workspace.name, plan: workspace.plan, seatLimit: workspace.seatLimit },
    brand,
    virality,
    integrations: {
      instagram: { ...instagram, configured: env.isInstagramConfigured },
    },
  }
}
