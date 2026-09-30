import { Link } from 'react-router-dom'
import { Icon } from '../../ui/Icon'

interface KnowledgeSourceTileProps {
  icon: string
  label: string
  count: number
  to: string
}

/** Links the Knowledge Base back to where each kind of permanent knowledge
 * is actually authored (Content Hub), instead of duplicating its CRUD UI. */
export function KnowledgeSourceTile({ icon, label, count, to }: KnowledgeSourceTileProps) {
  return (
    <Link
      to={to}
      className="p-3 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-1.5 hover:shadow-md transition-shadow"
    >
      <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
        <Icon name={icon} className="text-[18px]" />
      </div>
      <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
        {count}
      </span>
      <span className="font-label-sm text-label-sm text-on-surface-variant">{label}</span>
    </Link>
  )
}
