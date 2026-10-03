import { prisma } from '../lib/prisma.js'
import { analyzeContentGaps } from './gapEngine.service.js'

export type TrendType =
  | 'low_coverage'
  | 'content_gap'
  | 'unused_grid_position'
  | 'strategy_requirement'
  | 'performance_pattern'
  | 'inspiration_pattern'

export interface TrendOrOpportunity {
  id: string
  type: TrendType
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  relatedEntity?: { type: string; id: string; label: string }
}

/**
 * Every entry here traces back to a real row or aggregation — gap-engine
 * findings, an actually-empty grid slot, an actually-unstarted strategy
 * slot, a real performance comparison across formats, or a real
 * unused-inspiration check. Nothing is invented to fill the list; an empty
 * array is a valid, honest result. See the Chunk 6 instruction: "Do not
 * fabricate trends."
 */
export async function getTrendsAndOpportunities(workspaceId: string): Promise<TrendOrOpportunity[]> {
  const items: TrendOrOpportunity[] = []

  // --- 1 & 2: Gap Engine findings (no content / stale / underrepresented) ---
  const gaps = await analyzeContentGaps(workspaceId)
  for (const gap of gaps) {
    const type: TrendType =
      gap.type === 'no_content' ? 'low_coverage' : gap.type === 'stale' ? 'content_gap' : 'unused_grid_position'
    items.push({
      id: `gap-${gap.type}-${gap.productId ?? 'workspace'}`,
      type,
      title: gap.type === 'no_content' ? 'Low content coverage' : gap.type === 'stale' ? 'Content gap' : 'Underused in active grid',
      description: gap.message,
      severity: gap.priority,
      relatedEntity: gap.productId ? { type: 'product', id: gap.productId, label: gap.productName } : undefined,
    })
  }

  // --- 3: Unassigned slots in the active grid --------------------------------
  const activeGrid = await prisma.workspaceActiveGrid.findUnique({
    where: { workspaceId },
    include: { gridTemplate: { include: { slots: true } } },
  })
  if (activeGrid) {
    for (const slot of activeGrid.gridTemplate.slots) {
      if (slot.contentType !== 'EMPTY' && !slot.productId) {
        items.push({
          id: `grid-slot-${slot.id}`,
          type: 'unused_grid_position',
          title: 'Unassigned grid position',
          description: `Position #${slot.position + 1} in "${activeGrid.gridTemplate.name}" is a ${slot.contentType.toLowerCase()} slot with no product assigned.`,
          severity: 'low',
          relatedEntity: { type: 'grid_slot', id: slot.id, label: `Position #${slot.position + 1}` },
        })
      }
    }
  }

  // --- 4: Active strategy slots with no generated content yet ---------------
  const pendingSlots = await prisma.strategySequenceSlot.findMany({
    where: { strategy: { workspaceId, status: 'ACTIVE' }, flowchartNode: { generatedContent: null } },
    include: { strategy: true, product: true, flowchartNode: true },
  })
  for (const slot of pendingSlots) {
    items.push({
      id: `strategy-slot-${slot.id}`,
      type: 'strategy_requirement',
      title: 'Strategy content not yet generated',
      description: `"${slot.strategy.goal}" calls for a ${slot.contentType.toLowerCase()} for ${slot.product?.name ?? 'an unassigned product'} in ${slot.weekLabel} — no script has been generated for it yet.`,
      severity: 'medium',
      relatedEntity: { type: 'content_strategy', id: slot.strategyId, label: slot.strategy.goal },
    })
  }

  // --- 5: Real cross-format performance comparison ---------------------------
  // Prisma's groupBy can't aggregate a related table's column directly, so
  // pull each history row's latest performance snapshot and average by
  // format in application code.
  const historyWithPerf = await prisma.contentHistory.findMany({
    where: { workspaceId },
    include: { performanceSnapshots: { orderBy: { capturedAt: 'desc' }, take: 1 } },
  })
  const viewsByFormat = new Map<string, number[]>()
  for (const row of historyWithPerf) {
    const views = row.performanceSnapshots[0]?.views
    if (views === null || views === undefined) continue
    const list = viewsByFormat.get(row.format) ?? []
    list.push(views)
    viewsByFormat.set(row.format, list)
  }
  if (viewsByFormat.size >= 2) {
    const averages = Array.from(viewsByFormat.entries()).map(([format, values]) => ({
      format,
      avgViews: values.reduce((sum, v) => sum + v, 0) / values.length,
      count: values.length,
    }))
    averages.sort((a, b) => b.avgViews - a.avgViews)
    const best = averages[0]!
    const worst = averages[averages.length - 1]!
    if (best.avgViews > 0 && best.format !== worst.format) {
      const liftPercent = Math.round(((best.avgViews - worst.avgViews) / Math.max(worst.avgViews, 1)) * 100)
      items.push({
        id: `performance-pattern-${best.format}`,
        type: 'performance_pattern',
        title: 'Format performance pattern',
        description: `${best.format} content averages ${Math.round(best.avgViews).toLocaleString()} views across ${best.count} post(s), ${liftPercent}% higher than ${worst.format} — based on real historical performance, not a prediction.`,
        severity: 'low',
      })
    }
  }

  // --- 6: A saved inspiration pattern not yet reflected in any generation ----
  const recentInspiration = await prisma.inspirationItem.findMany({
    where: { workspaceId },
    orderBy: { savedAt: 'desc' },
    take: 5,
  })
  const recentVersions = await prisma.generatedContentVersion.findMany({
    where: { generatedContent: { workspaceId } },
    select: { hook: true, angle: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  const usedText = recentVersions.map((v) => `${v.hook} ${v.angle}`.toLowerCase()).join(' ')
  for (const item of recentInspiration) {
    const pattern = item.pattern as Record<string, string>
    const angle = pattern.contentAngle?.trim()
    if (angle && !usedText.includes(angle.toLowerCase())) {
      items.push({
        id: `inspiration-pattern-${item.id}`,
        type: 'inspiration_pattern',
        title: 'Unused inspiration pattern',
        description: `The "${angle}" angle saved from inspiration hasn't shown up in any generated script yet — consider using it for your next piece.`,
        severity: 'low',
        relatedEntity: { type: 'inspiration', id: item.id, label: angle },
      })
      break // one honest suggestion at a time, not a wall of the same kind of item
    }
  }

  return items
}
