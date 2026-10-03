import { prisma } from '../lib/prisma.js'
import { buildCursorPage } from '../lib/pagination.js'
import { NotFoundError } from '../lib/errors.js'
import { toSourceView } from './source.service.js'
import type { CreateInspirationInput, UpdateInspirationInput } from '../validation/inspiration.schema.js'
import type { ContentSource, InspirationItem } from '@prisma/client'

type InspirationWithSource = InspirationItem & { contentSource: ContentSource }

const EMPTY_PATTERN = {
  hookPattern: '',
  topic: '',
  format: '',
  narrativeStructure: '',
  visualPattern: '',
  ctaPattern: '',
  contentAngle: '',
}

/** Matches the frontend's InspirationItem shape exactly — `source` is the
 * full ContentSourceItem view, not just its id, since the Inspiration tab
 * renders the source's title/type/preview alongside the derived pattern. */
export function toInspirationView(item: InspirationWithSource) {
  return {
    id: item.id,
    source: toSourceView(item.contentSource),
    pattern: { ...EMPTY_PATTERN, ...(item.pattern as Record<string, string>) },
    notes: item.notes ?? undefined,
    savedAt: item.savedAt.toISOString(),
  }
}

export async function listInspiration(workspaceId: string, opts: { limit: number; cursor?: string }) {
  const rows = await prisma.inspirationItem.findMany({
    where: { workspaceId },
    include: { contentSource: true },
    orderBy: { savedAt: 'desc' },
    take: opts.limit + 1,
    ...(opts.cursor ? { skip: 1, cursor: { id: opts.cursor } } : {}),
  })

  const { items, nextCursor } = buildCursorPage(rows, opts.limit)
  return { items: items.map(toInspirationView), nextCursor }
}

export async function getInspiration(workspaceId: string, id: string) {
  const item = await prisma.inspirationItem.findFirst({ where: { id, workspaceId }, include: { contentSource: true } })
  if (!item) throw new NotFoundError('Inspiration item not found')
  return toInspirationView(item)
}

export async function createInspiration(workspaceId: string, savedBy: string, input: CreateInspirationInput) {
  const source = await prisma.contentSource.findFirst({ where: { id: input.contentSourceId, workspaceId } })
  if (!source) throw new NotFoundError('Source not found')

  const item = await prisma.inspirationItem.create({
    data: {
      workspaceId,
      contentSourceId: input.contentSourceId,
      pattern: input.pattern,
      notes: input.notes,
      savedBy,
    },
    include: { contentSource: true },
  })
  return toInspirationView(item)
}

export async function updateInspiration(workspaceId: string, id: string, input: UpdateInspirationInput) {
  const existing = await prisma.inspirationItem.findFirst({ where: { id, workspaceId } })
  if (!existing) throw new NotFoundError('Inspiration item not found')

  const mergedPattern = input.pattern
    ? { ...EMPTY_PATTERN, ...(existing.pattern as Record<string, string>), ...input.pattern }
    : undefined

  const item = await prisma.inspirationItem.update({
    where: { id },
    data: {
      ...(mergedPattern ? { pattern: mergedPattern } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    },
    include: { contentSource: true },
  })
  return toInspirationView(item)
}
