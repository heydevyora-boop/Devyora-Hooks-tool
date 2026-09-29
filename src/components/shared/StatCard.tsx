import { Icon } from '../ui/Icon'
import type { StatCardData } from '../../types'

export function StatCard({
  label,
  value,
  icon,
  iconColorClass,
  trendValue,
  trendValueColorClass,
  trendCaption,
  showDot,
}: StatCardData) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-3.5 shadow-sm flex flex-col justify-between space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-label-sm font-label-sm text-on-surface-variant">{label}</span>
        <Icon name={icon} className={`text-[16px] ${iconColorClass}`} />
      </div>
      <div>
        <div className="text-headline-md font-headline-md text-on-surface tracking-tight">
          {value}
        </div>
        <div className="flex items-center space-x-1 mt-0.5">
          {showDot && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          {trendValue && (
            <span className={`text-label-sm font-label-sm font-semibold ${trendValueColorClass}`}>
              {trendValue}
            </span>
          )}
          <span className="text-[10px] text-on-surface-variant">{trendCaption}</span>
        </div>
      </div>
    </div>
  )
}
