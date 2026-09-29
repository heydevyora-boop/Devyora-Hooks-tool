import { Icon } from '../ui/Icon'
import type { RulebookEntry } from '../../types'

interface RulebookCardProps {
  rule: RulebookEntry
}

export function RulebookCard({ rule }: RulebookCardProps) {
  return (
    <div className="p-3.5 rounded-xl bg-surface-container-lowest shadow-sm">
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={`font-code text-label-sm uppercase tracking-wide font-semibold ${rule.categoryColorClass}`}
        >
          {rule.category}
        </span>
        <Icon name="lock" className="text-[16px] text-primary" />
      </div>
      <span className="font-title text-[14px] text-on-surface">{rule.title}</span>
      {rule.description && (
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          {rule.description}
        </p>
      )}
      {rule.tags && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {rule.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-code text-label-sm line-through"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {rule.showDisruptionMeter && (
        <>
          <div className="w-full bg-surface-container rounded-full h-2 mt-3 overflow-hidden flex">
            <div className="bg-tertiary-container h-full w-[35%]" />
            <div className="bg-primary h-full w-[65%]" />
          </div>
          <div className="flex justify-between items-center mt-1 font-code text-[11px] text-on-surface-variant">
            <span>0.0s: Anchor Disruption</span>
            <span>2.1s Hard Cliff</span>
          </div>
        </>
      )}
    </div>
  )
}
