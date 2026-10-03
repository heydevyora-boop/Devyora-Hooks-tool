import { prisma } from '../lib/prisma.js'
import { toProductKnowledge } from './product.service.js'
import { toContentHistoryView } from './contentHistory.service.js'
import { toInspirationView } from './inspiration.service.js'
import { toGridTemplateView } from './grid.service.js'
import { toContentRuleView } from './contentRule.service.js'
import { toSourceView } from './source.service.js'

/**
 * A real-data overview across every Knowledge Base domain (Chunk 4 §4) —
 * every number here is a live count from the DB, never a placeholder.
 * "Approved content" = published historical content (the closest real
 * concept to "approved" that exists pre-AI-generation); there's no
 * separate approval step for content itself yet, only for deleting
 * Products/Grids/Inspiration (see approval.service.ts).
 */
export async function getOverview(workspaceId: string) {
  const [
    productCount,
    brandProfile,
    historyCount,
    publishedHistoryCount,
    inspirationCount,
    gridCount,
    activeGrid,
    ruleCount,
    lockedRuleCount,
    performanceSnapshotCount,
    pendingApprovalCount,
    instagramConnection,
  ] = await Promise.all([
    prisma.product.count({ where: { workspaceId } }),
    prisma.brandProfile.findUnique({ where: { workspaceId } }),
    prisma.contentHistory.count({ where: { workspaceId } }),
    prisma.contentHistory.count({ where: { workspaceId, status: 'PUBLISHED' } }),
    prisma.inspirationItem.count({ where: { workspaceId } }),
    prisma.gridTemplate.count({ where: { workspaceId } }),
    prisma.workspaceActiveGrid.findUnique({ where: { workspaceId } }),
    prisma.contentRule.count({ where: { workspaceId } }),
    prisma.contentRule.count({ where: { workspaceId, isLocked: true } }),
    prisma.contentPerformance.count({ where: { contentHistory: { workspaceId } } }),
    prisma.pendingApproval.count({ where: { workspaceId, resolution: 'PENDING' } }),
    prisma.instagramConnection.findUnique({ where: { workspaceId } }),
  ])

  return {
    products: { count: productCount },
    brand: { configured: Boolean(brandProfile?.brandName) },
    historicalContent: { count: historyCount, approved: publishedHistoryCount },
    inspiration: { count: inspirationCount },
    contentGrids: { count: gridCount, activeGridId: activeGrid?.gridTemplateId ?? null },
    contentRules: { count: ruleCount, locked: lockedRuleCount },
    performanceIntelligence: { snapshotCount: performanceSnapshotCount },
    pendingApprovals: { count: pendingApprovalCount },
    instagram: { connected: instagramConnection?.status === 'CONNECTED' },
  }
}

/**
 * Cross-entity search across the whole Knowledge Base — real substring
 * matches against stored data only, grouped by entity type so the caller
 * can render a mixed results list without guessing what matched.
 */
export async function search(workspaceId: string, q: string, limit: number) {
  const insensitive = { contains: q, mode: 'insensitive' as const }

  const [products, historyItems, inspirationItems, gridTemplates, contentRules, sources] = await Promise.all([
    prisma.product.findMany({
      where: { workspaceId, OR: [{ name: insensitive }, { description: insensitive }] },
      take: limit,
    }),
    prisma.contentHistory.findMany({
      where: { workspaceId, OR: [{ title: insensitive }, { topic: insensitive }, { hook: insensitive }] },
      include: { product: true },
      take: limit,
    }),
    prisma.inspirationItem.findMany({
      where: { workspaceId, notes: insensitive },
      include: { contentSource: true },
      take: limit,
    }),
    prisma.gridTemplate.findMany({
      where: { workspaceId, OR: [{ name: insensitive }, { description: insensitive }] },
      include: { slots: { include: { product: true } } },
      take: limit,
    }),
    prisma.contentRule.findMany({
      where: { workspaceId, OR: [{ title: insensitive }, { description: insensitive }, { category: insensitive }] },
      take: limit,
    }),
    prisma.contentSource.findMany({
      where: { workspaceId, OR: [{ title: insensitive }, { value: insensitive }] },
      take: limit,
    }),
  ])

  return {
    products: products.map((p) => ({ type: 'product' as const, item: toProductKnowledge(p) })),
    historicalContent: historyItems.map((h) => ({ type: 'content_history' as const, item: toContentHistoryView(h) })),
    inspiration: inspirationItems.map((i) => ({ type: 'inspiration' as const, item: toInspirationView(i) })),
    contentGrids: gridTemplates.map((g) => ({ type: 'grid_template' as const, item: toGridTemplateView(g) })),
    contentRules: contentRules.map((r) => ({ type: 'content_rule' as const, item: toContentRuleView(r) })),
    sources: sources.map((s) => ({ type: 'source' as const, item: toSourceView(s) })),
  }
}
