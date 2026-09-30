import { Icon } from '../../ui/Icon'
import type { PendingApproval } from '../../../types'

const TARGET_TYPE_LABEL: Record<PendingApproval['targetType'], string> = {
  product: 'Product',
  grid_template: 'Grid Template',
  inspiration: 'Inspiration Item',
}

interface PendingApprovalsPanelProps {
  approvals: PendingApproval[]
  onApprove: (approval: PendingApproval) => void
  onReject: (approval: PendingApproval) => void
}

/** Admin-approval gate for permanent-knowledge deletion. Nothing removed
 * from Products, Grid Templates, or Inspiration in the Content Hub is
 * actually deleted until it's approved here. */
export function PendingApprovalsPanel({ approvals, onApprove, onReject }: PendingApprovalsPanelProps) {
  if (approvals.length === 0) return null

  return (
    <div className="rounded-xl bg-tertiary-fixed p-space-md flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Icon name="admin_panel_settings" className="text-on-tertiary-fixed-variant text-[20px]" />
        <span className="font-title text-title text-on-tertiary-fixed-variant">
          Pending Approvals
        </span>
        <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest text-on-tertiary-fixed-variant font-code text-label-sm font-semibold">
          {approvals.length}
        </span>
      </div>
      <p className="font-body-sm text-body-sm text-on-tertiary-fixed-variant">
        Deleting permanent knowledge requires admin approval before it's actually removed.
      </p>
      <div className="flex flex-col gap-2">
        {approvals.map((approval) => (
          <div
            key={approval.id}
            className="p-2.5 rounded-lg bg-surface-container-lowest flex items-center justify-between gap-2"
          >
            <div className="flex flex-col min-w-0">
              <span className="font-body-sm text-body-sm text-on-surface font-medium truncate">
                {approval.targetLabel}
              </span>
              <span className="font-label-sm text-[11px] text-on-surface-variant">
                Delete request · {TARGET_TYPE_LABEL[approval.targetType]}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onReject(approval)}
                className="px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => onApprove(approval)}
                className="px-2.5 py-1.5 rounded-lg bg-error text-on-error font-label-sm text-label-sm font-semibold"
              >
                Approve Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
