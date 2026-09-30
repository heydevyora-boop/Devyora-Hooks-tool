import { useState } from 'react'
import { Icon } from '../../ui/Icon'
import { VoiceInputButton } from '../../ui/VoiceInputButton'
import { TagListEditor } from './TagListEditor'
import type { ProductKnowledge } from '../../../types'

interface ProductFormProps {
  initialProduct?: ProductKnowledge
  onSave: (product: ProductKnowledge) => void
  onCancel: () => void
}

function emptyDraft(): Omit<ProductKnowledge, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: '',
    description: '',
    features: [],
    benefits: [],
    applications: [],
    sellingPoints: [],
    targetAudience: '',
    limitations: [],
    contentAngles: [],
  }
}

export function ProductForm({ initialProduct, onSave, onCancel }: ProductFormProps) {
  const [draft, setDraft] = useState(() => initialProduct ?? emptyDraft())

  const update = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }))

  const canSave = draft.name.trim().length > 0

  const handleSave = () => {
    if (!canSave) return
    const now = new Date().toISOString()
    const product: ProductKnowledge = {
      id: initialProduct?.id ?? `product-${Date.now()}`,
      createdAt: initialProduct?.createdAt ?? now,
      updatedAt: now,
      ...draft,
    }
    onSave(product)
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-space-xs">
          <Icon name="inventory_2" className="text-primary text-[20px]" />
          <span className="font-title text-title text-on-surface">
            {initialProduct ? 'Edit Product' : 'Add Product'}
          </span>
        </div>
        <button type="button" onClick={onCancel} title="Close" className="text-on-surface-variant">
          <Icon name="close" className="text-[20px]" />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-label-md text-label-md text-on-surface font-semibold">
          Product Name
        </label>
        <div className="bg-surface-container-low rounded-lg p-2.5 flex items-center gap-2">
          <Icon name="label" className="text-primary text-[18px]" />
          <input
            className="w-full bg-transparent font-body-md text-body-md text-on-surface outline-none font-medium"
            type="text"
            value={draft.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder="e.g. Devyora TrustEngine v2"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="font-label-md text-label-md text-on-surface font-semibold">
            Description
          </label>
          <VoiceInputButton
            onTranscript={(transcript, isFinal) => {
              update('description', transcript)
              if (isFinal) update('description', transcript)
            }}
          />
        </div>
        <textarea
          className="w-full bg-surface-container-low rounded-lg p-2.5 font-body-md text-body-md text-on-surface outline-none min-h-[88px] resize-y"
          value={draft.description}
          onChange={(event) => update('description', event.target.value)}
          placeholder="What does this product do, in plain language?"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-label-md text-label-md text-on-surface-variant font-medium">
          Target Audience
        </label>
        <div className="bg-surface-container-low rounded-lg p-2.5 flex items-center gap-2">
          <Icon name="group" className="text-on-surface-variant text-[18px]" />
          <input
            className="w-full bg-transparent font-body-md text-body-md text-on-surface outline-none"
            type="text"
            value={draft.targetAudience}
            onChange={(event) => update('targetAudience', event.target.value)}
            placeholder="Who is this for?"
          />
        </div>
      </div>

      <TagListEditor
        label="Features"
        values={draft.features}
        onChange={(next) => update('features', next)}
        placeholder="Add a feature…"
      />
      <TagListEditor
        label="Benefits"
        values={draft.benefits}
        onChange={(next) => update('benefits', next)}
        placeholder="Add a benefit…"
      />
      <TagListEditor
        label="Applications"
        values={draft.applications}
        onChange={(next) => update('applications', next)}
        placeholder="Add a use case…"
      />
      <TagListEditor
        label="Selling Points"
        values={draft.sellingPoints}
        onChange={(next) => update('sellingPoints', next)}
        placeholder="Add a selling point…"
      />
      <TagListEditor
        label="Limitations"
        values={draft.limitations}
        onChange={(next) => update('limitations', next)}
        placeholder="Add a limitation…"
      />
      <TagListEditor
        label="Content Angles"
        values={draft.contentAngles}
        onChange={(next) => update('contentAngles', next)}
        placeholder="Add a content angle…"
      />

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Product
        </button>
      </div>
    </div>
  )
}
