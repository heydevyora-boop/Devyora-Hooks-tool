import { prisma } from '../lib/prisma.js'
import { ConflictError, NotFoundError } from '../lib/errors.js'
import type { UpdateFlowchartNodeInput } from '../validation/flowchart.schema.js'
import type {
  ContentFlowchart,
  FlowchartEdge,
  FlowchartNode,
  FlowNodeBranch,
  FlowNodeEffort,
  FlowNodePriority,
  FlowNodeStatus,
  FlowNodeType,
  GridSlotContentType,
  Product,
} from '@prisma/client'

type FlowchartWithRelations = ContentFlowchart & {
  nodes: (FlowchartNode & { product: Product | null })[]
  edges: FlowchartEdge[]
}

const NODE_TYPE_FROM_DB: Record<FlowNodeType, string> = {
  START: 'start',
  ANALYSIS: 'analysis',
  GAP: 'gap',
  CONTENT: 'content',
  DECISION: 'decision',
  END: 'end',
}
const STATUS_FROM_DB: Record<FlowNodeStatus, string> = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
  BLOCKED: 'blocked',
}
const PRIORITY_FROM_DB: Record<FlowNodePriority, string> = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high' }
const EFFORT_FROM_DB: Record<FlowNodeEffort, string> = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high' }
const BRANCH_FROM_DB: Record<FlowNodeBranch, string> = { YES: 'yes', NO: 'no' }
const CONTENT_TYPE_FROM_DB: Record<GridSlotContentType, string> = {
  REEL: 'reel',
  CAROUSEL: 'carousel',
  STATIC: 'static',
  STORY: 'story',
  EMPTY: 'empty',
}

/** Matches the frontend's ContentFlowchart/FlowchartNode/FlowchartEdge
 * shape exactly. `effort` is an extra, additive field beyond the
 * frontend's strict FlowchartNode type. */
export function toFlowchartView(flowchart: FlowchartWithRelations) {
  return {
    id: flowchart.id,
    strategyId: flowchart.strategyId,
    nodes: flowchart.nodes.map((node) => ({
      id: node.id,
      type: NODE_TYPE_FROM_DB[node.type],
      label: node.label,
      product: node.product?.name,
      date: node.dateLabel ?? undefined,
      contentType: node.contentType ? CONTENT_TYPE_FROM_DB[node.contentType] : undefined,
      goal: node.goal ?? undefined,
      status: STATUS_FROM_DB[node.status],
      priority: node.priority ? PRIORITY_FROM_DB[node.priority] : undefined,
      effort: node.effort ? EFFORT_FROM_DB[node.effort] : undefined,
      reason: node.reason ?? undefined,
      gridPosition: node.gridPosition ?? undefined,
      branch: node.branch ? BRANCH_FROM_DB[node.branch] : undefined,
    })),
    edges: flowchart.edges.map((edge) => ({ from: edge.fromNodeId, to: edge.toNodeId, label: edge.label ?? undefined })),
    generatedAt: flowchart.generatedAt.toISOString(),
    approvedAt: flowchart.approvedAt?.toISOString(),
  }
}

const includeRelations = { nodes: { include: { product: true } }, edges: true } as const

interface NodeSpec {
  type: FlowNodeType
  label: string
  productId?: string | null
  dateLabel?: string | null
  contentType?: GridSlotContentType | null
  goal?: string | null
  status: FlowNodeStatus
  priority?: FlowNodePriority | null
  reason?: string | null
  gridPosition?: number | null
  branch?: FlowNodeBranch | null
  strategySequenceSlotId?: string | null
}

/**
 * Direct backend port of the frontend's generateFlowchart.ts — one node
 * per content gap and per sequence slot, plus a genuinely computed "Grid
 * Balanced?" decision, now persisted instead of held in client state.
 */
export async function generateFlowchart(workspaceId: string, strategyId: string) {
  const strategy = await prisma.contentStrategy.findFirst({
    where: { id: strategyId, workspaceId },
    include: { sequence: { include: { product: true }, orderBy: { position: 'asc' } } },
  })
  if (!strategy) throw new NotFoundError('Content strategy not found')

  const existing = await prisma.contentFlowchart.findUnique({ where: { strategyId } })
  if (existing) throw new ConflictError('A flowchart already exists for this strategy')

  const contentGaps = strategy.contentGaps as string[]

  const specs: NodeSpec[] = []
  specs.push({ type: 'START', label: 'Start', status: 'DONE' })
  specs.push({
    type: 'ANALYSIS',
    label: 'Instagram Analysis',
    status: 'DONE',
    reason: 'Account data and content history reviewed before planning.',
  })

  for (const gap of contentGaps) {
    specs.push({
      type: 'GAP',
      label: 'Content Gap',
      reason: gap,
      status: 'DONE',
      priority: gap.startsWith('No content yet') ? 'HIGH' : 'LOW',
    })
  }

  strategy.sequence.forEach((slot, index) => {
    specs.push({
      type: 'CONTENT',
      label: `${slot.product?.name ?? 'Unassigned'} — ${CONTENT_TYPE_FROM_DB[slot.contentType]}`,
      productId: slot.productId,
      dateLabel: slot.weekLabel,
      contentType: slot.contentType,
      goal: strategy.goal,
      reason: slot.reason,
      status: 'PENDING',
      priority: 'MEDIUM',
      gridPosition: index,
      strategySequenceSlotId: slot.id,
    })
  })

  specs.push({ type: 'ANALYSIS', label: 'Review', status: 'PENDING' })

  const productCounts = new Map<string, number>()
  for (const slot of strategy.sequence) {
    const key = slot.productId ?? 'unassigned'
    productCounts.set(key, (productCounts.get(key) ?? 0) + 1)
  }
  const counts = Array.from(productCounts.values())
  const isBalanced = counts.length === 0 || Math.max(...counts) - Math.min(...counts) <= 1

  const decisionIndex = specs.length
  specs.push({
    type: 'DECISION',
    label: 'Grid Balanced?',
    status: 'PENDING',
    reason: isBalanced
      ? 'Products are evenly distributed across the sequence.'
      : 'Some products appear more often than others in this sequence.',
  })

  specs.push(
    isBalanced
      ? { type: 'END', label: 'Final Plan', status: 'PENDING', branch: 'YES' }
      : {
          type: 'GAP',
          label: 'Regenerate',
          status: 'PENDING',
          branch: 'NO',
          reason: 'Rebalance product distribution before finalizing.',
        },
  )

  const flowchart = await prisma.$transaction(async (tx) => {
    const created = await tx.contentFlowchart.create({ data: { workspaceId, strategyId } })

    const nodeIds: string[] = []
    for (const spec of specs) {
      const node = await tx.flowchartNode.create({ data: { flowchartId: created.id, ...spec } })
      nodeIds.push(node.id)
    }

    const edgeData = nodeIds.slice(0, -1).map((fromNodeId, i) => ({
      flowchartId: created.id,
      fromNodeId,
      toNodeId: nodeIds[i + 1]!,
      label: i === decisionIndex ? (isBalanced ? 'YES' : 'NO') : null,
    }))
    await tx.flowchartEdge.createMany({ data: edgeData })

    return tx.contentFlowchart.findUniqueOrThrow({ where: { id: created.id }, include: includeRelations })
  })

  return toFlowchartView(flowchart)
}

export async function getFlowchartByStrategy(workspaceId: string, strategyId: string) {
  const flowchart = await prisma.contentFlowchart.findFirst({
    where: { strategyId, workspaceId },
    include: includeRelations,
  })
  if (!flowchart) throw new NotFoundError('No flowchart has been generated for this strategy yet')
  return toFlowchartView(flowchart)
}

export async function getFlowchart(workspaceId: string, id: string) {
  const flowchart = await prisma.contentFlowchart.findFirst({ where: { id, workspaceId }, include: includeRelations })
  if (!flowchart) throw new NotFoundError('Flowchart not found')
  return toFlowchartView(flowchart)
}

export async function updateNode(workspaceId: string, flowchartId: string, nodeId: string, input: UpdateFlowchartNodeInput) {
  const flowchart = await prisma.contentFlowchart.findFirst({ where: { id: flowchartId, workspaceId } })
  if (!flowchart) throw new NotFoundError('Flowchart not found')

  const node = await prisma.flowchartNode.findFirst({ where: { id: nodeId, flowchartId } })
  if (!node) throw new NotFoundError('Flowchart node not found')

  await prisma.flowchartNode.update({
    where: { id: nodeId },
    data: {
      ...(input.status !== undefined ? { status: input.status.toUpperCase() as FlowNodeStatus } : {}),
      ...(input.priority !== undefined ? { priority: input.priority.toUpperCase() as FlowNodePriority } : {}),
      ...(input.effort !== undefined ? { effort: input.effort.toUpperCase() as FlowNodeEffort } : {}),
    },
  })

  return getFlowchart(workspaceId, flowchartId)
}

export async function approveFlowchart(workspaceId: string, id: string, approvedBy: string) {
  const flowchart = await prisma.contentFlowchart.findFirst({ where: { id, workspaceId } })
  if (!flowchart) throw new NotFoundError('Flowchart not found')
  if (flowchart.approvedAt) throw new ConflictError('This flowchart was already approved')

  const updated = await prisma.contentFlowchart.update({
    where: { id },
    data: { approvedAt: new Date(), approvedBy },
    include: includeRelations,
  })
  return toFlowchartView(updated)
}
