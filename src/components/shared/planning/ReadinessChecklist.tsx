import { Icon } from '../../ui/Icon'

interface ReadinessItem {
  label: string
  ready: boolean
}

interface ReadinessChecklistProps {
  items: ReadinessItem[]
}

/** Surfaces the required planning sequence (Product Knowledge → Account →
 * History → Inspiration → Grid) directly in the UI, so Strategy visibly
 * depends on the layers before it rather than skipping ahead silently. */
export function ReadinessChecklist({ items }: ReadinessChecklistProps) {
  return (
    <div className="bg-surface-container-low rounded-xl p-3 flex flex-col gap-1.5">
      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
        Planning Inputs
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <Icon
              name={item.ready ? 'check_circle' : 'radio_button_unchecked'}
              className={`text-[16px] ${item.ready ? 'text-emerald-600' : 'text-on-surface-variant'}`}
            />
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
