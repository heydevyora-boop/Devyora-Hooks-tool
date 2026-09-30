import { Icon } from '../ui/Icon'
import { ProgressRing } from '../ui/ProgressRing'
import { Tooltip } from '../ui/Tooltip'
import type { ScorecardMetric } from '../../types'

interface ScoreCardProps {
  score: number
  tierLabel: string
  tierBadge: string
  diagnosis: string
  metrics: ScorecardMetric[]
  /** Threshold copy shown in the info tooltip, e.g. "Organic Views ≥ 50,000". Optional. */
  viralityThresholdLabel?: string
}

/** Plain-English definitions shown next to each AI metric. Simple English,
 * non-technical — this scorecard needs to be usable by a non-technical
 * content manager, not just a growth engineer. */
const METRIC_DEFINITIONS: Record<string, string> = {
  'Hook Strength': 'How strongly the opening makes people want to keep watching.',
  'Retention Pot.': 'How likely the content is to keep viewers watching all the way through.',
  Specificity: 'How concrete and specific the claims are, instead of vague or generic.',
  Authority: 'How much this content makes you look credible and expert.',
  'Brand Fit': 'How well this content matches your brand.',
  'Natural Speech': 'How natural this sounds when spoken out loud, instead of robotic.',
  'CTA Clarity': 'How clearly the viewer understands what to do next.',
  'Visual Pot.': 'How much strong, filmable visual material this script gives you.',
  'Generic AI': 'How much this avoids generic, obviously AI-sounding phrasing.',
}

export function ScoreCard({
  score,
  tierLabel,
  tierBadge,
  diagnosis,
  metrics,
  viralityThresholdLabel,
}: ScoreCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
              Virality Potential
            </span>
            <Tooltip
              text={`An estimate of how likely this content is to reach your team's definition of "viral"${
                viralityThresholdLabel ? ` (currently ${viralityThresholdLabel})` : ''
              } — not a guarantee of future views.`}
            />
          </div>
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
            className={`p-2 rounded-lg flex flex-col gap-0.5 ${
              metric.highlight ? 'bg-emerald-50' : 'bg-surface-container-low'
            }`}
          >
            <div className="flex items-center gap-1 min-w-0">
              <span
                className={`font-label-sm text-label-sm truncate ${
                  metric.highlight ? 'text-emerald-700' : 'text-on-surface-variant'
                }`}
              >
                {metric.label}
              </span>
              {METRIC_DEFINITIONS[metric.label] && (
                <Tooltip text={METRIC_DEFINITIONS[metric.label]} />
              )}
            </div>
            <span className={`font-code text-title font-semibold ${metric.colorClass}`}>
              {metric.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
