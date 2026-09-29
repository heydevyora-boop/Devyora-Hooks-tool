import { Icon } from '../ui/Icon'

interface MicroModuleCardProps {
  icon: string
  iconColorClass: string
  title: string
  description: string
  meta: string
  metaColorClass: string
}

export function MicroModuleCard({
  icon,
  iconColorClass,
  title,
  description,
  meta,
  metaColorClass,
}: MicroModuleCardProps) {
  return (
    <div className="p-3 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
      <div>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${iconColorClass}`}>
          <Icon name={icon} className="text-[18px]" />
        </div>
        <span className="font-title text-[14px] text-on-surface block">{title}</span>
        <p className="font-body-sm text-[12px] text-on-surface-variant mt-1 leading-snug">
          {description}
        </p>
      </div>
      <span className={`font-code text-label-sm mt-3 ${metaColorClass}`}>{meta}</span>
    </div>
  )
}
