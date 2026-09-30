import { Icon } from '../../ui/Icon'
import { SOURCE_TYPE_ICON as TYPE_ICON, SOURCE_TYPE_LABEL as TYPE_LABEL } from './contentSourceMeta'
import type { ContentSourceItem } from '../../../types'

const STATUS_CLASSES: Record<ContentSourceItem['status'], string> = {
  pending: 'bg-surface-container text-on-surface-variant',
  processing: 'bg-primary/10 text-primary',
  ready: 'bg-emerald-500/10 text-emerald-700',
  error: 'bg-error-container text-on-error-container',
}

const STATUS_LABEL: Record<ContentSourceItem['status'], string> = {
  pending: 'Pending',
  processing: 'Processing',
  ready: 'Ready',
  error: 'Error',
}

interface SourceListItemProps {
  source: ContentSourceItem
  onRemove: () => void
}

export function SourceListItem({ source, onRemove }: SourceListItemProps) {
  const isUrl = source.type.endsWith('_url')

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-container-low">
      {source.previewUrl ? (
        <img
          src={source.previewUrl}
          alt=""
          className="w-10 h-10 rounded-md object-cover shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-md bg-surface-container-high flex items-center justify-center text-primary shrink-0">
          <Icon name={TYPE_ICON[source.type]} className="text-[18px]" />
        </div>
      )}

      <div className="flex flex-col min-w-0 flex-1">
        <span className="font-body-sm text-body-sm text-on-surface font-medium truncate">
          {source.title}
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="font-label-sm text-[11px] text-on-surface-variant">
            {TYPE_LABEL[source.type]}
          </span>
          {isUrl && (
            <>
              <span className="text-on-surface-variant">·</span>
              <a
                href={source.value}
                target="_blank"
                rel="noreferrer"
                className="font-label-sm text-[11px] text-primary truncate hover:underline"
              >
                Open ↗
              </a>
            </>
          )}
        </div>
      </div>

      <span
        className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold shrink-0 ${STATUS_CLASSES[source.status]}`}
      >
        {STATUS_LABEL[source.status]}
      </span>

      <button
        type="button"
        onClick={onRemove}
        title="Remove source"
        className="w-8 h-8 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-error flex items-center justify-center shrink-0 transition-colors"
      >
        <Icon name="close" className="text-[16px]" />
      </button>
    </div>
  )
}
