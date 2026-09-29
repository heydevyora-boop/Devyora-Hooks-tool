import { Icon } from '../ui/Icon'
import type { TopScript } from '../../types'

interface TopScriptCardProps {
  script: TopScript
}

export function TopScriptCard({ script }: TopScriptCardProps) {
  return (
    <div className="min-w-[280px] max-w-[280px] lg:min-w-0 lg:max-w-none lg:w-full bg-surface-container-lowest rounded-xl p-4 lg:p-5 shadow-sm snap-start flex flex-col justify-between space-y-3 lg:hover:shadow-md transition-shadow">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container font-code ${script.badgeColorClass}`}
          >
            {script.format}
          </span>
          <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
            <Icon name="insights" className="text-[14px]" />
            <span className="font-code text-label-sm font-semibold">{script.iq} IQ</span>
          </div>
        </div>
        <h3 className="font-title text-title text-on-surface line-clamp-2">{script.title}</h3>
      </div>
      <div className="space-y-2">
        <div className="bg-surface-container-low rounded-lg p-2.5 flex items-center justify-between text-body-sm font-body-sm">
          <span className="text-on-surface-variant">3s Hook Hold:</span>
          <span className="font-code text-on-surface font-semibold text-emerald-700">
            {script.hookHold}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {script.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded text-[11px] font-label-sm bg-surface-container text-on-surface-variant"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
