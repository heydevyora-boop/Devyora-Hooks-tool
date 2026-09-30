import { Icon } from '../../ui/Icon'
import { SLOT_TYPE_ICON, SLOT_TYPE_LABEL } from '../grid/gridMeta'
import type { ContentStrategyPlan } from '../../../types'

interface StrategyResultSummaryProps {
  plan: ContentStrategyPlan
}

export function StrategyResultSummary({ plan }: StrategyResultSummaryProps) {
  const weeks = new Map<string, typeof plan.sequence>()
  for (const slot of plan.sequence) {
    if (!weeks.has(slot.weekLabel)) weeks.set(slot.weekLabel, [])
    weeks.get(slot.weekLabel)!.push(slot)
  }

  return (
    <div className="flex flex-col gap-space-md">
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5">
          <Icon name="troubleshoot" className="text-tertiary text-[18px]" />
          <span className="font-title text-title text-on-surface">Content Gaps</span>
        </div>
        <ul className="flex flex-col gap-1.5">
          {plan.contentGaps.map((gap) => (
            <li key={gap} className="flex items-start gap-2 font-body-sm text-body-sm text-on-surface-variant">
              <Icon name="warning" className="text-tertiary text-[14px] mt-0.5 shrink-0" />
              {gap}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5">
          <Icon name="lightbulb" className="text-primary text-[18px]" />
          <span className="font-title text-title text-on-surface">Opportunities</span>
        </div>
        <ul className="flex flex-col gap-1.5">
          {plan.opportunities.map((opportunity) => (
            <li
              key={opportunity}
              className="flex items-start gap-2 font-body-sm text-body-sm text-on-surface-variant"
            >
              <Icon name="arrow_forward" className="text-primary text-[14px] mt-0.5 shrink-0" />
              {opportunity}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Icon name="event_repeat" className="text-primary text-[18px]" />
            <span className="font-title text-title text-on-surface">Sequence</span>
          </div>
          <span className="font-code text-label-sm text-on-surface-variant">
            {plan.sequence.length} posts · {plan.input.durationWeeks}wk
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {Array.from(weeks.entries()).map(([week, slots]) => (
            <div key={week} className="flex flex-col gap-1.5">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                {week}
              </span>
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between bg-surface-container-low rounded-lg p-2.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon name={SLOT_TYPE_ICON[slot.contentType]} className="text-primary text-[16px] shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-body-sm text-body-sm text-on-surface font-medium truncate">
                        {SLOT_TYPE_LABEL[slot.contentType]} · {slot.product}
                      </span>
                      <span className="font-label-sm text-[11px] text-on-surface-variant truncate">
                        {slot.reason}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
