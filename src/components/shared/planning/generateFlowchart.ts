import type { ContentFlowchart, ContentStrategyPlan, FlowchartEdge, FlowchartNode } from '../../../types'

/**
 * Builds the flowchart as a real function of the generated strategy —
 * one node per content gap and per sequence slot — plus a genuinely
 * computed "Grid Balanced?" decision (product counts within 1 of each
 * other), not a decorative fixed shape.
 */
export function generateContentFlowchart(plan: ContentStrategyPlan): ContentFlowchart {
  const nodes: FlowchartNode[] = []
  const edges: FlowchartEdge[] = []
  let previousId: string | null = null

  const link = (id: string) => {
    if (previousId) edges.push({ from: previousId, to: id })
    previousId = id
  }

  const startId = 'flow-start'
  nodes.push({ id: startId, type: 'start', label: 'Start', status: 'done' })
  link(startId)

  const analysisId = 'flow-analysis'
  nodes.push({
    id: analysisId,
    type: 'analysis',
    label: 'Instagram Analysis',
    status: 'done',
    reason: 'Account data and content history reviewed before planning.',
  })
  link(analysisId)

  plan.contentGaps.forEach((gap, index) => {
    const id = `flow-gap-${index}`
    nodes.push({
      id,
      type: 'gap',
      label: 'Content Gap',
      reason: gap,
      status: 'done',
      priority: gap.startsWith('No content yet') ? 'high' : 'low',
    })
    link(id)
  })

  plan.sequence.forEach((slot, index) => {
    const id = `flow-content-${index}`
    nodes.push({
      id,
      type: 'content',
      label: `${slot.product} — ${slot.contentType}`,
      product: slot.product,
      date: slot.weekLabel,
      contentType: slot.contentType,
      goal: plan.input.goal,
      reason: slot.reason,
      status: 'pending',
      priority: 'medium',
      gridPosition: index,
    })
    link(id)
  })

  const reviewId = 'flow-review'
  nodes.push({ id: reviewId, type: 'analysis', label: 'Review', status: 'pending' })
  link(reviewId)

  const productCounts = new Map<string, number>()
  for (const slot of plan.sequence) {
    productCounts.set(slot.product, (productCounts.get(slot.product) ?? 0) + 1)
  }
  const counts = Array.from(productCounts.values())
  const isBalanced = counts.length === 0 || Math.max(...counts) - Math.min(...counts) <= 1

  const decisionId = 'flow-decision'
  nodes.push({
    id: decisionId,
    type: 'decision',
    label: 'Grid Balanced?',
    status: 'pending',
    reason: isBalanced
      ? 'Products are evenly distributed across the sequence.'
      : 'Some products appear more often than others in this sequence.',
  })
  link(decisionId)

  if (isBalanced) {
    const finalId = 'flow-final'
    nodes.push({ id: finalId, type: 'end', label: 'Final Plan', status: 'pending', branch: 'yes' })
    edges.push({ from: decisionId, to: finalId, label: 'YES' })
  } else {
    const regenId = 'flow-regenerate'
    nodes.push({
      id: regenId,
      type: 'gap',
      label: 'Regenerate',
      status: 'pending',
      branch: 'no',
      reason: 'Rebalance product distribution before finalizing.',
    })
    edges.push({ from: decisionId, to: regenId, label: 'NO' })
  }

  return {
    id: `flowchart-${Date.now()}`,
    strategyId: plan.id,
    nodes,
    edges,
    generatedAt: new Date().toISOString(),
  }
}
