import { prisma } from '../lib/prisma.js'
import { buildCursorPage } from '../lib/pagination.js'
import { ForbiddenError, NotFoundError } from '../lib/errors.js'
import type { CreateContentRuleInput, UpdateContentRuleInput } from '../validation/contentRule.schema.js'
import type { ContentRule } from '@prisma/client'

/**
 * Matches the backend-persisted fields of the frontend's RulebookEntry
 * (Chunk 1) — `categoryColorClass`/`showDisruptionMeter` are presentation
 * details the frontend derives from `category` client-side (see
 * mockIntelligence.ts), not real stored data, so they're intentionally
 * not part of this contract.
 */
export function toContentRuleView(rule: ContentRule) {
  return {
    id: rule.id,
    category: rule.category,
    title: rule.title,
    description: rule.description ?? undefined,
    tags: rule.tags as string[],
    isLocked: rule.isLocked,
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString(),
  }
}

export async function listContentRules(
  workspaceId: string,
  opts: { limit: number; cursor?: string; category?: string },
) {
  const rows = await prisma.contentRule.findMany({
    where: { workspaceId, ...(opts.category ? { category: opts.category } : {}) },
    orderBy: { createdAt: 'desc' },
    take: opts.limit + 1,
    ...(opts.cursor ? { skip: 1, cursor: { id: opts.cursor } } : {}),
  })

  const { items, nextCursor } = buildCursorPage(rows, opts.limit)
  return { items: items.map(toContentRuleView), nextCursor }
}

export async function getContentRule(workspaceId: string, id: string) {
  const rule = await prisma.contentRule.findFirst({ where: { id, workspaceId } })
  if (!rule) throw new NotFoundError('Content rule not found')
  return toContentRuleView(rule)
}

export async function createContentRule(workspaceId: string, createdBy: string, input: CreateContentRuleInput) {
  const rule = await prisma.contentRule.create({
    data: { workspaceId, category: input.category, title: input.title, description: input.description, tags: input.tags, createdBy },
  })
  return toContentRuleView(rule)
}

export async function updateContentRule(
  workspaceId: string,
  id: string,
  isAdmin: boolean,
  input: UpdateContentRuleInput,
) {
  const existing = await prisma.contentRule.findFirst({ where: { id, workspaceId } })
  if (!existing) throw new NotFoundError('Content rule not found')
  if (existing.isLocked && !isAdmin) throw new ForbiddenError('This rule is locked — only an admin can change it')
  if (input.isLocked !== undefined && !isAdmin) throw new ForbiddenError('Only an admin can lock or unlock a rule')

  const rule = await prisma.contentRule.update({
    where: { id },
    data: {
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.tags !== undefined ? { tags: input.tags } : {}),
      ...(input.isLocked !== undefined ? { isLocked: input.isLocked } : {}),
    },
  })
  return toContentRuleView(rule)
}

export async function deleteContentRule(workspaceId: string, id: string, isAdmin: boolean) {
  const existing = await prisma.contentRule.findFirst({ where: { id, workspaceId } })
  if (!existing) throw new NotFoundError('Content rule not found')
  if (existing.isLocked && !isAdmin) throw new ForbiddenError('This rule is locked — only an admin can delete it')
  await prisma.contentRule.delete({ where: { id } })
}
