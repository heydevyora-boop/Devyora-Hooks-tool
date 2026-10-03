import { useState } from 'react'
import { Icon } from '../../ui/Icon'
import { FileDropzone } from '../../ui/FileDropzone'
import { VoiceInputButton } from '../../ui/VoiceInputButton'
import { SourceListItem } from './SourceListItem'
import { ApiError } from '../../../api/client'
import { createTextSource, createUrlSource, createFileSource, deleteSource } from '../../../api/sources'
import { uploadMedia } from '../../../api/media'
import type { ContentSourceItem } from '../../../types'

interface SourceImportPanelProps {
  sources: ContentSourceItem[]
  onChange: (next: ContentSourceItem[]) => void
}

function describeError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  return "Couldn't reach the server — try again in a moment."
}

export function SourceImportPanel({ sources, onChange }: SourceImportPanelProps) {
  const [urlDraft, setUrlDraft] = useState('')
  const [textDraft, setTextDraft] = useState('')
  const [textOrigin, setTextOrigin] = useState<'text' | 'speech'>('text')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addSource = (item: ContentSourceItem) => onChange([item, ...sources])
  const removeSource = async (id: string) => {
    setError(null)
    try {
      await deleteSource(id)
      onChange(sources.filter((source) => source.id !== id))
    } catch (err) {
      setError(describeError(err))
    }
  }

  const handleAddUrl = async () => {
    const url = urlDraft.trim()
    if (!url) return
    setError(null)
    setIsSubmitting(true)
    try {
      addSource(await createUrlSource(url))
      setUrlDraft('')
    } catch (err) {
      setError(describeError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddText = async () => {
    const text = textDraft.trim()
    if (!text) return
    setError(null)
    setIsSubmitting(true)
    try {
      addSource(await createTextSource(text, textOrigin))
      setTextDraft('')
      setTextOrigin('text')
    } catch (err) {
      setError(describeError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFiles = async (files: File[]) => {
    setError(null)
    setIsSubmitting(true)
    try {
      for (const file of files) {
        const asset = await uploadMedia(file)
        const source = await createFileSource(asset.id)
        addSource(
          file.type.startsWith('image/') ? { ...source, previewUrl: URL.createObjectURL(file) } : source,
        )
      }
    } catch (err) {
      setError(describeError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-space-md">
      {error && (
        <div className="bg-error-container rounded-lg p-2.5 flex items-start gap-2">
          <Icon name="error" className="text-error text-[16px] mt-0.5" />
          <p className="font-label-sm text-label-sm text-on-error-container">{error}</p>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-3">
        <span className="font-label-md text-label-md text-on-surface font-semibold">
          Add from a URL
        </span>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-surface-container-low rounded-lg p-2.5 flex items-center gap-2">
            <Icon name="link" className="text-primary text-[18px]" />
            <input
              className="w-full bg-transparent font-body-md text-body-md text-on-surface outline-none"
              type="url"
              placeholder="Instagram, YouTube, website, or any other URL…"
              value={urlDraft}
              onChange={(event) => setUrlDraft(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleAddUrl()}
            />
          </div>
          <button
            type="button"
            onClick={handleAddUrl}
            disabled={isSubmitting || !urlDraft.trim()}
            className="px-4 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold disabled:opacity-60"
          >
            Add
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-3">
        <span className="font-label-md text-label-md text-on-surface font-semibold">
          Upload a file
        </span>
        <FileDropzone onFiles={handleFiles} />
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface font-semibold">
            Paste text or dictate
          </span>
          <VoiceInputButton
            onTranscript={(transcript) => {
              setTextOrigin('speech')
              setTextDraft(transcript)
            }}
          />
        </div>
        <textarea
          className="w-full bg-surface-container-low rounded-lg p-2.5 font-body-md text-body-md text-on-surface outline-none min-h-[80px] resize-y"
          value={textDraft}
          onChange={(event) => {
            setTextOrigin('text')
            setTextDraft(event.target.value)
          }}
          placeholder="Paste a caption, transcript, or notes…"
        />
        <button
          type="button"
          onClick={handleAddText}
          disabled={isSubmitting || !textDraft.trim()}
          className="self-end px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold disabled:opacity-50"
        >
          Add Source
        </button>
      </div>

      {sources.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            {sources.length} Source{sources.length === 1 ? '' : 's'} Added
          </span>
          {sources.map((source) => (
            <SourceListItem
              key={source.id}
              source={source}
              onRemove={() => removeSource(source.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
