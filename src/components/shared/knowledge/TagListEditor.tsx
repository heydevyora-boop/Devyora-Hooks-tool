import { useState } from 'react'
import { Pill } from '../../ui/Pill'
import { VoiceInputButton } from '../../ui/VoiceInputButton'
import { Icon } from '../../ui/Icon'

interface TagListEditorProps {
  label: string
  values: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  enableVoice?: boolean
}

/** Generic add/remove chip-list editor, reused for every array field on a Product record. */
export function TagListEditor({
  label,
  values,
  onChange,
  placeholder = 'Type and press Enter…',
  enableVoice = true,
}: TagListEditorProps) {
  const [draft, setDraft] = useState('')

  const commit = () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    onChange([...values, trimmed])
    setDraft('')
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-label-md text-label-md text-on-surface font-semibold">{label}</label>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-surface-container-low rounded-lg p-2.5 flex items-center gap-2">
          <Icon name="add_circle" className="text-on-surface-variant text-[18px]" />
          <input
            className="w-full bg-transparent font-body-md text-body-md text-on-surface outline-none"
            type="text"
            placeholder={placeholder}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                commit()
              }
            }}
          />
        </div>
        {enableVoice && (
          <VoiceInputButton
            label=""
            onTranscript={(transcript, isFinal) => {
              setDraft(transcript)
              if (isFinal && transcript.trim()) {
                onChange([...values, transcript.trim()])
                setDraft('')
              }
            }}
          />
        )}
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {values.map((value, index) => (
            <Pill
              key={`${value}-${index}`}
              as="span"
              onRemove={() => onChange(values.filter((_, i) => i !== index))}
            >
              {value}
            </Pill>
          ))}
        </div>
      )}
    </div>
  )
}
