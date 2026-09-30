import { GridSlotCard } from './GridSlotCard'
import type { GridSlotDefinition } from '../../../types'

interface GridPreviewProps {
  slots: GridSlotDefinition[]
  activeSlotId: string | null
  onSlotClick?: (slot: GridSlotDefinition) => void
}

/** Renders a 3-column Instagram-style publishing grid — a layout of what
 * content goes where, never a visual/aesthetic theme. */
export function GridPreview({ slots, activeSlotId, onSlotClick }: GridPreviewProps) {
  return (
    <div className="grid grid-cols-3 gap-1.5 max-w-sm">
      {slots.map((slot) => (
        <GridSlotCard
          key={slot.id}
          slot={slot}
          isActive={slot.id === activeSlotId}
          onClick={() => onSlotClick?.(slot)}
        />
      ))}
    </div>
  )
}
