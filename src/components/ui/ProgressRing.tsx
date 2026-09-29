interface ProgressRingProps {
  value: number
  size?: number
  trackColorClass?: string
  progressColorClass?: string
}

export function ProgressRing({
  value,
  size = 56,
  trackColorClass = 'text-surface-container',
  progressColorClass = 'text-emerald-500',
}: ProgressRingProps) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        className="w-full h-full -rotate-90"
        viewBox="0 0 36 36"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <path
          className={trackColorClass}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
        />
        <path
          className={progressColorClass}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeDasharray={`${value}, 100`}
          strokeLinecap="round"
          strokeWidth="3.5"
        />
      </svg>
      <span className="absolute font-code text-label-sm font-bold text-on-surface">
        {value}%
      </span>
    </div>
  )
}
