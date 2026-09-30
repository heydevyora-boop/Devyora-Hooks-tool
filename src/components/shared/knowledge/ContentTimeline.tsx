import { Icon } from '../../ui/Icon'
import type { ContentHistoryItem } from '../../../types'

const FORMAT_ICON: Record<ContentHistoryItem['format'], string> = {
  Reel: 'play_circle',
  Carousel: 'view_carousel',
  Static: 'image',
  Story: 'auto_stories',
  Video: 'smart_display',
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' }).format(new Date(iso))
}

interface ContentTimelineProps {
  items: ContentHistoryItem[]
}

/** Groups content by product and lists it chronologically, so posting
 * frequency and topic repetition per product are visible at a glance. */
export function ContentTimeline({ items }: ContentTimelineProps) {
  const groups = new Map<string, ContentHistoryItem[]>()
  for (const item of items) {
    const key = item.product ?? 'Unassigned'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(item)
  }
  for (const group of groups.values()) {
    group.sort((a, b) => a.date.localeCompare(b.date))
  }

  if (groups.size === 0) {
    return (
      <div className="rounded-xl bg-surface-container-low p-space-md text-center font-body-sm text-body-sm text-on-surface-variant">
        No content history yet — add items in the History tab to see them here.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-space-lg">
      {Array.from(groups.entries()).map(([product, groupItems]) => (
        <div key={product} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Icon name="inventory_2" className="text-primary text-[18px]" />
            <span className="font-title text-title text-on-surface">{product}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {groupItems.length} item{groupItems.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="flex flex-col pl-2 border-l-2 border-outline-variant/40">
            {groupItems.map((item) => (
              <div key={item.id} className="relative pl-4 pb-3 last:pb-0">
                <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-primary" />
                <div className="flex items-center gap-2 flex-wrap">
                  <Icon name={FORMAT_ICON[item.format]} className="text-primary text-[16px]" />
                  <span className="font-body-sm text-body-sm text-on-surface font-medium">
                    {item.format}
                  </span>
                  <span className="font-code text-label-sm text-on-surface-variant">
                    — {formatDate(item.date)}
                  </span>
                  <span className="font-label-sm text-[11px] text-on-surface-variant truncate">
                    {item.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
