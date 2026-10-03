import { api } from './client'

export interface CalendarEntryView {
  id: string
  title: string
  date: string
  product?: string
  productId?: string
  contentType?: 'reel' | 'carousel' | 'static' | 'story' | 'empty'
  platform: string
  gridPosition?: number
  strategyId?: string
  flowchartNodeId?: string
  generatedContentId?: string
  status: 'planned' | 'scheduled' | 'published' | 'skipped'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CalendarEntryInput {
  title: string
  date: string
  productId?: string
  contentType?: CalendarEntryView['contentType']
  platform?: string
  gridPosition?: number
  strategyId?: string
  notes?: string
}

export interface ListCalendarParams {
  from?: string
  to?: string
  productId?: string
  status?: CalendarEntryView['status']
  platform?: string
  q?: string
}

export function listCalendarEntries(params: ListCalendarParams = {}): Promise<CalendarEntryView[]> {
  const search = new URLSearchParams({ limit: '200' })
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value)
  }
  return api.get<{ items: CalendarEntryView[] }>(`/calendar?${search}`).then((r) => r.items)
}

export function createCalendarEntry(input: CalendarEntryInput): Promise<CalendarEntryView> {
  return api.post<{ entry: CalendarEntryView }>('/calendar', input).then((r) => r.entry)
}

export function updateCalendarEntry(id: string, input: Partial<CalendarEntryInput & { status: CalendarEntryView['status'] }>): Promise<CalendarEntryView> {
  return api.patch<{ entry: CalendarEntryView }>(`/calendar/${id}`, input).then((r) => r.entry)
}

export function rescheduleCalendarEntry(id: string, date: string): Promise<CalendarEntryView> {
  return api.post<{ entry: CalendarEntryView }>(`/calendar/${id}/reschedule`, { date }).then((r) => r.entry)
}
