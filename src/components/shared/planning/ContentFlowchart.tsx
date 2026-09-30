import { useState } from 'react'
import { Icon } from '../../ui/Icon'
import { FlowNodeCard } from './FlowNodeCard'
import { SLOT_CONTENT_TYPES } from '../grid/gridMeta'
import type { ContentFlowchart as ContentFlowchartType, FlowchartNode, GridSlotContentType } from '../../../types'

interface ContentFlowchartProps {
  flowchart: ContentFlowchartType
  onChange: (next: ContentFlowchartType) => void
  onRegenerateAll: () => void
  onApprovePlan: () => void
  generatedNodeIds: Set<string>
}

const CONTENT_NODE_TYPES = new Set<FlowchartNode['type']>(['content'])

export function ContentFlowchart({
  flowchart,
  onChange,
  onRegenerateAll,
  onApprovePlan,
  generatedNodeIds,
}: ContentFlowchartProps) {
  const [expandedId, setExpandedId] = useState<string | null>(flowchart.nodes[0]?.id ?? null)

  const updateNode = (id: string, patch: Partial<FlowchartNode>) => {
    onChange({
      ...flowchart,
      nodes: flowchart.nodes.map((node) => (node.id === id ? { ...node, ...patch } : node)),
    })
  }

  const moveContentNode = (index: number, direction: -1 | 1) => {
    const nodes = [...flowchart.nodes]
    const targetIndex = index + direction
    if (
      targetIndex < 0 ||
      targetIndex >= nodes.length ||
      nodes[targetIndex].type !== 'content' ||
      nodes[index].type !== 'content'
    ) {
      return
    }
    ;[nodes[index], nodes[targetIndex]] = [nodes[targetIndex], nodes[index]]
    onChange({ ...flowchart, nodes })
  }

  const regenerateNode = (node: FlowchartNode) => {
    if (!node.product || !node.contentType) return
    const currentIndex = SLOT_CONTENT_TYPES.indexOf(node.contentType as GridSlotContentType)
    const nextType = SLOT_CONTENT_TYPES[(currentIndex + 1) % SLOT_CONTENT_TYPES.length]
    updateNode(node.id, {
      contentType: nextType,
      label: `${node.product} — ${nextType}`,
      reason: `Regenerated: swapped to ${nextType} for variety.`,
    })
  }

  const finalNode = flowchart.nodes.find((node) => node.type === 'end' && node.branch === 'yes')
  const isApproved = Boolean(flowchart.approvedAt)

  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex items-center justify-between">
        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
          Where you are, where you're going, and what's needed to get there — generated from your
          Content Strategy.
        </p>
        <button
          type="button"
          onClick={onRegenerateAll}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold flex items-center gap-1"
        >
          <Icon name="refresh" className="text-[14px]" />
          Regenerate Flow
        </button>
      </div>

      <div className="flex flex-col">
        {flowchart.nodes.map((node, index) => {
          const edge = flowchart.edges.find((e) => e.to === node.id)
          const contentIndex = CONTENT_NODE_TYPES.has(node.type) ? index : -1

          return (
            <div key={node.id} className="flex flex-col">
              {index > 0 && (
                <div className="flex items-center justify-center py-1">
                  <div className="w-px h-4 bg-outline-variant" />
                  {edge?.label && (
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full font-code text-[10px] font-bold ${
                        edge.label === 'YES'
                          ? 'bg-emerald-500/10 text-emerald-700'
                          : 'bg-error/10 text-error'
                      }`}
                    >
                      {edge.label}
                    </span>
                  )}
                </div>
              )}
              <FlowNodeCard
                node={node}
                isExpanded={expandedId === node.id}
                onToggleExpand={() => setExpandedId(expandedId === node.id ? null : node.id)}
                onRegenerate={node.type === 'content' ? () => regenerateNode(node) : undefined}
                onApprove={
                  node.status !== 'done' ? () => updateNode(node.id, { status: 'done' }) : undefined
                }
                onMoveUp={contentIndex >= 0 ? () => moveContentNode(index, -1) : undefined}
                onMoveDown={contentIndex >= 0 ? () => moveContentNode(index, 1) : undefined}
                scriptHref={node.type === 'content' && isApproved ? `/script/${node.id}` : undefined}
                hasGeneratedScript={generatedNodeIds.has(node.id)}
              />
            </div>
          )
        })}
      </div>

      {finalNode && (
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-2.5">
          {isApproved ? (
            <div className="flex items-center gap-2 text-emerald-700">
              <Icon name="verified" className="text-[20px]" />
              <span className="font-title text-title">
                Plan Approved — {new Date(flowchart.approvedAt!).toLocaleDateString()}
              </span>
            </div>
          ) : (
            <>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Once approved, this plan becomes the input for script generation in a later step.
              </span>
              <button
                type="button"
                onClick={onApprovePlan}
                className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary font-title text-[14px] flex items-center justify-center gap-2 shadow-md"
              >
                <Icon name="check_circle" className="text-[18px]" />
                <span>Approve Final Plan</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
