import type { GridTemplate } from '../types'

function makeSlots(pattern: { contentType: GridTemplate['slots'][number]['contentType']; label?: string }[]) {
  return pattern.map((slot, index) => ({
    id: `slot-${index}`,
    position: index,
    contentType: slot.contentType,
    label: slot.label,
  }))
}

export const presetGridTemplates: GridTemplate[] = [
  {
    id: 'grid-3-2-1',
    name: '3-2-1 Rotation',
    description: 'Two Reels for reach, then a Carousel, then a Static post — repeat.',
    isPreset: true,
    createdAt: '2026-07-01T09:00:00.000Z',
    updatedAt: '2026-07-01T09:00:00.000Z',
    slots: makeSlots([
      { contentType: 'reel' },
      { contentType: 'reel' },
      { contentType: 'carousel' },
      { contentType: 'static' },
      { contentType: 'reel' },
      { contentType: 'reel' },
      { contentType: 'carousel' },
      { contentType: 'static' },
      { contentType: 'reel' },
    ]),
  },
  {
    id: 'grid-product-spotlight',
    name: 'Product Spotlight',
    description: 'Cycles evenly through your products so no single product dominates the grid.',
    isPreset: true,
    createdAt: '2026-07-01T09:00:00.000Z',
    updatedAt: '2026-07-01T09:00:00.000Z',
    slots: makeSlots([
      { contentType: 'reel', label: 'Product A' },
      { contentType: 'carousel', label: 'Product B' },
      { contentType: 'static', label: 'Product C' },
      { contentType: 'reel', label: 'Product A' },
      { contentType: 'carousel', label: 'Product B' },
      { contentType: 'static', label: 'Product C' },
      { contentType: 'reel', label: 'Product A' },
      { contentType: 'carousel', label: 'Product B' },
      { contentType: 'static', label: 'Product C' },
    ]),
  },
  {
    id: 'grid-balanced-mix',
    name: 'Balanced Mix',
    description: 'An even split of Reels, Carousels, and Static posts across the grid.',
    isPreset: true,
    createdAt: '2026-07-01T09:00:00.000Z',
    updatedAt: '2026-07-01T09:00:00.000Z',
    slots: makeSlots([
      { contentType: 'reel' },
      { contentType: 'carousel' },
      { contentType: 'static' },
      { contentType: 'carousel' },
      { contentType: 'static' },
      { contentType: 'reel' },
      { contentType: 'static' },
      { contentType: 'reel' },
      { contentType: 'carousel' },
    ]),
  },
]
