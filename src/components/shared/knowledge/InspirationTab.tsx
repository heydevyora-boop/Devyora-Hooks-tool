import { useState } from 'react'
import { Icon } from '../../ui/Icon'
import { SourceImportPanel } from './SourceImportPanel'
import { InspirationCard } from './InspirationCard'
import { InspirationPatternForm } from './InspirationPatternForm'
import type { ContentSourceItem, InspirationItem, InspirationPattern } from '../../../types'

const EMPTY_PATTERN: InspirationPattern = {
  hookPattern: '',
  topic: '',
  format: '',
  narrativeStructure: '',
  visualPattern: '',
  ctaPattern: '',
  contentAngle: '',
}

interface InspirationTabProps {
  items: InspirationItem[]
  onChange: (next: InspirationItem[]) => void
  onRequestDelete: (id: string, label: string) => void
  isPendingDeletion: (id: string) => boolean
}

/**
 * Reuses SourceImportPanel (built for Content Import) for every intake
 * mechanic — URL, file upload, paste-text, voice — rather than duplicating
 * that UI. Each newly added source is immediately wrapped into a draft
 * InspirationItem so the user can tag its pattern.
 */
export function InspirationTab({
  items,
  onChange,
  onRequestDelete,
  isPendingDeletion,
}: InspirationTabProps) {
  const [intakeSources, setIntakeSources] = useState<ContentSourceItem[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleIntakeChange = (next: ContentSourceItem[]) => {
    if (next.length > intakeSources.length) {
      const newSource = next[0]
      const draft: InspirationItem = {
        id: `insp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        source: newSource,
        pattern: EMPTY_PATTERN,
        savedAt: new Date().toISOString(),
      }
      onChange([draft, ...items])
      setEditingId(draft.id)
      setIntakeSources([])
    } else {
      setIntakeSources(next)
    }
  }

  return (
    <div className="flex flex-col gap-space-md">
      <div className="bg-surface-container-low rounded-lg p-3 flex items-start gap-2">
        <Icon name="info" className="text-primary text-[16px] mt-0.5" />
        <p className="font-label-sm text-label-sm text-on-surface-variant">
          We use inspiration to understand patterns and create original content — not to copy it.
        </p>
      </div>

      <SourceImportPanel sources={intakeSources} onChange={handleIntakeChange} />

      {items.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            {items.length} Inspiration Item{items.length === 1 ? '' : 's'}
          </span>
          {items.map((item) =>
            editingId === item.id ? (
              <InspirationPatternForm
                key={item.id}
                initialPattern={item.pattern}
                onSave={(pattern) => {
                  onChange(items.map((i) => (i.id === item.id ? { ...i, pattern } : i)))
                  setEditingId(null)
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : isPendingDeletion(item.id) ? (
              <div
                key={item.id}
                className="rounded-xl bg-surface-container-low p-3 flex items-center justify-between"
              >
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  {item.source.title}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-[11px] font-semibold">
                  Pending admin approval
                </span>
              </div>
            ) : (
              <InspirationCard
                key={item.id}
                item={item}
                onEdit={() => setEditingId(item.id)}
                onDelete={() => onRequestDelete(item.id, item.source.title)}
              />
            ),
          )}
        </div>
      )}
    </div>
  )
}
