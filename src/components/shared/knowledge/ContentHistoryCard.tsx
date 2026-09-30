import { Icon } from '../../ui/Icon'
import type { ContentHistoryItem } from '../../../types'

const FORMAT_ICON: Record<ContentHistoryItem['format'], string> = {
  Reel: 'play_circle',
  Carousel: 'view_carousel',
  Static: 'image',
  Story: 'auto_stories',
  Video: 'smart_display',
}

const STATUS_CLASSES: Record<ContentHistoryItem['status'], string> = {
  Published: 'bg-emerald-100 text-emerald-800',
  Draft: 'bg-surface-container-high text-on-surface-variant',
  Scheduled: 'bg-primary/10 text-primary',
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' }).format(new Date(iso))
}

interface ContentHistoryCardProps {
  item: ContentHistoryItem
}

export function ContentHistoryCard({ item }: ContentHistoryCardProps) {
  return (
    <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1">
            <Icon name={FORMAT_ICON[item.format]} className="text-[13px]" />
            {item.format}
          </span>
          {item.product && (
            <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
              {item.product}
            </span>
          )}
        </div>
        <span
          className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold shrink-0 ${STATUS_CLASSES[item.status]}`}
        >
          {item.status}
        </span>
      </div>

      <h3 className="font-title text-title text-on-surface font-semibold">{item.title}</h3>

      <div className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
        <Icon name="calendar_today" className="text-[14px]" />
        <span>{formatDate(item.date)}</span>
        <span>·</span>
        <span>{item.topic}</span>
      </div>

      {item.hook && (
        <p className="font-body-sm text-body-sm text-on-surface-variant italic line-clamp-1">
          "{item.hook}"
        </p>
      )}

      {(item.performanceLabel || item.engagement) && (
        <div className="flex items-center justify-between bg-surface-container-low rounded-lg p-2.5 font-code text-code">
          {item.performanceLabel && (
            <span className="text-emerald-700 font-semibold">{item.performanceLabel}</span>
          )}
          {item.engagement && <span className="text-on-surface-variant">{item.engagement}</span>}
        </div>
      )}
    </div>
  )
}
