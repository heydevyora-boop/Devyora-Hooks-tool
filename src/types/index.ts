export interface NavItem {
  path: string
  label: string
  sidebarLabel?: string
  icon: string
  isPrimaryAction?: boolean
}

export interface StatCardData {
  id: string
  label: string
  value: string
  icon: string
  iconColorClass: string
  trendValue?: string
  trendValueColorClass?: string
  trendCaption: string
  showDot?: boolean
}

export interface TopScript {
  id: string
  format: string
  views: string
  iq: number
  title: string
  hookHold: string
  tags: string[]
  badgeColorClass: string
}

export interface RecentScript {
  id: string
  title: string
  status: 'Draft' | 'Exported'
  statusNote: string
  icon: string
  iconColorClass: string
  score: number
  scoreColorClass: string
}

export type ScoreTier = 'elite' | 'good' | 'average' | 'weak'

export interface ScorecardMetric {
  label: string
  value: string
  colorClass: string
  highlight?: boolean
}

export interface HookVariation {
  id: string
  label: string
  iq: number
  angleLabel: string
  patternName: string
  patternIcon: string
  text: string
  selected?: boolean
}

export interface DirectorScene {
  id: number
  title: string
  timeRange: string
  colorClass: string
  camera?: string
  visual?: string
  dialogue: string
  broll?: string
  overlay?: string
  transition?: string
  directorNote?: string
  loopNote?: string
}

export interface LibraryScript {
  id: string
  format: 'Reel' | 'Shorts' | 'Founder POV'
  formatColorClass: string
  formatIcon: string
  preset: string
  duration?: string
  iq: number
  iqStatus: 'elite' | 'good' | 'weak'
  title: string
  hookRetention?: number
  views?: string
  shares?: string
  demos?: string
  flagMessage?: string
  lifetimeViews?: string
  retentionCliff?: string
  algorithmScore?: string
  threeSecondHold?: string
  holdDelta?: string
}

export interface HookTemplate {
  id: string
  label: string
  labelColorClass: string
  text: string
  hold: string
}

export interface ScriptVersion {
  id: string
  version: string
  title: string
  note: string
  status: 'Deployed' | 'Merged'
  statusColorClass: string
}

export type KnowledgeModuleMetaVariant = 'inline' | 'pills' | 'warning'

export interface KnowledgeModule {
  id: string
  icon: string
  iconColorClass: string
  title: string
  badge?: string
  badgeColorClass?: string
  description: string
  meta?: string[]
  metaColorClass?: string
  metaVariant?: KnowledgeModuleMetaVariant
}

export interface RulebookEntry {
  id: string
  category: string
  categoryColorClass: string
  title: string
  description?: string
  tags?: string[]
  showDisruptionMeter?: boolean
}

// ---------------------------------------------------------------------------
// Content Hub: Product Knowledge, Instagram Connection, Content Import,
// Historical Content, Content Timeline
// ---------------------------------------------------------------------------

export interface ProductKnowledge {
  id: string
  name: string
  description: string
  features: string[]
  benefits: string[]
  applications: string[]
  sellingPoints: string[]
  targetAudience: string
  limitations: string[]
  contentAngles: string[]
  createdAt: string
  updatedAt: string
}

export type InstagramConnectionStatus = 'not_connected' | 'connecting' | 'connected' | 'syncing'

export interface InstagramTopContentItem {
  id: string
  title: string
  format: string
  date: string
  engagement: string
}

export interface InstagramConnection {
  status: InstagramConnectionStatus
  handle?: string
  followers?: number
  posts?: number
  reels?: number
  postingFrequency?: string
  lastSyncedAt?: string
  topPerformingContent?: InstagramTopContentItem[]
}

export type ContentSourceType =
  | 'instagram_url'
  | 'youtube_url'
  | 'website_url'
  | 'other_url'
  | 'image'
  | 'video'
  | 'screenshot'
  | 'pdf'
  | 'text'
  | 'speech'

export type ContentSourceStatus = 'pending' | 'processing' | 'ready' | 'error'

export interface ContentSourceItem {
  id: string
  type: ContentSourceType
  title: string
  /** URL for link types, transcript/pasted body for text/speech, file name for uploads */
  value: string
  status: ContentSourceStatus
  addedAt: string
  /** Local object URL for image previews only; never persisted */
  previewUrl?: string
}

export type ContentHistoryFormat = 'Reel' | 'Carousel' | 'Static' | 'Story' | 'Video'
export type ContentHistoryStatus = 'Published' | 'Draft' | 'Scheduled'

export interface ContentHistoryItem {
  id: string
  title: string
  product?: string
  topic: string
  format: ContentHistoryFormat
  date: string
  hook?: string
  performanceLabel?: string
  engagement?: string
  status: ContentHistoryStatus
}
