import { useState } from 'react'
import { Icon } from '../../ui/Icon'
import { GridPreview } from './GridPreview'
import { GridSlotEditor } from './GridSlotEditor'
import { GridTemplatePicker } from './GridTemplatePicker'
import type { GridSlotDefinition, GridTemplate, ProductKnowledge } from '../../../types'

interface GridPlanningTabProps {
  templates: GridTemplate[]
  onChange: (next: GridTemplate[]) => void
  activeGridId: string | null
  onSetActiveGridId: (id: string) => void
  products: ProductKnowledge[]
  onRequestDelete: (id: string, label: string) => void
  isPendingDeletion: (id: string) => boolean
}

function emptySlots(count: number): GridSlotDefinition[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `slot-${Date.now()}-${index}`,
    position: index,
    contentType: 'empty',
  }))
}

export function GridPlanningTab({
  templates,
  onChange,
  activeGridId,
  onSetActiveGridId,
  products,
  onRequestDelete,
  isPendingDeletion,
}: GridPlanningTabProps) {
  const [editingTemplate, setEditingTemplate] = useState<GridTemplate | null>(null)
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null)

  const startEditing = (template: GridTemplate) => {
    if (template.isPreset) {
      setEditingTemplate({
        ...template,
        id: `grid-${Date.now()}`,
        name: `Copy of ${template.name}`,
        isPreset: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    } else {
      setEditingTemplate(template)
    }
    setActiveSlotId(null)
  }

  const startCustom = () => {
    setEditingTemplate({
      id: `grid-${Date.now()}`,
      name: 'New Custom Grid',
      isPreset: false,
      slots: emptySlots(9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    setActiveSlotId(null)
  }

  const updateSlot = (next: GridSlotDefinition) => {
    if (!editingTemplate) return
    setEditingTemplate({
      ...editingTemplate,
      slots: editingTemplate.slots.map((slot) => (slot.id === next.id ? next : slot)),
    })
  }

  const handleSave = () => {
    if (!editingTemplate) return
    const exists = templates.some((template) => template.id === editingTemplate.id)
    const saved = { ...editingTemplate, updatedAt: new Date().toISOString() }
    onChange(exists ? templates.map((t) => (t.id === saved.id ? saved : t)) : [saved, ...templates])
    onSetActiveGridId(saved.id)
    setEditingTemplate(null)
  }

  if (editingTemplate) {
    const activeSlot = editingTemplate.slots.find((slot) => slot.id === activeSlotId) ?? null

    return (
      <div className="flex flex-col gap-space-md">
        <div className="flex items-center gap-2">
          <input
            className="flex-1 bg-surface-container-low rounded-lg px-3 py-2 font-title text-title text-on-surface outline-none"
            value={editingTemplate.name}
            onChange={(event) =>
              setEditingTemplate({ ...editingTemplate, name: event.target.value })
            }
          />
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Tap a slot to assign its content type and product. This is your publishing structure —
          not a visual theme.
        </p>

        <GridPreview
          slots={editingTemplate.slots}
          activeSlotId={activeSlotId}
          onSlotClick={(slot) => setActiveSlotId(slot.id === activeSlotId ? null : slot.id)}
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setEditingTemplate({
                ...editingTemplate,
                slots: [
                  ...editingTemplate.slots,
                  {
                    id: `slot-${Date.now()}`,
                    position: editingTemplate.slots.length,
                    contentType: 'empty',
                  },
                ],
              })
            }
            className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold flex items-center gap-1"
          >
            <Icon name="add" className="text-[14px]" />
            Add Slot
          </button>
          {editingTemplate.slots.length > 3 && (
            <button
              type="button"
              onClick={() =>
                setEditingTemplate({
                  ...editingTemplate,
                  slots: editingTemplate.slots.slice(0, -1),
                })
              }
              className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold"
            >
              Remove Last Slot
            </button>
          )}
        </div>

        {activeSlot && (
          <GridSlotEditor
            slot={activeSlot}
            products={products}
            onUpdate={updateSlot}
            onClose={() => setActiveSlotId(null)}
          />
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setEditingTemplate(null)}
            className="flex-1 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold"
          >
            Save Grid
          </button>
        </div>
      </div>
    )
  }

  return (
    <GridTemplatePicker
      templates={templates}
      activeGridId={activeGridId}
      onSelect={(template) => onSetActiveGridId(template.id)}
      onEdit={startEditing}
      onDelete={(template) => onRequestDelete(template.id, template.name)}
      onCreateCustom={startCustom}
      isPendingDeletion={isPendingDeletion}
    />
  )
}
