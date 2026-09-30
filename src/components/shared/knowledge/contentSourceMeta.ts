import type { ContentSourceType } from '../../../types'

export const SOURCE_TYPE_ICON: Record<ContentSourceType, string> = {
  instagram_url: 'photo_camera',
  youtube_url: 'smart_display',
  website_url: 'language',
  other_url: 'link',
  image: 'image',
  video: 'movie',
  screenshot: 'screenshot_monitor',
  pdf: 'picture_as_pdf',
  text: 'notes',
  speech: 'mic',
}

export const SOURCE_TYPE_LABEL: Record<ContentSourceType, string> = {
  instagram_url: 'Instagram URL',
  youtube_url: 'YouTube URL',
  website_url: 'Website URL',
  other_url: 'URL',
  image: 'Image',
  video: 'Video',
  screenshot: 'Screenshot',
  pdf: 'PDF / Document',
  text: 'Pasted Text',
  speech: 'Speech-to-Text',
}
