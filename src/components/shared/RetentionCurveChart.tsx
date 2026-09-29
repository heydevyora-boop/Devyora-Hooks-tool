export function RetentionCurveChart() {
  return (
    <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-2">
      <div className="flex justify-between items-center text-label-sm font-code">
        <span className="text-on-surface-variant">Retention Velocity Curve</span>
        <span className="text-error font-semibold">-38% cliff @ 0:03</span>
      </div>
      <svg
        className="w-full h-16 text-on-surface"
        preserveAspectRatio="none"
        viewBox="0 0 300 70"
      >
        <path
          d="M0,10 Q60,12 80,60 T140,62 T220,64 L300,65"
          fill="none"
          stroke="currentColor"
          strokeDasharray="4,4"
          strokeOpacity="0.15"
          strokeWidth="2"
        />
        <path
          d="M0,10 Q40,11 60,18 T120,24 T200,28 L300,32"
          fill="none"
          stroke="#4f46e5"
          strokeWidth="2.5"
        />
        <circle cx="80" cy="60" fill="#ba1a1a" r="3.5" />
        <circle cx="60" cy="18" fill="#4f46e5" r="3.5" />
      </svg>
      <div className="flex items-center justify-between font-code text-[10px] text-on-surface-variant">
        <div className="flex items-center gap-1">
          <span className="w-2 h-0.5 bg-outline" />
          <span>Script #89 Failure (Premature Demo)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-0.5 bg-primary-container" />
          <span>Corrected Model</span>
        </div>
      </div>
    </div>
  )
}
