import type { ReactNode } from 'react'
import { Icon } from './Icon'

interface PillProps {
  children: ReactNode
  active?: boolean
  onClick?: () => void
  className?: string
  as?: 'button' | 'span'
  /** When provided, renders a small remove (×) affordance — used for editable tag/chip lists */
  onRemove?: () => void
}

export function Pill({
  children,
  active = false,
  onClick,
  className = '',
  as = 'button',
  onRemove,
}: PillProps) {
  const base =
    'shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full font-label-sm text-label-sm transition-all'
  const tone = active
    ? 'bg-primary text-on-primary shadow-sm'
    : 'bg-surface-container-high text-on-surface-variant active:bg-surface-container-highest'

  const removeButton = onRemove ? (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onRemove()
      }}
      className="-mr-1 ml-0.5 rounded-full hover:bg-black/10 flex items-center justify-center"
      aria-label="Remove"
    >
      <Icon name="close" className="text-[12px]" />
    </button>
  ) : null

  if (as === 'span') {
    return (
      <span className={`${base} ${tone} ${className}`}>
        {children}
        {removeButton}
      </span>
    )
  }

  return (
    <button type="button" className={`${base} ${tone} ${className}`} onClick={onClick}>
      {children}
      {removeButton}
    </button>
  )
}
