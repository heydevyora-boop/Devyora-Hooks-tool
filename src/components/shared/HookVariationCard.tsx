import { Icon } from '../ui/Icon'
import type { HookVariation } from '../../types'

interface HookVariationCardProps {
  hook: HookVariation
  onUse?: (id: string) => void
}

export function HookVariationCard({ hook, onUse }: HookVariationCardProps) {
  if (hook.selected) {
    return (
      <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-md flex flex-col gap-2 relative overflow-hidden">
        <div className="w-1.5 h-full bg-primary absolute left-0 top-0" />
        <div className="flex items-center justify-between pl-1">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-code text-label-sm font-semibold">
              {hook.label}
            </span>
            <span className="font-code text-label-sm text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">
              {hook.iq} IQ
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-primary font-medium">
            {hook.angleLabel}
          </span>
        </div>
        <p className="font-title text-title text-on-surface pl-1 leading-snug">{hook.text}</p>
        <div className="flex items-center justify-between pl-1 pt-1 font-label-sm text-label-sm text-on-surface-variant">
          <span className="flex items-center gap-1">
            <Icon name={hook.patternIcon} className="text-[14px]" /> Pattern:{' '}
            {hook.patternName}
          </span>
          <span className="font-code text-primary font-semibold">Active in Script</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-code text-label-sm">
            {hook.label}
          </span>
          <span className="font-code text-label-sm text-secondary bg-surface-container px-1.5 py-0.5 rounded font-semibold">
            {hook.iq} IQ
          </span>
        </div>
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          {hook.angleLabel}
        </span>
      </div>
      <p className="font-body-md text-body-md text-on-surface leading-snug">{hook.text}</p>
      <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
        <span className="flex items-center gap-1">
          <Icon name={hook.patternIcon} className="text-[14px]" /> Pattern: {hook.patternName}
        </span>
        <button
          type="button"
          className="text-primary font-medium hover:underline"
          onClick={() => onUse?.(hook.id)}
        >
          Use this
        </button>
      </div>
    </div>
  )
}
