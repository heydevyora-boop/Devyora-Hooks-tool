import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  className?: string
  /** Settings-style forms read better centered and narrower than dashboard pages. */
  narrow?: boolean
}

export function PageContainer({ children, className = '', narrow = false }: PageContainerProps) {
  return (
    <div
      className={`w-full mx-auto px-gutter-mobile lg:px-10 xl:px-12 ${
        narrow ? 'max-w-3xl' : 'max-w-[1440px]'
      } ${className}`}
    >
      {children}
    </div>
  )
}
