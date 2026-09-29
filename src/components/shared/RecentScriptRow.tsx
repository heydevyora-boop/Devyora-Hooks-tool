import { Icon } from '../ui/Icon'
import type { RecentScript } from '../../types'

interface RecentScriptRowProps {
  script: RecentScript
}

export function RecentScriptRow({ script }: RecentScriptRowProps) {
  const statusColorClass =
    script.status === 'Exported'
      ? 'bg-emerald-100 text-emerald-800'
      : 'bg-surface-container-high text-on-surface-variant'

  return (
    <div className="bg-surface-container-lowest rounded-xl p-3.5 shadow-sm flex items-center justify-between">
      <div className="flex items-center space-x-3 min-w-0">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${script.iconColorClass}`}
        >
          <Icon name={script.icon} className="text-[20px]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-title text-body-lg text-on-surface truncate">{script.title}</span>
          <div className="flex items-center space-x-2 mt-0.5">
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-label-sm uppercase ${statusColorClass}`}
            >
              {script.status}
            </span>
            <span className="text-[11px] text-on-surface-variant">{script.statusNote}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end shrink-0 ml-2">
        <span className={`font-code text-label-sm font-bold ${script.scoreColorClass}`}>
          {script.score}/100
        </span>
        <span className="text-[10px] text-on-surface-variant">Score IQ</span>
      </div>
    </div>
  )
}
