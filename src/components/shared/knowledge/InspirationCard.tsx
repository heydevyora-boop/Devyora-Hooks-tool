import { Icon } from '../../ui/Icon'
import { Pill } from '../../ui/Pill'
import { SOURCE_TYPE_ICON, SOURCE_TYPE_LABEL } from './contentSourceMeta'
import type { InspirationItem } from '../../../types'

interface InspirationCardProps {
  item: InspirationItem
  onEdit: () => void
  onDelete: () => void
}

const PATTERN_LABELS: { key: keyof InspirationItem['pattern']; label: string }[] = [
  { key: 'hookPattern', label: 'Hook' },
  { key: 'topic', label: 'Topic' },
  { key: 'format', label: 'Format' },
  { key: 'narrativeStructure', label: 'Narrative' },
  { key: 'visualPattern', label: 'Visual' },
  { key: 'ctaPattern', label: 'CTA' },
  { key: 'contentAngle', label: 'Angle' },
]

export function InspirationCard({ item, onEdit, onDelete }: InspirationCardProps) {
  const filledPatterns = PATTERN_LABELS.filter(({ key }) => item.pattern[key]?.trim())

  return (
    <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {item.source.previewUrl ? (
            <img
              src={item.source.previewUrl}
              alt=""
              className="w-9 h-9 rounded-md object-cover shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-md bg-surface-container-high flex items-center justify-center text-primary shrink-0">
              <Icon name={SOURCE_TYPE_ICON[item.source.type]} className="text-[16px]" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-title text-[15px] text-on-surface truncate">
              {item.source.title}
            </span>
            <span className="font-label-sm text-[11px] text-on-surface-variant">
              {SOURCE_TYPE_LABEL[item.source.type]}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            title="Edit patterns"
            onClick={onEdit}
            className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center hover:bg-surface-container-highest transition-colors"
          >
            <Icon name="edit" className="text-[16px]" />
          </button>
          <button
            type="button"
            title="Remove inspiration"
            onClick={onDelete}
            className="w-8 h-8 rounded-lg bg-surface-container-high text-error flex items-center justify-center hover:bg-error-container transition-colors"
          >
            <Icon name="delete" className="text-[16px]" />
          </button>
        </div>
      </div>

      {filledPatterns.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {filledPatterns.map(({ key, label }) => (
            <Pill key={key} as="span">
              <span className="text-on-surface-variant font-medium mr-1">{label}:</span>
              {item.pattern[key]}
            </Pill>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={onEdit}
          className="text-left font-label-sm text-label-sm text-primary font-medium"
        >
          + Add pattern tags (hook, topic, format, narrative, visual, CTA, angle)
        </button>
      )}
    </div>
  )
}
