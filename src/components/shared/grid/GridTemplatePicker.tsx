import { Icon } from '../../ui/Icon'
import { GridPreview } from './GridPreview'
import type { GridTemplate } from '../../../types'

interface GridTemplatePickerProps {
  templates: GridTemplate[]
  activeGridId: string | null
  onSelect: (template: GridTemplate) => void
  onEdit: (template: GridTemplate) => void
  onDelete: (template: GridTemplate) => void
  onCreateCustom: () => void
  isPendingDeletion: (id: string) => boolean
}

export function GridTemplatePicker({
  templates,
  activeGridId,
  onSelect,
  onEdit,
  onDelete,
  onCreateCustom,
  isPendingDeletion,
}: GridTemplatePickerProps) {
  return (
    <div className="flex flex-col gap-space-md">
      <button
        type="button"
        onClick={onCreateCustom}
        className="w-full py-3 px-4 rounded-xl bg-surface-container-high text-primary font-title text-[14px] flex items-center justify-center gap-2 lg:hover:bg-surface-container-highest transition-colors"
      >
        <Icon name="add" className="text-[18px]" />
        <span>Create Custom Grid</span>
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {templates.map((template) => {
          const isActive = template.id === activeGridId
          const pending = isPendingDeletion(template.id)

          return (
            <div
              key={template.id}
              className={`rounded-xl bg-surface-container-lowest p-3.5 shadow-sm flex flex-col gap-2.5 ${
                isActive ? 'ring-2 ring-primary' : ''
              }`}
            >
              <GridPreview slots={template.slots} activeSlotId={null} />
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="font-title text-[15px] text-on-surface truncate">
                    {template.name}
                  </span>
                  {template.description && (
                    <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                </div>
                {isActive && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-[11px] font-semibold shrink-0">
                    Active
                  </span>
                )}
              </div>

              {pending ? (
                <span className="px-2 py-1 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-[11px] font-semibold text-center">
                  Pending admin approval
                </span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSelect(template)}
                    className={`flex-1 py-2 rounded-lg font-label-sm text-label-sm font-semibold ${
                      isActive
                        ? 'bg-surface-container text-on-surface-variant'
                        : 'bg-primary text-on-primary'
                    }`}
                  >
                    {isActive ? 'Selected' : 'Use Grid'}
                  </button>
                  <button
                    type="button"
                    title="Edit"
                    onClick={() => onEdit(template)}
                    className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center"
                  >
                    <Icon name="edit" className="text-[16px]" />
                  </button>
                  {!template.isPreset && (
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => onDelete(template)}
                      className="w-8 h-8 rounded-lg bg-surface-container-high text-error flex items-center justify-center"
                    >
                      <Icon name="delete" className="text-[16px]" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
