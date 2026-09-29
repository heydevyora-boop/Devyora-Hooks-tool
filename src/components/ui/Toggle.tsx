interface ToggleProps {
  enabled: boolean
  onChange?: (next: boolean) => void
  disabled?: boolean
}

export function Toggle({ enabled, onChange, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange?.(!enabled)}
      className={`w-10 h-6 rounded-full p-0.5 flex items-center transition-colors ${
        enabled ? 'bg-primary-container justify-end' : 'bg-surface-container-high justify-start'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <span className="w-5 h-5 bg-on-primary rounded-full shadow-sm" />
    </button>
  )
}
