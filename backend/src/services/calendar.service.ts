import { prisma } from '../lib/prisma.js'
import { buildCursorPage } from '../lib/pagination.js'
import { NotFoundError, ValidationError } from '../lib/errors.js'
import type {
  CreateCalendarEntryInput,
  RescheduleCalendarEntryInput,
  UpdateCalendarEntryInput,
} from '../validation/calendar.schema.js'
import type { CalendarEntry, CalendarEntryStatus, GridSlotContentType, Product } from '@prisma/client'

type EntryWithProduct = CalendarEntry & { product: Product | null }

const CONTENT_TYPE_TO_DB: Record<string, GridSlotContentType> = {
  reel: 'REEL',
  carousel: 'CAROUSEL',
  static: 'STATIC',
  story: 'STORY',
  empty: 'EMPTY',
}
const CONTENT_TYPE_FROM_DB: Record<GridSlotContentType, string> = {
  REEL: 'reel',
  CAROUSEL: 'carousel',
  STATIC: 'static',
  STORY: 'story',
  EMPTY: 'empty',
}
const STATUS_TO_DB: Record<string, CalendarEntryStatus> = {
  planned: 'PLANNED',
  scheduled: 'SCHEDULED',
  published: 'PUBLISHED',
  skipped: 'SKIPPED',
}
const STATUS_FROM_DB: Record<CalendarEntryStatus, string> = {
  PLANNED: 'planned',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  SKIPPED: 'skipped',
}

/** Matches the Chunk 6 calendar contract: planned content, date, product,
 * content type, platform, grid position, strategy, status. */
export function toCalendarEntryView(entry: EntryWithProduct) {
  return {
    id: entry.id,
    title: entry.title,
    date: entry.date.toISOString().slice(0, 10),
    product: entry.product?.name,
    productId: entry.productId ?? undefined,
    contentType: entry.contentType ? CONTENT_TYPE_FROM_DB[entry.contentType] : undefined,
    platform: entry.platform,
    gridPosition: entry.gridPosition ?? undefined,
    strategyId: entry.strategyId ?? undefined,
    flowchartNodeId: entry.flowchartNodeId ?? undefined,
    generatedContentId: entry.generatedContentId ?? undefined,
    status: STATUS_FROM_DB[entry.status],
    notes: entry.notes ?? undefined,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }
}

const includeProduct = { product: true } as const

export async function listCalendarEntries(
  workspaceId: string,
  opts: {
    limit: number
    cursor?: string
    from?: Date
    to?: Date
    productId?: string
    status?: string
    platform?: string
    q?: string
  },
) {
  const rows = await prisma.calendarEntry.findMany({
    where: {
      workspaceId,
      ...(opts.from || opts.to
        ? { date: { ...(opts.from ? { gte: opts.from } : {}), ...(opts.to ? { lte: opts.to } : {}) } }
        : {}),
      ...(opts.productId ? { productId: opts.productId } : {}),
      ...(opts.status ? { status: STATUS_TO_DB[opts.status] } : {}),
      ...(opts.platform ? { platform: opts.platform } : {}),
      ...(opts.q
        ? { OR: [{ title: { contains: opts.q, mode: 'insensitive' } }, { notes: { contains: opts.q, mode: 'insensitive' } }] }
        : {}),
    },
    include: includeProduct,
    orderBy: { date: 'asc' },
    take: opts.limit + 1,
    ...(opts.cursor ? { skip: 1, cursor: { id: opts.cursor } } : {}),
  })

  const { items, nextCursor } = buildCursorPage(rows, opts.limit)
  return { items: items.map(toCalendarEntryView), nextCursor }
}

export async function getCalendarEntry(workspaceId: string, id: string) {
  const entry = await prisma.calendarEntry.findFirst({ where: { id, workspaceId }, include: includeProduct })
  if (!entry) throw new NotFoundError('Calendar entry not found')
  return toCalendarEntryView(entry)
}

async function assertReferencesExist(
  workspaceId: string,
  refs: { productId?: string; strategyId?: string },
) {
  if (refs.productId) {
    const product = await prisma.product.findFirst({ where: { id: refs.productId, workspaceId } })
    if (!product) throw new ValidationError('Validation failed', { productId: 'Product not found' })
  }
  if (refs.strategyId) {
    const strategy = await prisma.contentStrategy.findFirst({ where: { id: refs.strategyId, workspaceId } })
    if (!strategy) throw new ValidationError('Validation failed', { strategyId: 'Strategy not found' })
  }
}

export async function createCalendarEntry(workspaceId: string, createdBy: string, input: CreateCalendarEntryInput) {
  await assertReferencesExist(workspaceId, input)

  const entry = await prisma.calendarEntry.create({
    data: {
      workspaceId,
      title: input.title,
      date: input.date,
      productId: input.productId,
      contentType: input.contentType ? CONTENT_TYPE_TO_DB[input.contentType] : undefined,
      platform: input.platform,
      gridPosition: input.gridPosition,
      strategyId: input.strategyId,
      notes: input.notes,
      createdBy,
    },
    include: includeProduct,
  })
  return toCalendarEntryView(entry)
}

export async function updateCalendarEntry(workspaceId: string, id: string, input: UpdateCalendarEntryInput) {
  const existing = await prisma.calendarEntry.findFirst({ where: { id, workspaceId } })
  if (!existing) throw new NotFoundError('Calendar entry not found')
  await assertReferencesExist(workspaceId, {
    productId: input.productId ?? undefined,
    strategyId: input.strategyId ?? undefined,
  })

  const entry = await prisma.calendarEntry.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.date !== undefined ? { date: input.date } : {}),
      ...(input.productId !== undefined ? { productId: input.productId } : {}),
      ...(input.contentType !== undefined ? { contentType: CONTENT_TYPE_TO_DB[input.contentType] } : {}),
      ...(input.platform !== undefined ? { platform: input.platform } : {}),
      ...(input.gridPosition !== undefined ? { gridPosition: input.gridPosition } : {}),
      ...(input.strategyId !== undefined ? { strategyId: input.strategyId } : {}),
      ...(input.status !== undefined ? { status: STATUS_TO_DB[input.status] } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    },
    include: includeProduct,
  })
  return toCalendarEntryView(entry)
}

export async function rescheduleCalendarEntry(workspaceId: string, id: string, input: RescheduleCalendarEntryInput) {
  const existing = await prisma.calendarEntry.findFirst({ where: { id, workspaceId } })
  if (!existing) throw new NotFoundError('Calendar entry not found')

  const entry = await prisma.calendarEntry.update({
    where: { id },
    data: { date: input.date, status: existing.status === 'PLANNED' ? 'SCHEDULED' : existing.status },
    include: includeProduct,
  })
  return toCalendarEntryView(entry)
}
