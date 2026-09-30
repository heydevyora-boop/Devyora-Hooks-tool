import { Icon } from '../../ui/Icon'
import { RegenerateControl } from './RegenerateControl'
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard'
import type { BRollShot } from '../../../types'

interface BRollPlanListProps {
  shots: BRollShot[]
  onRegenerate: (feedback: string) => void
}

/** The practical shot list a creator can follow without re-reading the script. */
export function BRollPlanList({ shots, onRegenerate }: BRollPlanListProps) {
  const { copied, copy } = useCopyToClipboard()
  const shotListText = shots.map((shot, i) => `${i + 1}. ${shot.description}`).join('\n')

  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="font-title text-title text-on-surface flex items-center gap-1.5">
          <Icon name="videocam" className="text-secondary text-[20px]" />
          B-Roll Plan
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => copy(shotListText)}
            className="text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 bg-surface-container px-2 py-1 rounded"
          >
            <Icon name={copied ? 'check' : 'copy_all'} className="text-[14px]" />
            {copied ? 'Copied!' : 'Copy List'}
          </button>
          <RegenerateControl targetLabel="B-Roll Plan" onRegenerate={onRegenerate} />
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {shots.map((shot, index) => (
          <li
            key={`${shot.sceneNumber}-${index}`}
            className="flex items-start gap-2.5 bg-surface-container-low rounded-lg p-2.5"
          >
            <Icon name="check_box_outline_blank" className="text-secondary text-[16px] mt-0.5 shrink-0" />
            <div className="flex flex-col">
              <span className="font-label-sm text-[11px] text-on-surface-variant">
                Scene {shot.sceneNumber}
              </span>
              <p className="font-body-sm text-body-sm text-on-surface leading-snug">
                {shot.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
