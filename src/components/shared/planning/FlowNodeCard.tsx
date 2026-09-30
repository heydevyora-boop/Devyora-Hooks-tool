import { Link } from 'react-router-dom'
import { Icon } from '../../ui/Icon'
import { SLOT_TYPE_ICON } from '../grid/gridMeta'
import type { FlowchartNode, GridSlotContentType } from '../../../types'

const TYPE_ICON: Record<FlowchartNode['type'], string> = {
  start: 'flag',
  analysis: 'analytics',
  gap: 'warning',
  content: 'movie',
  decision: 'help',
  end: 'check_circle',
}

const TYPE_COLOR_CLASS: Record<FlowchartNode['type'], string> = {
  start: 'bg-surface-container-high text-on-surface',
  analysis: 'bg-secondary/10 text-secondary',
  gap: 'bg-tertiary-fixed text-tertiary',
  content: 'bg-primary/10 text-primary',
  decision: 'bg-tertiary-container/10 text-tertiary-container',
  end: 'bg-emerald-500/10 text-emerald-700',
}

const STATUS_CLASSES: Record<FlowchartNode['status'], string> = {
  pending: 'bg-surface-container text-on-surface-variant',
  in_progress: 'bg-primary/10 text-primary',
  done: 'bg-emerald-500/10 text-emerald-700',
  blocked: 'bg-error-container text-on-error-container',
}

interface FlowNodeCardProps {
  node: FlowchartNode
  isExpanded: boolean
  onToggleExpand: () => void
  onRegenerate?: () => void
  onApprove?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  /** Only passed once the whole plan is approved — enforces that script
   * generation can't be reached before Approval. */
  scriptHref?: string
  hasGeneratedScript?: boolean
}

export function FlowNodeCard({
  node,
  isExpanded,
  onToggleExpand,
  onRegenerate,
  onApprove,
  onMoveUp,
  onMoveDown,
  scriptHref,
  hasGeneratedScript,
}: FlowNodeCardProps) {
  const icon =
    node.type === 'content' && node.contentType
      ? SLOT_TYPE_ICON[node.contentType as GridSlotContentType] ?? TYPE_ICON.content
      : TYPE_ICON[node.type]

  return (
    <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggleExpand}
        className="w-full p-3 flex items-center justify-between gap-2 text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${TYPE_COLOR_CLASS[node.type]}`}>
            <Icon name={icon} className="text-[18px]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-title text-[14px] text-on-surface truncate">{node.label}</span>
            {node.date && (
              <span className="font-label-sm text-[11px] text-on-surface-variant">{node.date}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold ${STATUS_CLASSES[node.status]}`}
          >
            {node.status.replace('_', ' ')}
          </span>
          <Icon
            name={isExpanded ? 'expand_less' : 'expand_more'}
            className="text-[18px] text-on-surface-variant"
          />
        </div>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 flex flex-col gap-2.5 border-t border-outline-variant/30 pt-2.5">
          <div className="grid grid-cols-2 gap-2 font-label-sm text-label-sm">
            {node.product && (
              <div className="flex flex-col">
                <span className="text-on-surface-variant">Product</span>
                <span className="text-on-surface font-medium">{node.product}</span>
              </div>
            )}
            {node.contentType && (
              <div className="flex flex-col">
                <span className="text-on-surface-variant">Content Type</span>
                <span className="text-on-surface font-medium capitalize">{node.contentType}</span>
              </div>
            )}
            {node.goal && (
              <div className="flex flex-col">
                <span className="text-on-surface-variant">Goal</span>
                <span className="text-on-surface font-medium truncate">{node.goal}</span>
              </div>
            )}
            {node.priority && (
              <div className="flex flex-col">
                <span className="text-on-surface-variant">Priority</span>
                <span className="text-on-surface font-medium capitalize">{node.priority}</span>
              </div>
            )}
            {node.gridPosition !== undefined && (
              <div className="flex flex-col">
                <span className="text-on-surface-variant">Grid Position</span>
                <span className="text-on-surface font-medium">#{node.gridPosition + 1}</span>
              </div>
            )}
          </div>
          {node.reason && (
            <p className="font-body-sm text-body-sm text-on-surface-variant italic">
              {node.reason}
            </p>
          )}
          <div className="flex items-center gap-1.5 flex-wrap">
            {scriptHref && (
              <Link
                to={scriptHref}
                className="px-2.5 py-1.5 rounded-lg bg-tertiary-container text-on-tertiary font-label-sm text-label-sm font-semibold flex items-center gap-1"
              >
                <Icon name={hasGeneratedScript ? 'visibility' : 'movie'} className="text-[14px]" />
                {hasGeneratedScript ? 'View Script' : 'Generate Script'}
              </Link>
            )}
            {onApprove && node.status !== 'done' && (
              <button
                type="button"
                onClick={onApprove}
                className="px-2.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold flex items-center gap-1"
              >
                <Icon name="check" className="text-[14px]" />
                Approve
              </button>
            )}
            {onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="px-2.5 py-1.5 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold flex items-center gap-1"
              >
                <Icon name="refresh" className="text-[14px]" />
                Regenerate
              </button>
            )}
            {onMoveUp && (
              <button
                type="button"
                onClick={onMoveUp}
                title="Move up"
                className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center"
              >
                <Icon name="arrow_upward" className="text-[14px]" />
              </button>
            )}
            {onMoveDown && (
              <button
                type="button"
                onClick={onMoveDown}
                title="Move down"
                className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center"
              >
                <Icon name="arrow_downward" className="text-[14px]" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
