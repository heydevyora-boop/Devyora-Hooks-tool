import { prisma } from '../lib/prisma.js'
import { buildCursorPage } from '../lib/pagination.js'
import { NotFoundError } from '../lib/errors.js'
import type {
  ContentHistoryInput,
  ContentHistoryUpdateInput,
  PerformanceSnapshotInput,
} from '../validation/contentHistory.schema.js'
import type {
  ContentHistory,
  ContentHistoryFormat,
  ContentHistoryStatus,
  ContentPerformance,
  Product,
  PerformanceSource,
} from '@prisma/client'

const FORMAT_TO_DB: Record<string, ContentHistoryFormat> = {
  Reel: 'REEL',
  Carousel: 'CAROUSEL',
  Static: 'STATIC',
  Story: 'STORY',
  Video: 'VIDEO',
}
const FORMAT_FROM_DB: Record<ContentHistoryFormat, string> = {
  REEL: 'Reel',
  CAROUSEL: 'Carousel',
  STATIC: 'Static',
  STORY: 'Story',
  VIDEO: 'Video',
}

const STATUS_TO_DB: Record<string, ContentHistoryStatus> = {
  Published: 'PUBLISHED',
  Draft: 'DRAFT',
  Scheduled: 'SCHEDULED',
}
const STATUS_FROM_DB: Record<ContentHistoryStatus, string> = {
  PUBLISHED: 'Published',
  DRAFT: 'Draft',
  SCHEDULED: 'Scheduled',
}

type HistoryWithProduct = ContentHistory & { product: Product | null }

/** Matches the frontend's ContentHistoryItem shape exactly (Chunk 2
 * blueprint §10) — `product` is the product's display name, not its id,
 * since that's what every history card/timeline component already renders. */
export function toContentHistoryView(row: HistoryWithProduct) {
  return {
    id: row.id,
    title: row.title,
    product: row.product?.name,
    productId: row.productId,
    topic: row.topic,
    format: FORMAT_FROM_DB[row.format],
    platform: row.platform,
    date: row.publishedDate.toISOString().slice(0, 10),
    hook: row.hook ?? undefined,
    performanceLabel: row.performanceLabel ?? undefined,
    engagement: row.engagementSummary ?? undefined,
    status: STATUS_FROM_DB[row.status],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export function toPerformanceView(row: ContentPerformance) {
  return {
    id: row.id,
    capturedAt: row.capturedAt.toISOString(),
    views: row.views,
    likes: row.likes,
    shares: row.shares,
    comments: row.comments,
    saves: row.saves,
    engagementRate: row.engagementRate,
    holdRate3s: row.holdRate3s,
    source: row.source.toLowerCase(),
  }
}

export async function listContentHistory(
  workspaceId: string,
  opts: { limit: number; cursor?: string; productId?: string; format?: string; status?: string; q?: string },
) {
  const rows = await prisma.contentHistory.findMany({
    where: {
      workspaceId,
      ...(opts.productId ? { productId: opts.productId } : {}),
      ...(opts.format ? { format: FORMAT_TO_DB[opts.format] } : {}),
      ...(opts.status ? { status: STATUS_TO_DB[opts.status] } : {}),
      ...(opts.q
        ? {
            OR: [
              { title: { contains: opts.q, mode: 'insensitive' } },
              { topic: { contains: opts.q, mode: 'insensitive' } },
              { hook: { contains: opts.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: { product: true },
    orderBy: { publishedDate: 'desc' },
    take: opts.limit + 1,
    ...(opts.cursor ? { skip: 1, cursor: { id: opts.cursor } } : {}),
  })

  const { items, nextCursor } = buildCursorPage(rows, opts.limit)
  return { items: items.map(toContentHistoryView), nextCursor }
}

export async function getContentHistory(workspaceId: string, id: string) {
  const row = await prisma.contentHistory.findFirst({ where: { id, workspaceId }, include: { product: true } })
  if (!row) throw new NotFoundError('Content history item not found')
  return toContentHistoryView(row)
}

export async function createContentHistory(workspaceId: string, createdBy: string, input: ContentHistoryInput) {
  const row = await prisma.contentHistory.create({
    data: {
      workspaceId,
      createdBy,
      title: input.title,
      productId: input.productId,
      topic: input.topic,
      format: FORMAT_TO_DB[input.format]!,
      platform: input.platform,
      publishedDate: input.date,
      hook: input.hook,
      status: STATUS_TO_DB[input.status]!,
      performanceLabel: input.performanceLabel,
      engagementSummary: input.engagement,
    },
    include: { product: true },
  })
  return toContentHistoryView(row)
}

export async function updateContentHistory(workspaceId: string, id: string, input: ContentHistoryUpdateInput) {
  const existing = await prisma.contentHistory.findFirst({ where: { id, workspaceId } })
  if (!existing) throw new NotFoundError('Content history item not found')

  const row = await prisma.contentHistory.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.productId !== undefined ? { productId: input.productId } : {}),
      ...(input.topic !== undefined ? { topic: input.topic } : {}),
      ...(input.format !== undefined ? { format: FORMAT_TO_DB[input.format] } : {}),
      ...(input.platform !== undefined ? { platform: input.platform } : {}),
      ...(input.date !== undefined ? { publishedDate: input.date } : {}),
      ...(input.hook !== undefined ? { hook: input.hook } : {}),
      ...(input.status !== undefined ? { status: STATUS_TO_DB[input.status] } : {}),
      ...(input.performanceLabel !== undefined ? { performanceLabel: input.performanceLabel } : {}),
      ...(input.engagement !== undefined ? { engagementSummary: input.engagement } : {}),
    },
    include: { product: true },
  })
  return toContentHistoryView(row)
}

export async function addPerformanceSnapshot(
  workspaceId: string,
  contentHistoryId: string,
  input: PerformanceSnapshotInput,
) {
  const existing = await prisma.contentHistory.findFirst({ where: { id: contentHistoryId, workspaceId } })
  if (!existing) throw new NotFoundError('Content history item not found')

  const row = await prisma.contentPerformance.create({
    data: {
      contentHistoryId,
      views: input.views,
      likes: input.likes,
      shares: input.shares,
      comments: input.comments,
      saves: input.saves,
      engagementRate: input.engagementRate,
      holdRate3s: input.holdRate3s,
      source: input.source.toUpperCase() as PerformanceSource,
    },
  })
  return toPerformanceView(row)
}

export async function listPerformanceSnapshots(workspaceId: string, contentHistoryId: string) {
  const existing = await prisma.contentHistory.findFirst({ where: { id: contentHistoryId, workspaceId } })
  if (!existing) throw new NotFoundError('Content history item not found')

  const rows = await prisma.contentPerformance.findMany({
    where: { contentHistoryId },
    orderBy: { capturedAt: 'desc' },
  })
  return rows.map(toPerformanceView)
}
