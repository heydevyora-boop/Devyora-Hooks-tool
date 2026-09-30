import { Icon } from '../../ui/Icon'
import type { ProductKnowledge } from '../../../types'

interface ProductCardProps {
  product: ProductKnowledge
  onEdit: () => void
  onDelete: () => void
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <div className="p-3.5 rounded-xl bg-surface-container-lowest shadow-sm flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
          <Icon name="inventory_2" className="text-[20px]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-title text-[15px] text-on-surface truncate">{product.name}</span>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center gap-3 mt-2 font-code text-label-sm text-on-surface-variant">
            <span>{product.features.length} features</span>
            <span>•</span>
            <span>{product.benefits.length} benefits</span>
            <span>•</span>
            <span>{product.contentAngles.length} angles</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          title="Edit product"
          onClick={onEdit}
          className="w-9 h-9 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center hover:bg-surface-container-highest transition-colors"
        >
          <Icon name="edit" className="text-[18px]" />
        </button>
        <button
          type="button"
          title="Delete product"
          onClick={onDelete}
          className="w-9 h-9 rounded-lg bg-surface-container-high text-error flex items-center justify-center hover:bg-error-container transition-colors"
        >
          <Icon name="delete" className="text-[18px]" />
        </button>
      </div>
    </div>
  )
}
