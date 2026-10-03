import { prisma } from '../lib/prisma.js'

/**
 * Every number here is a formula over real stored rows — counts, dates,
 * and averages queried directly from the DB. This is explicitly `type:
 * "calculated"`, never `"ai_assessment"` (see video_blueprint.service.ts
 * for that distinct category), per the instruction to keep the two
 * clearly separate. A metric with no real baseline to compute from
 * (e.g. posting consistency with fewer than 2 historical posts) reports
 * `null` rather than a fabricated number.
 */

const DAY_MS = 86_400_000

function average(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function standardDeviation(values: number[]): number | null {
  if (values.length < 2) return null
  const mean = average(values)!
  const variance = average(values.map((v) => (v - mean) ** 2))!
  return Math.sqrt(variance)
}

export async function computeContentHealth(workspaceId: string) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * DAY_MS)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * DAY_MS)

  const [
    totalProducts,
    distinctProductHistory,
    postsLast30,
    postsLast60,
    formatCounts,
    performanceAgg,
    strategySlots,
    activeStrategyCount,
    calendarCounts,
    historicalPublishedTotal,
  ] = await Promise.all([
    prisma.product.count({ where: { workspaceId } }),
    prisma.contentHistory.findMany({ where: { workspaceId, productId: { not: null } }, select: { productId: true }, distinct: ['productId'] }),
    prisma.contentHistory.count({ where: { workspaceId, publishedDate: { gte: thirtyDaysAgo } } }),
    prisma.contentHistory.findMany({
      where: { workspaceId, publishedDate: { gte: sixtyDaysAgo } },
      select: { publishedDate: true },
      orderBy: { publishedDate: 'asc' },
    }),
    prisma.contentHistory.groupBy({ by: ['format'], where: { workspaceId }, _count: { _all: true } }),
    prisma.contentPerformance.aggregate({
      where: { contentHistory: { workspaceId } },
      _avg: { views: true, engagementRate: true, holdRate3s: true },
      _count: { _all: true },
    }),
    prisma.strategySequenceSlot.findMany({ where: { strategy: { workspaceId } }, include: { flowchartNode: true } }),
    prisma.contentStrategy.count({ where: { workspaceId, status: 'ACTIVE' } }),
    prisma.calendarEntry.groupBy({ by: ['status'], where: { workspaceId }, _count: { _all: true } }),
    prisma.contentHistory.count({ where: { workspaceId } }),
  ])

  // --- Posting consistency: real gap-between-posts analysis -------------
  const gaps: number[] = []
  for (let i = 1; i < postsLast60.length; i += 1) {
    const diffDays = (postsLast60[i]!.publishedDate.getTime() - postsLast60[i - 1]!.publishedDate.getTime()) / DAY_MS
    gaps.push(diffDays)
  }
  const averageGapDays = average(gaps)
  const gapStdDev = standardDeviation(gaps)
  const postingConsistencyScore = gapStdDev === null ? null : Math.max(0, Math.round(100 - gapStdDev * 5))

  // --- Product coverage ---------------------------------------------------
  const productsWithContent = distinctProductHistory.length
  const coveragePercent = totalProducts > 0 ? Math.round((productsWithContent / totalProducts) * 100) : null

  // --- Content frequency ---------------------------------------------------
  const postsPerWeek = Math.round((postsLast30 / 30) * 7 * 10) / 10

  // --- Content type distribution --------------------------------------------
  const contentTypeDistribution: Record<string, number> = { reel: 0, carousel: 0, static: 0, story: 0, video: 0 }
  for (const row of formatCounts) {
    contentTypeDistribution[row.format.toLowerCase()] = row._count._all
  }

  // --- Strategy completion ------------------------------------------------
  const totalSlots = strategySlots.length
  const completedSlots = strategySlots.filter((slot) => slot.flowchartNode?.status === 'DONE').length
  const strategyCompletionPercent = totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : null

  // --- Planned vs published ------------------------------------------------
  const calendarPlanned = calendarCounts
    .filter((row) => row.status === 'PLANNED' || row.status === 'SCHEDULED')
    .reduce((sum, row) => sum + row._count._all, 0)
  const plannedVsPublishedRatio =
    historicalPublishedTotal + calendarPlanned > 0
      ? Math.round((historicalPublishedTotal / (historicalPublishedTotal + calendarPlanned)) * 100)
      : null

  const calculatedScores = [postingConsistencyScore, coveragePercent, strategyCompletionPercent].filter(
    (score): score is number => score !== null,
  )
  const overallScore = calculatedScores.length > 0 ? Math.round(average(calculatedScores)!) : null

  return {
    type: 'calculated' as const,
    overallScore,
    postingConsistency: {
      score: postingConsistencyScore,
      postsLast30Days: postsLast30,
      averageGapDays: averageGapDays === null ? null : Math.round(averageGapDays * 10) / 10,
    },
    productCoverage: {
      totalProducts,
      productsWithContent,
      coveragePercent,
    },
    contentFrequency: {
      postsLast30Days: postsLast30,
      postsPerWeek,
    },
    contentTypeDistribution,
    historicalPerformance: {
      averageViews: performanceAgg._avg.views !== null ? Math.round(performanceAgg._avg.views) : null,
      averageEngagementRate: performanceAgg._avg.engagementRate,
      averageHoldRate3s: performanceAgg._avg.holdRate3s,
      snapshotCount: performanceAgg._count._all,
    },
    strategyCompletion: {
      activeStrategies: activeStrategyCount,
      totalSlots,
      completedSlots,
      completionPercent: strategyCompletionPercent,
    },
    plannedVsPublished: {
      planned: calendarPlanned,
      published: historicalPublishedTotal,
      publishedPercent: plannedVsPublishedRatio,
    },
  }
}
