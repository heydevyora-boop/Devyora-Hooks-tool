import { Fragment } from 'react'
import { Icon } from '../ui/Icon'
import type { KnowledgeModule } from '../../types'

interface KnowledgeModuleCardProps {
  module: KnowledgeModule
}

function ModuleMeta({ module }: { module: KnowledgeModule }) {
  if (!module.meta) return null
  const colorClass = module.metaColorClass ?? 'text-on-surface-variant'

  if (module.metaVariant === 'pills') {
    return (
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        {module.meta.map((item) => (
          <span
            key={item}
            className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-code text-label-sm"
          >
            {item}
          </span>
        ))}
      </div>
    )
  }

  if (module.metaVariant === 'warning') {
    return (
      <div className={`flex items-center gap-2 mt-2 font-code text-label-sm ${colorClass}`}>
        <Icon name="warning" className="text-[14px]" />
        <span>{module.meta[0]}</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 mt-2 font-code text-label-sm flex-wrap ${colorClass}`}>
      {module.meta.map((item, index) => (
        <Fragment key={item}>
          {index > 0 && <span>•</span>}
          <span className={module.id === 'km-1' && index === 2 ? 'text-tertiary font-semibold' : ''}>
            {item}
          </span>
        </Fragment>
      ))}
    </div>
  )
}

export function KnowledgeModuleCard({ module }: KnowledgeModuleCardProps) {
  return (
    <div className="p-3.5 rounded-xl bg-surface-container-lowest shadow-sm flex items-start justify-between">
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${module.iconColorClass}`}
        >
          <Icon name={module.icon} className="text-[20px]" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-title text-[15px] text-on-surface">{module.title}</span>
            {module.badge && (
              <span
                className={`px-1.5 py-0.5 rounded font-code text-label-sm ${module.badgeColorClass}`}
              >
                {module.badge}
              </span>
            )}
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            {module.description}
          </p>
          <ModuleMeta module={module} />
        </div>
      </div>
      <Icon name="chevron_right" className="text-outline-variant text-[20px]" />
    </div>
  )
}
