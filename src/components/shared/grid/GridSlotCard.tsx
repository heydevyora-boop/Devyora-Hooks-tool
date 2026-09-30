import { Icon } from '../../ui/Icon'
import { SLOT_TYPE_ICON, SLOT_TYPE_COLOR_CLASS } from './gridMeta'
import type { GridSlotDefinition } from '../../../types'

interface GridSlotCardProps {
  slot: GridSlotDefinition
  isActive: boolean
  onClick: () => void
}

export function GridSlotCard({ slot, isActive, onClick }: GridSlotCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-1 p-1.5 transition-all ${
        SLOT_TYPE_COLOR_CLASS[slot.contentType]
      } ${isActive ? 'ring-2 ring-primary ring-offset-1 ring-offset-surface' : 'hover:opacity-80'}`}
    >
      <Icon name={SLOT_TYPE_ICON[slot.contentType]} className="text-[20px]" />
      {slot.label && (
        <span className="font-label-sm text-[10px] font-semibold truncate max-w-full px-1">
          {slot.label}
        </span>
      )}
    </button>
  )
}
