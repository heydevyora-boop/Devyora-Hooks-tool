import { api } from './client'
import type { ContentSourceItem } from '../types'

export function listSources(): Promise<ContentSourceItem[]> {
  return api.get<{ items: ContentSourceItem[] }>('/sources?limit=100').then((r) => r.items)
}

export function createUrlSource(url: string): Promise<ContentSourceItem> {
  return api.post<{ source: ContentSourceItem }>('/sources', { kind: 'url', value: url }).then((r) => r.source)
}

export function createTextSource(text: string, origin: 'text' | 'speech' = 'text'): Promise<ContentSourceItem> {
  return api.post<{ source: ContentSourceItem }>('/sources', { kind: 'text', value: text, origin }).then((r) => r.source)
}

export function createFileSource(mediaAssetId: string): Promise<ContentSourceItem> {
  return api.post<{ source: ContentSourceItem }>('/sources', { kind: 'file', mediaAssetId }).then((r) => r.source)
}

export function deleteSource(id: string): Promise<void> {
  return api.delete(`/sources/${id}`)
}
