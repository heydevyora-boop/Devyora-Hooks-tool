import { useState } from 'react'
import { Icon } from '../../ui/Icon'
import { FileDropzone } from '../../ui/FileDropzone'
import { VoiceInputButton } from '../../ui/VoiceInputButton'
import { SourceListItem } from './SourceListItem'
import type { ContentSourceItem, ContentSourceType } from '../../../types'

interface SourceImportPanelProps {
  sources: ContentSourceItem[]
  onChange: (next: ContentSourceItem[]) => void
}

function detectUrlType(url: string): ContentSourceType {
  if (/instagram\.com/i.test(url)) return 'instagram_url'
  if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube_url'
  if (/^https?:\/\//i.test(url)) return 'website_url'
  return 'other_url'
}

function classifyFile(file: File): ContentSourceType {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  return 'pdf'
}

function makeItem(partial: Omit<ContentSourceItem, 'id' | 'status' | 'addedAt'>): ContentSourceItem {
  return {
    ...partial,
    id: `source-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    status: 'ready',
    addedAt: new Date().toISOString(),
  }
}

export function SourceImportPanel({ sources, onChange }: SourceImportPanelProps) {
  const [urlDraft, setUrlDraft] = useState('')
  const [textDraft, setTextDraft] = useState('')

  const addSource = (item: ContentSourceItem) => onChange([item, ...sources])
  const removeSource = (id: string) => onChange(sources.filter((source) => source.id !== id))

  const handleAddUrl = () => {
    const url = urlDraft.trim()
    if (!url) return
    addSource(
      makeItem({
        type: detectUrlType(url),
        title: url.replace(/^https?:\/\//, '').slice(0, 60),
        value: url,
      }),
    )
    setUrlDraft('')
  }

  const handleAddText = () => {
    const text = textDraft.trim()
    if (!text) return
    addSource(
      makeItem({
        type: 'text',
        title: text.length > 60 ? `${text.slice(0, 60)}…` : text,
        value: text,
      }),
    )
    setTextDraft('')
  }

  const handleFiles = (files: File[]) => {
    const newItems = files.map((file) => {
      const type = classifyFile(file)
      return makeItem({
        type,
        title: file.name,
        value: file.name,
        previewUrl: type === 'image' ? URL.createObjectURL(file) : undefined,
      })
    })
    onChange([...newItems, ...sources])
  }

  return (
    <div className="flex flex-col gap-space-md">
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
            className="px-4 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold"
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
            onTranscript={(transcript) => setTextDraft(transcript)}
          />
        </div>
        <textarea
          className="w-full bg-surface-container-low rounded-lg p-2.5 font-body-md text-body-md text-on-surface outline-none min-h-[80px] resize-y"
          value={textDraft}
          onChange={(event) => setTextDraft(event.target.value)}
          placeholder="Paste a caption, transcript, or notes…"
        />
        <button
          type="button"
          onClick={handleAddText}
          disabled={!textDraft.trim()}
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
