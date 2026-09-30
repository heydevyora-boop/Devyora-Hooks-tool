import { useState } from 'react'
import { Icon } from '../../ui/Icon'
import { VoiceInputButton } from '../../ui/VoiceInputButton'

interface RegenerateControlProps {
  /** What this control regenerates, e.g. "Hook #2" or "Scene 3" — shown in the prompt. */
  targetLabel: string
  onRegenerate: (feedback: string) => void
  className?: string
}

const EXAMPLE_PROMPTS = [
  'Hook is too generic.',
  'Show more product.',
  'Too similar to previous content.',
  'Make it easier to shoot.',
]

/**
 * The single reusable "Regenerate" affordance for every script output
 * (hooks, scenes, visual direction, b-roll, caption). Feedback can be
 * typed or spoken — same microphone pattern as VoiceInputButton elsewhere
 * in the app. Never rebuilt per-surface.
 */
export function RegenerateControl({ targetLabel, onRegenerate, className = '' }: RegenerateControlProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [examplePrompt] = useState(
    () => EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)],
  )

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1 font-label-sm text-label-sm text-primary font-semibold ${className}`}
      >
        <Icon name="refresh" className="text-[14px]" />
        Regenerate
      </button>
    )
  }

  return (
    <div className={`bg-surface-container-low rounded-lg p-3 flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
          Regenerate {targetLabel}
        </span>
        <VoiceInputButton
          label=""
          onTranscript={(transcript) => setFeedback(transcript)}
        />
      </div>
      <textarea
        autoFocus
        className="w-full bg-surface-container-lowest rounded-lg p-2.5 font-body-sm text-body-sm text-on-surface outline-none min-h-[64px] resize-y"
        placeholder={`Why? e.g. "${examplePrompt}"`}
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setIsOpen(false)
            setFeedback('')
          }}
          className="flex-1 py-1.5 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!feedback.trim()}
          onClick={() => {
            onRegenerate(feedback.trim())
            setIsOpen(false)
            setFeedback('')
          }}
          className="flex-1 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold disabled:opacity-50"
        >
          Regenerate
        </button>
      </div>
    </div>
  )
}
