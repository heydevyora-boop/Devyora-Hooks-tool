import { prisma } from '../lib/prisma.js'
import { NotFoundError } from '../lib/errors.js'
import { analyzeContentGaps } from './gapEngine.service.js'
import { toSourceView } from './source.service.js'

/**
 * Per-product rollup over real stored data only — every field here is a
 * direct query or aggregation against this product's own rows. Inspiration
 * "relationships" are a best-effort text match (the product's own name and
 * content angles against each inspiration pattern's topic/content angle) —
 * never a guess dressed up as a real link.
 */
export async function getProductIntelligence(workspaceId: string, productId: string) {
  const product = await prisma.product.findFirst({ where: { id: productId, workspaceId } })
  if (!product) throw new NotFoundError('Product not found')

  const now = new Date()

  const [historyCount, lastHistory, plannedEntries, upcomingEntries, performanceAgg, strategyLinks, allGaps, allInspiration] =
    await Promise.all([
      prisma.contentHistory.count({ where: { workspaceId, productId } }),
      prisma.contentHistory.findFirst({ where: { workspaceId, productId }, orderBy: { publishedDate: 'desc' } }),
      prisma.calendarEntry.findMany({
        where: { workspaceId, productId, status: { in: ['PLANNED', 'SCHEDULED'] } },
        orderBy: { date: 'asc' },
      }),
      prisma.calendarEntry.findMany({
        where: { workspaceId, productId, date: { gte: now } },
        orderBy: { date: 'asc' },
        take: 10,
      }),
      prisma.contentPerformance.aggregate({
        where: { contentHistory: { workspaceId, productId } },
        _avg: { views: true, engagementRate: true },
        _count: { _all: true },
      }),
      prisma.strategyProduct.findMany({ where: { productId }, include: { strategy: true } }),
      analyzeContentGaps(workspaceId, [productId]),
      prisma.inspirationItem.findMany({ where: { workspaceId }, include: { contentSource: true }, orderBy: { savedAt: 'desc' } }),
    ])

  const relevantStrategies = strategyLinks
    .filter((link) => link.strategy.workspaceId === workspaceId)
    .map((link) => ({ id: link.strategy.id, goal: link.strategy.goal, status: link.strategy.status.toLowerCase() }))

  const productAngles = (product.contentAngles as string[]).map((a) => a.toLowerCase())
  const relatedInspiration = allInspiration
    .filter((item) => {
      const pattern = item.pattern as Record<string, string>
      const haystack = `${pattern.topic ?? ''} ${pattern.contentAngle ?? ''}`.toLowerCase()
      return (
        haystack.includes(product.name.toLowerCase()) ||
        productAngles.some((angle) => angle.length > 0 && haystack.includes(angle))
      )
    })
    .slice(0, 5)
    .map((item) => ({ id: item.id, source: toSourceView(item.contentSource), savedAt: item.savedAt.toISOString() }))

  return {
    productId: product.id,
    productName: product.name,
    contentCount: historyCount,
    lastUsedDate: lastHistory?.publishedDate.toISOString().slice(0, 10) ?? null,
    plannedContent: plannedEntries.map((entry) => ({ id: entry.id, title: entry.title, date: entry.date.toISOString().slice(0, 10) })),
    upcomingContent: upcomingEntries.map((entry) => ({ id: entry.id, title: entry.title, date: entry.date.toISOString().slice(0, 10) })),
    performance: {
      averageViews: performanceAgg._avg.views !== null ? Math.round(performanceAgg._avg.views) : null,
      averageEngagementRate: performanceAgg._avg.engagementRate,
      snapshotCount: performanceAgg._count._all,
    },
    coverageGaps: allGaps.map((gap) => ({ type: gap.type, message: gap.message, priority: gap.priority })),
    inspirationRelationships: relatedInspiration,
    strategyRelationships: relevantStrategies,
  }
}
