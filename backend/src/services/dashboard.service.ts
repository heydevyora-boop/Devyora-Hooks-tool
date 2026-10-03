import { prisma } from '../lib/prisma.js'
import { getStatus as getInstagramStatus } from './instagram.service.js'
import { computeContentHealth } from './contentHealth.service.js'
import { getTrendsAndOpportunities } from './trends.service.js'
import { toContentHistoryView } from './contentHistory.service.js'
import { toGeneratedContentView } from './generation.service.js'
import { toCalendarEntryView } from './calendar.service.js'

/**
 * Every section below is either a direct DB query or a call into an
 * existing, already-real service (Instagram status, Content Health, the
 * Gap Engine / Trends service) — the dashboard aggregates, it never
 * invents its own numbers. Per the Chunk 6 instruction: "Use real
 * database data. Do not use fake/static dashboard values."
 */
export async function getDashboard(workspaceId: string) {
  const now = new Date()
  const in14Days = new Date(now.getTime() + 14 * 86_400_000)

  const [
    instagramStatus,
    contentHealth,
    recentHistory,
    inProgressGenerations,
    trendsAndOpportunities,
    upcomingCalendarRows,
    flowchartNodeGroups,
    nextContentNodes,
    productStats,
    products,
  ] = await Promise.all([
    getInstagramStatus(workspaceId),
    computeContentHealth(workspaceId),
    prisma.contentHistory.findMany({
      where: { workspaceId },
      include: { product: true },
      orderBy: { publishedDate: 'desc' },
      take: 5,
    }),
    prisma.generatedContent.findMany({
      where: { workspaceId, stage: { in: ['GENERATED', 'REVIEW', 'APPROVED'] } },
      include: { product: true, versions: { orderBy: { version: 'asc' }, include: { blueprintScore: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
    getTrendsAndOpportunities(workspaceId),
    prisma.calendarEntry.findMany({
      where: { workspaceId, date: { gte: now, lte: in14Days } },
      include: { product: true },
      orderBy: { date: 'asc' },
      take: 10,
    }),
    prisma.flowchartNode.groupBy({
      by: ['status'],
      where: { flowchart: { workspaceId } },
      _count: { _all: true },
    }),
    prisma.flowchartNode.findMany({
      where: { flowchart: { workspaceId }, type: 'CONTENT', status: { in: ['PENDING', 'IN_PROGRESS'] } },
      include: { product: true },
      orderBy: { gridPosition: 'asc' },
      take: 5,
    }),
    prisma.contentHistory.groupBy({
      by: ['productId'],
      where: { workspaceId, productId: { not: null } },
      _count: { _all: true },
      _max: { publishedDate: true },
    }),
    prisma.product.findMany({ where: { workspaceId }, orderBy: { createdAt: 'desc' }, take: 20 }),
  ])

  const contentGaps = trendsAndOpportunities.filter((t) => t.type === 'low_coverage' || t.type === 'content_gap')
  const emergingTrends = trendsAndOpportunities.filter((t) => t.type === 'performance_pattern' || t.type === 'inspiration_pattern')
  const newOpportunities = trendsAndOpportunities.filter(
    (t) => t.type === 'unused_grid_position' || t.type === 'strategy_requirement',
  )
  const productsDue = contentGaps
    .filter((t) => t.relatedEntity?.type === 'product')
    .map((t) => ({ productId: t.relatedEntity!.id, productName: t.relatedEntity!.label, reason: t.description }))

  const statsByProduct = new Map(productStats.map((row) => [row.productId, row]))
  const productIntelligenceSummary = products.map((product) => {
    const stats = statsByProduct.get(product.id)
    return {
      productId: product.id,
      productName: product.name,
      contentCount: stats?._count._all ?? 0,
      lastUsedDate: stats?._max.publishedDate?.toISOString().slice(0, 10) ?? null,
      hasOpenGap: contentGaps.some((gap) => gap.relatedEntity?.id === product.id),
    }
  })

  const flowNodeStatusCounts = Object.fromEntries(
    flowchartNodeGroups.map((row) => [row.status.toLowerCase(), row._count._all]),
  )

  return {
    instagram: instagramStatus,
    contentHealth,
    currentContent: {
      recentlyPublished: recentHistory.map(toContentHistoryView),
      inProgress: inProgressGenerations.map((g) => toGeneratedContentView(g)),
    },
    contentGaps,
    emergingTrends,
    newOpportunities,
    productsDue,
    contentFlow: {
      nodeStatusCounts: flowNodeStatusCounts,
      nextUp: nextContentNodes.map((node) => ({
        id: node.id,
        label: node.label,
        product: node.product?.name,
        status: node.status.toLowerCase(),
        gridPosition: node.gridPosition ?? undefined,
      })),
    },
    contentCalendar: upcomingCalendarRows.map((row) => toCalendarEntryView(row)),
    productIntelligence: productIntelligenceSummary,
  }
}
