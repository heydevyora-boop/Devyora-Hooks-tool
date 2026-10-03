import { prisma } from '../lib/prisma.js'

export type ContentGapType = 'no_content' | 'stale' | 'underrepresented_in_grid'

export interface ContentGap {
  type: ContentGapType
  productId: string | null
  productName: string
  message: string
  priority: 'low' | 'medium' | 'high'
}

const STALE_AFTER_DAYS = 30

/**
 * Real gap analysis over stored data only — Historical Content, Product
 * coverage, posting frequency (days since last post), and the active
 * Content Grid. Per the explicit "do not fabricate data" instruction:
 * every gap returned here traces back to an actual row (or the absence
 * of one), and products with no gaps simply produce no entries — this
 * never invents a finding to fill the list.
 */
export async function analyzeContentGaps(workspaceId: string, productIds?: string[]): Promise<ContentGap[]> {
  const [products, activeGrid] = await Promise.all([
    prisma.product.findMany({
      where: { workspaceId, ...(productIds && productIds.length > 0 ? { id: { in: productIds } } : {}) },
    }),
    prisma.workspaceActiveGrid.findUnique({
      where: { workspaceId },
      include: { gridTemplate: { include: { slots: true } } },
    }),
  ])

  if (products.length === 0) return []

  const historyByProduct = await prisma.contentHistory.groupBy({
    by: ['productId'],
    where: { workspaceId, productId: { in: products.map((p) => p.id) } },
    _count: { _all: true },
    _max: { publishedDate: true },
  })
  const historyMap = new Map(historyByProduct.map((row) => [row.productId, row]))

  const gridSlotCountByProduct = new Map<string, number>()
  for (const slot of activeGrid?.gridTemplate.slots ?? []) {
    if (!slot.productId) continue
    gridSlotCountByProduct.set(slot.productId, (gridSlotCountByProduct.get(slot.productId) ?? 0) + 1)
  }

  const gaps: ContentGap[] = []
  const now = Date.now()

  for (const product of products) {
    const history = historyMap.get(product.id)
    const count = history?._count._all ?? 0

    if (count === 0) {
      gaps.push({
        type: 'no_content',
        productId: product.id,
        productName: product.name,
        message: `No content yet for ${product.name}`,
        priority: 'high',
      })
    } else {
      const lastPublished = history?._max.publishedDate
      const daysSince = lastPublished ? Math.floor((now - lastPublished.getTime()) / 86_400_000) : Infinity
      if (daysSince > STALE_AFTER_DAYS) {
        gaps.push({
          type: 'stale',
          productId: product.id,
          productName: product.name,
          message: `No new content for ${product.name} in ${daysSince} days`,
          priority: 'medium',
        })
      }
    }

    if (activeGrid && !gridSlotCountByProduct.has(product.id)) {
      gaps.push({
        type: 'underrepresented_in_grid',
        productId: product.id,
        productName: product.name,
        message: `${product.name} has no slots in the active grid "${activeGrid.gridTemplate.name}"`,
        priority: 'low',
      })
    }
  }

  return gaps
}
