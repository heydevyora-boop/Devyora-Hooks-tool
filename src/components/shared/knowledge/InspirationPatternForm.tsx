import { useState } from 'react'
import { Icon } from '../../ui/Icon'
import type { InspirationPattern } from '../../../types'

const FIELDS: { key: keyof InspirationPattern; label: string; placeholder: string }[] = [
  { key: 'hookPattern', label: 'Hook Pattern', placeholder: 'e.g. Curiosity Gap' },
  { key: 'topic', label: 'Topic', placeholder: 'What is it about?' },
  { key: 'format', label: 'Format', placeholder: 'Reel, Carousel, Static…' },
  { key: 'narrativeStructure', label: 'Narrative Structure', placeholder: 'e.g. Problem → Solution' },
  { key: 'visualPattern', label: 'Visual Pattern', placeholder: 'e.g. Fast cuts, talking head' },
  { key: 'ctaPattern', label: 'CTA Pattern', placeholder: 'e.g. Comment a keyword' },
  { key: 'contentAngle', label: 'Content Angle', placeholder: 'e.g. Contrarian callout' },
]

interface InspirationPatternFormProps {
  initialPattern: InspirationPattern
  onSave: (pattern: InspirationPattern) => void
  onCancel: () => void
}

export function InspirationPatternForm({
  initialPattern,
  onSave,
  onCancel,
}: InspirationPatternFormProps) {
  const [draft, setDraft] = useState(initialPattern)

  return (
    <div className="flex flex-col gap-2.5 bg-surface-container-low rounded-lg p-3">
      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
        What pattern is this?
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {FIELDS.map((field) => (
          <div key={field.key} className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm text-on-surface-variant">
              {field.label}
            </label>
            <input
              className="w-full bg-surface-container-lowest rounded-lg px-2.5 py-2 font-body-sm text-body-sm text-on-surface outline-none"
              type="text"
              value={draft[field.key]}
              placeholder={field.placeholder}
              onChange={(event) => setDraft((prev) => ({ ...prev, [field.key]: event.target.value }))}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(draft)}
          className="flex-1 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1"
        >
          <Icon name="check" className="text-[16px]" />
          Save Pattern
        </button>
      </div>
    </div>
  )
}
