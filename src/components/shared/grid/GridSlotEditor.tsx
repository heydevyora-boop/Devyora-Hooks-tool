import { Icon } from '../../ui/Icon'
import { SLOT_CONTENT_TYPES, SLOT_TYPE_ICON, SLOT_TYPE_LABEL } from './gridMeta'
import type { GridSlotDefinition, ProductKnowledge } from '../../../types'

interface GridSlotEditorProps {
  slot: GridSlotDefinition
  products: ProductKnowledge[]
  onUpdate: (next: GridSlotDefinition) => void
  onClose: () => void
}

export function GridSlotEditor({ slot, products, onUpdate, onClose }: GridSlotEditorProps) {
  return (
    <div className="bg-surface-container-low rounded-lg p-3 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
          Slot {slot.position + 1}
        </span>
        <button type="button" onClick={onClose} title="Close">
          <Icon name="close" className="text-[16px] text-on-surface-variant" />
        </button>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {SLOT_CONTENT_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onUpdate({ ...slot, contentType: type })}
            className={`px-3 py-1.5 rounded-lg font-label-md text-label-md flex items-center gap-1.5 transition-colors ${
              slot.contentType === type
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-lowest text-on-surface-variant'
            }`}
          >
            <Icon name={SLOT_TYPE_ICON[type]} className="text-[16px]" />
            {SLOT_TYPE_LABEL[type]}
          </button>
        ))}
      </div>

      {products.length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="font-label-sm text-label-sm text-on-surface-variant">Product</label>
          <select
            className="w-full bg-surface-container-lowest rounded-lg px-2.5 py-2 font-body-sm text-body-sm text-on-surface outline-none"
            value={slot.productRef ?? ''}
            onChange={(event) => onUpdate({ ...slot, productRef: event.target.value || undefined })}
          >
            <option value="">No product</option>
            {products.map((product) => (
              <option key={product.id} value={product.name}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="font-label-sm text-label-sm text-on-surface-variant">Note</label>
        <input
          className="w-full bg-surface-container-lowest rounded-lg px-2.5 py-2 font-body-sm text-body-sm text-on-surface outline-none"
          type="text"
          value={slot.label ?? ''}
          placeholder="Optional label, e.g. campaign name"
          onChange={(event) => onUpdate({ ...slot, label: event.target.value || undefined })}
        />
      </div>

      <button
        type="button"
        onClick={() => onUpdate({ ...slot, contentType: 'empty', productRef: undefined, label: undefined })}
        className="self-start font-label-sm text-label-sm text-error font-medium"
      >
        Clear slot
      </button>
    </div>
  )
}
