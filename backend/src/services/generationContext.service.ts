import { prisma } from '../lib/prisma.js'
import { NotFoundError, ValidationError } from '../lib/errors.js'
import type {
  BrandProfile,
  ContentHistory,
  ContentRule,
  ContentStrategy,
  FlowchartNode,
  GridSlot,
  GridTemplate,
  InspirationItem,
  InstagramConnection,
  Product,
} from '@prisma/client'

export interface GenerationRequestInput {
  flowchartNodeId?: string
  productId?: string
  topic?: string
  platform?: string
  userInstructions?: string
}

export interface GenerationContext {
  node: (FlowchartNode & { flowchart: { strategyId: string } }) | null
  strategy: ContentStrategy | null
  product: Product | null
  brand: BrandProfile | null
  instagram: InstagramConnection | null
  recentHistory: ContentHistory[]
  inspiration: InspirationItem[]
  activeGrid: (GridTemplate & { slots: GridSlot[] }) | null
  contentRules: ContentRule[]
  userInstructions?: string
  topic: string
  platform: string
  gridPosition?: number
  dateLabel?: string
  productIdResolved?: string
  strategyIdResolved?: string
  contextSourcesUsed: string[]
}

/**
 * Collects real, currently-available Content Intelligence context for a
 * generation request — Product Knowledge, Instagram/account data,
 * Historical Content, Inspiration, the active Content Grid, Brand/Content
 * Rules (the "Knowledge Base" guardrails), Content Strategy, Flowchart,
 * and the user's own instructions. Per the explicit instruction to "use
 * only relevant context," every section here is conditionally included —
 * `contextSourcesUsed` records exactly what was actually found, never a
 * fixed list.
 */
export async function buildGenerationContext(
  workspaceId: string,
  input: GenerationRequestInput,
): Promise<GenerationContext> {
  let node: GenerationContext['node'] = null
  let strategy: ContentStrategy | null = null
  let productId = input.productId
  let topic = input.topic
  let gridPosition: number | undefined
  let dateLabel: string | undefined

  if (input.flowchartNodeId) {
    const row = await prisma.flowchartNode.findFirst({
      where: { id: input.flowchartNodeId, flowchart: { workspaceId } },
      include: { flowchart: { select: { strategyId: true } } },
    })
    if (!row) throw new NotFoundError('Flowchart node not found')
    if (row.type !== 'CONTENT') {
      throw new ValidationError('Validation failed', { flowchartNodeId: 'This node is not a content node' })
    }
    node = row
    productId = productId ?? row.productId ?? undefined
    topic = topic ?? row.reason ?? row.label
    gridPosition = row.gridPosition ?? undefined
    dateLabel = row.dateLabel ?? undefined
    strategy = await prisma.contentStrategy.findFirst({ where: { id: row.flowchart.strategyId, workspaceId } })
  }

  if (!topic) {
    throw new ValidationError('Validation failed', { topic: 'Topic is required' })
  }

  const [product, brand, instagram, activeGrid, contentRules] = await Promise.all([
    productId ? prisma.product.findFirst({ where: { id: productId, workspaceId } }) : Promise.resolve(null),
    prisma.brandProfile.findUnique({ where: { workspaceId } }),
    prisma.instagramConnection.findUnique({ where: { workspaceId } }),
    prisma.workspaceActiveGrid
      .findUnique({ where: { workspaceId }, include: { gridTemplate: { include: { slots: true } } } })
      .then((active) => active?.gridTemplate ?? null),
    prisma.contentRule.findMany({ where: { workspaceId }, orderBy: { createdAt: 'desc' }, take: 20 }),
  ])

  const recentHistory = await prisma.contentHistory.findMany({
    where: { workspaceId, ...(productId ? { productId } : {}) },
    orderBy: { publishedDate: 'desc' },
    take: 10,
  })

  const inspiration = await prisma.inspirationItem.findMany({
    where: { workspaceId },
    orderBy: { savedAt: 'desc' },
    take: 10,
  })

  const contextSourcesUsed: string[] = []
  if (product) contextSourcesUsed.push('product')
  if (instagram && instagram.status === 'CONNECTED') contextSourcesUsed.push('instagram')
  if (recentHistory.length > 0) contextSourcesUsed.push('historical_content')
  if (inspiration.length > 0) contextSourcesUsed.push('inspiration')
  if (activeGrid) contextSourcesUsed.push('content_grid')
  if (contentRules.length > 0 || brand?.brandName) contextSourcesUsed.push('knowledge_base')
  if (strategy) contextSourcesUsed.push('content_strategy')
  if (node) contextSourcesUsed.push('flowchart')
  if (input.userInstructions?.trim()) contextSourcesUsed.push('user_instructions')

  return {
    node,
    strategy,
    product,
    brand,
    instagram,
    recentHistory,
    inspiration,
    activeGrid,
    contentRules,
    userInstructions: input.userInstructions?.trim() || undefined,
    topic,
    platform: input.platform ?? 'instagram',
    gridPosition,
    dateLabel,
    productIdResolved: product?.id,
    strategyIdResolved: strategy?.id,
    contextSourcesUsed,
  }
}
