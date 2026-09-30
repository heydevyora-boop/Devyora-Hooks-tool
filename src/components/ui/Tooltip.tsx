import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

interface TooltipProps {
  text: string
  /** Where the panel opens relative to the info icon. Defaults to left-aligned. */
  align?: 'left' | 'right'
  className?: string
}

/**
 * A single reusable "what does this mean?" affordance — an info icon that
 * opens a short plain-English explanation. Tap-to-toggle (not hover-only) so
 * it works the same on mobile and desktop, and closes on outside click or a
 * second tap.
 */
export function Tooltip({ text, align = 'left', className = '' }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div ref={containerRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="More information"
        className="w-4 h-4 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0"
      >
        <Icon name="info" className="text-[12px]" />
      </button>
      {isOpen && (
        <div
          className={`absolute top-full mt-1.5 z-20 w-56 p-2.5 rounded-lg bg-inverse-surface text-inverse-on-surface font-body-sm text-body-sm leading-snug shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {text}
        </div>
      )}
    </div>
  )
}
