import { Link } from 'react-router-dom'
import { Icon } from '../ui/Icon'

const TONE_CLASSES = {
  default: 'bg-surface-container-high text-primary',
  positive: 'bg-emerald-500/10 text-emerald-700',
  attention: 'bg-tertiary-fixed text-tertiary',
  muted: 'bg-surface-container text-on-surface-variant',
} as const

interface HomeIntelCardProps {
  icon: string
  label: string
  value: string
  detail?: string
  to: string
  tone?: keyof typeof TONE_CLASSES
}

/** A single compact "at a glance" tile for the Home Content Intelligence
 * section — always links back to where that data actually lives, instead
 * of duplicating any page's real UI. */
export function HomeIntelCard({ icon, label, value, detail, to, tone = 'default' }: HomeIntelCardProps) {
  return (
    <Link
      to={to}
      className="p-3 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-1 min-w-0 hover:shadow-md transition-shadow"
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${TONE_CLASSES[tone]}`}
      >
        <Icon name={icon} className="text-[18px]" />
      </div>
      <span className="font-title text-[15px] text-on-surface font-semibold truncate">
        {value}
      </span>
      <span className="font-label-sm text-label-sm text-on-surface-variant truncate">{label}</span>
      {detail && (
        <span className="font-label-sm text-[11px] text-on-surface-variant truncate">
          {detail}
        </span>
      )}
    </Link>
  )
}
