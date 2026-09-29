import { hookTemplates } from '../../data/mockLibrary'

export function HooksVaultView() {
  return (
    <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-title text-title text-on-surface">High-Conversion Hooks Matrix</h4>
        <span className="font-label-sm text-label-sm text-tertiary-container bg-tertiary-fixed px-2 py-0.5 rounded font-semibold">
          84 Templates
        </span>
      </div>
      <div className="space-y-2">
        {hookTemplates.map((hook) => (
          <div key={hook.id} className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1.5">
            <span
              className={`font-label-sm text-label-sm font-semibold uppercase ${hook.labelColorClass}`}
            >
              {hook.label}
            </span>
            <p className="font-body-sm text-body-sm text-on-surface font-medium">{hook.text}</p>
            <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm pt-1">
              <span>Hold: {hook.hold}</span>
              <button className="text-primary font-semibold text-label-sm flex items-center gap-0.5">
                Use Hook <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
