import type { GridSlotContentType } from '../../../types'

export const SLOT_TYPE_ICON: Record<GridSlotContentType, string> = {
  reel: 'play_circle',
  carousel: 'view_carousel',
  static: 'image',
  story: 'auto_stories',
  empty: 'add',
}

export const SLOT_TYPE_LABEL: Record<GridSlotContentType, string> = {
  reel: 'Reel',
  carousel: 'Carousel',
  static: 'Static',
  story: 'Story',
  empty: 'Empty',
}

export const SLOT_TYPE_COLOR_CLASS: Record<GridSlotContentType, string> = {
  reel: 'bg-primary/10 text-primary',
  carousel: 'bg-secondary-container/20 text-secondary',
  static: 'bg-tertiary-fixed text-tertiary',
  story: 'bg-emerald-500/10 text-emerald-700',
  empty: 'bg-surface-container text-on-surface-variant',
}

export const SLOT_CONTENT_TYPES: GridSlotContentType[] = ['reel', 'carousel', 'static', 'story']
