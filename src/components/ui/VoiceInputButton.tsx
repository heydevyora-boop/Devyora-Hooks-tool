import { useSpeechToText } from '../../hooks/useSpeechToText'
import { Icon } from './Icon'

interface VoiceInputButtonProps {
  /** Called with the live transcript as the user speaks; isFinal marks the end of an utterance */
  onTranscript: (transcript: string, isFinal: boolean) => void
  className?: string
  label?: string
}

export function VoiceInputButton({ onTranscript, className = '', label }: VoiceInputButtonProps) {
  const { isSupported, isListening, start, stop } = useSpeechToText({ onResult: onTranscript })

  if (!isSupported) {
    return (
      <span
        className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant"
        title="Voice input isn't supported in this browser — try Chrome or Edge"
      >
        <Icon name="mic_off" className="text-[16px]" />
        {label ?? 'Voice unavailable'}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={isListening ? stop : start}
      title={isListening ? 'Stop dictation' : 'Start dictation'}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-label-sm text-label-sm font-medium transition-colors ${
        isListening
          ? 'bg-error/10 text-error'
          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
      } ${className}`}
    >
      <span className="relative flex items-center justify-center">
        <Icon name={isListening ? 'stop_circle' : 'mic'} className="text-[16px]" />
        {isListening && (
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-error animate-ping" />
        )}
      </span>
      {label ?? (isListening ? 'Listening…' : 'Dictate')}
    </button>
  )
}
