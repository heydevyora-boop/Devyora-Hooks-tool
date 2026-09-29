interface ProgressBarProps {
  value: number
  trackClassName?: string
  fillClassName?: string
  heightClassName?: string
}

export function ProgressBar({
  value,
  trackClassName = 'bg-surface-container-highest',
  fillClassName = 'bg-gradient-to-r from-primary to-secondary-container',
  heightClassName = 'h-2',
}: ProgressBarProps) {
  return (
    <div className={`w-full ${heightClassName} rounded-full overflow-hidden ${trackClassName}`}>
      <div
        className={`h-full rounded-full ${fillClassName}`}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}
