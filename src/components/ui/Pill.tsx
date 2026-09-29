import type { ReactNode } from 'react'

interface PillProps {
  children: ReactNode
  active?: boolean
  onClick?: () => void
  className?: string
  as?: 'button' | 'span'
}

export function Pill({
  children,
  active = false,
  onClick,
  className = '',
  as = 'button',
}: PillProps) {
  const base =
    'shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full font-label-sm text-label-sm transition-all'
  const tone = active
    ? 'bg-primary text-on-primary shadow-sm'
    : 'bg-surface-container-high text-on-surface-variant active:bg-surface-container-highest'

  if (as === 'span') {
    return <span className={`${base} ${tone} ${className}`}>{children}</span>
  }

  return (
    <button type="button" className={`${base} ${tone} ${className}`} onClick={onClick}>
      {children}
    </button>
  )
}
