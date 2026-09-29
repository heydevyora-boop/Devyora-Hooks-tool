import { Toggle } from '../ui/Toggle'

interface SettingsToggleRowProps {
  label: string
  detail: string
  enabled: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
}

export function SettingsToggleRow({
  label,
  detail,
  enabled,
  onChange,
  disabled = false,
}: SettingsToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex flex-col pr-3">
        <span className="font-label-md text-label-md text-on-surface font-semibold">{label}</span>
        <span className="font-label-sm text-label-sm text-on-surface-variant">{detail}</span>
      </div>
      <Toggle enabled={enabled} onChange={onChange} disabled={disabled} />
    </div>
  )
}
