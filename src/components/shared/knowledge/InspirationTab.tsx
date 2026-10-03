import { useState } from 'react'
import { Icon } from '../../ui/Icon'
import { SourceImportPanel } from './SourceImportPanel'
import { InspirationCard } from './InspirationCard'
import { InspirationPatternForm } from './InspirationPatternForm'
import { ApiError } from '../../../api/client'
import { createInspiration, updateInspiration } from '../../../api/inspiration'
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

function describeError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  return "Couldn't reach the server — try again in a moment."
}

/**
 * Reuses SourceImportPanel (built for Content Import) for every intake
 * mechanic — URL, file upload, paste-text, voice — rather than duplicating
 * that UI. Each newly added source is a real, already-persisted
 * ContentSourceItem; it's held as a pending candidate until the pattern
 * form is saved, since the backend only creates an InspirationItem once
 * a contentSourceId and a pattern are both available.
 */
export function InspirationTab({
  items,
  onChange,
  onRequestDelete,
  isPendingDeletion,
}: InspirationTabProps) {
  const [pendingSource, setPendingSource] = useState<ContentSourceItem | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleIntakeChange = (next: ContentSourceItem[]) => {
    const newSource = next[0]
    if (newSource) {
      setError(null)
      setEditingId(null)
      setPendingSource(newSource)
    }
  }

  const handleSavePending = async (pattern: InspirationPattern) => {
    if (!pendingSource) return
    setError(null)
    setIsSaving(true)
    try {
      const item = await createInspiration(pendingSource.id, pattern)
      onChange([item, ...items])
      setPendingSource(null)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveEdit = async (id: string, pattern: InspirationPattern) => {
    setError(null)
    setIsSaving(true)
    try {
      const updated = await updateInspiration(id, { pattern })
      onChange(items.map((i) => (i.id === id ? updated : i)))
      setEditingId(null)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setIsSaving(false)
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

      {error && (
        <div className="bg-error-container rounded-lg p-2.5 flex items-start gap-2">
          <Icon name="error" className="text-error text-[16px] mt-0.5" />
          <p className="font-label-sm text-label-sm text-on-error-container">{error}</p>
        </div>
      )}

      <SourceImportPanel sources={[]} onChange={handleIntakeChange} />

      {pendingSource && (
        <InspirationPatternForm
          initialPattern={EMPTY_PATTERN}
          onSave={handleSavePending}
          onCancel={() => setPendingSource(null)}
        />
      )}

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
                onSave={(pattern) => handleSaveEdit(item.id, pattern)}
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
      {isSaving && (
        <span className="font-label-sm text-label-sm text-on-surface-variant">Saving…</span>
      )}
    </div>
  )
}
