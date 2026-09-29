import { Icon } from '../ui/Icon'
import { ProgressRing } from '../ui/ProgressRing'
import type { ScorecardMetric } from '../../types'

interface ScoreCardProps {
  score: number
  tierLabel: string
  tierBadge: string
  diagnosis: string
  metrics: ScorecardMetric[]
}

export function ScoreCard({ score, tierLabel, tierBadge, diagnosis, metrics }: ScoreCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-headline-md text-headline-md font-bold text-on-surface">
              {score}
              <span className="font-title text-title text-on-surface-variant">/100</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-label-sm font-semibold">
              {tierBadge}
            </span>
          </div>
          <span className="font-title text-title text-primary">{tierLabel}</span>
        </div>
        <ProgressRing value={score} />
      </div>

      <div className="bg-surface-container-low rounded-lg p-2.5 flex items-start gap-2">
        <Icon name="insights" className="text-primary text-[18px] mt-0.5" />
        <p className="font-body-sm text-body-sm text-on-surface leading-snug">
          <strong>Diagnosis:</strong> {diagnosis}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-1.5 pt-1">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`p-2 rounded-lg flex flex-col ${
              metric.highlight ? 'bg-emerald-50' : 'bg-surface-container-low'
            }`}
          >
            <span
              className={`font-label-sm text-label-sm truncate ${
                metric.highlight ? 'text-emerald-700' : 'text-on-surface-variant'
              }`}
            >
              {metric.label}
            </span>
            <span className={`font-code text-title font-semibold ${metric.colorClass}`}>
              {metric.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
