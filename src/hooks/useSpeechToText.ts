import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Thin wrapper around the browser's native Web Speech API
 * (SpeechRecognition / webkitSpeechRecognition). This is a real, working
 * client-side implementation — not a mock — but it only works in browsers
 * that ship the API (Chrome/Edge; not Firefox/Safari as of this writing).
 * `isSupported` lets callers hide/disable the mic affordance gracefully
 * where it isn't available, rather than showing a dead button.
 *
 * A server-side transcription fallback for unsupported browsers is a
 * genuine API placeholder — there is no backend in this app to call.
 */

interface UseSpeechToTextOptions {
  onResult?: (transcript: string, isFinal: boolean) => void
  lang?: string
}

export function useSpeechToText({ onResult, lang = 'en-US' }: UseSpeechToTextOptions = {}) {
  const [isSupported] = useState(
    () =>
      typeof window !== 'undefined' &&
      Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition),
  )
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  const start = useCallback(() => {
    if (!isSupported || isListening) return

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognitionCtor()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = lang

    recognition.onresult = (event: any) => {
      let transcript = ''
      let isFinal = false
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript
        if (event.results[i].isFinal) isFinal = true
      }
      onResult?.(transcript, isFinal)
    }
    recognition.onerror = (event: any) => {
      setError(event.error ?? 'speech_recognition_error')
      setIsListening(false)
    }
    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    setError(null)
    recognition.start()
    setIsListening(true)
  }, [isSupported, isListening, lang, onResult])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  return { isSupported, isListening, error, start, stop }
}
