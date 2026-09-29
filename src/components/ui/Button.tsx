import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: Variant
  fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-on-primary shadow-md shadow-primary/30 active:scale-95',
  accent:
    'bg-tertiary-container text-on-tertiary shadow-lg shadow-tertiary-container/25 active:scale-[0.99]',
  secondary: 'bg-surface-container-high text-on-surface shadow-sm',
  outline: 'bg-surface-container-lowest border border-outline-variant text-on-surface',
  ghost: 'bg-surface-container-low text-on-surface hover:bg-surface-container',
}

export function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`rounded-xl font-title text-title font-semibold flex items-center justify-center gap-2 transition-transform ${
        variantClasses[variant]
      } ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
