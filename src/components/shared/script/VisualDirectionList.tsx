import { Icon } from '../../ui/Icon'
import { RegenerateControl } from './RegenerateControl'
import type { VisualDirectionBeat } from '../../../types'

interface VisualDirectionListProps {
  beats: VisualDirectionBeat[]
  onRegenerate: (feedback: string, origin: 'text' | 'speech') => void
}

/** WHAT needs to be shown, scene by scene — never camera settings. */
export function VisualDirectionList({ beats, onRegenerate }: VisualDirectionListProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="font-title text-title text-on-surface flex items-center gap-1.5">
          <Icon name="visibility" className="text-primary text-[20px]" />
          Visual Direction
        </span>
        <RegenerateControl targetLabel="Visual Direction" onRegenerate={onRegenerate} />
      </div>
      <ol className="flex flex-col gap-2">
        {beats.map((beat) => (
          <li
            key={beat.sceneNumber}
            className="flex items-start gap-2.5 bg-surface-container-low rounded-lg p-2.5"
          >
            <span className="w-6 h-6 rounded-md bg-surface-container-high flex items-center justify-center font-code text-label-sm font-bold text-on-surface shrink-0">
              {beat.sceneNumber}
            </span>
            <p className="font-body-sm text-body-sm text-on-surface leading-snug">
              {beat.description}
            </p>
          </li>
        ))}
      </ol>
    </div>
  )
}
