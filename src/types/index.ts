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

// ---------------------------------------------------------------------------
// Inspiration, Instagram Grid, Knowledge Base approvals,
// Content Strategy, Content Flowchart
// ---------------------------------------------------------------------------

export interface InspirationPattern {
  hookPattern: string
  topic: string
  format: string
  narrativeStructure: string
  visualPattern: string
  ctaPattern: string
  contentAngle: string
}

export interface InspirationItem {
  id: string
  source: ContentSourceItem
  pattern: InspirationPattern
  notes?: string
  savedAt: string
}

export type GridSlotContentType = 'reel' | 'carousel' | 'static' | 'story' | 'empty'

export interface GridSlotDefinition {
  id: string
  position: number
  contentType: GridSlotContentType
  productRef?: string
  label?: string
}

export interface GridTemplate {
  id: string
  name: string
  description?: string
  slots: GridSlotDefinition[]
  isPreset: boolean
  createdAt: string
  updatedAt: string
}

export type ApprovalTargetType = 'product' | 'grid_template' | 'inspiration'

export interface PendingApproval {
  id: string
  targetType: ApprovalTargetType
  targetId: string
  targetLabel: string
  requestedAt: string
}

export interface ContentStrategyInput {
  goal: string
  durationWeeks: number
  postingFrequency: string
  productIds: string[]
  objective: string
}

export interface StrategyContentSlot {
  id: string
  weekLabel: string
  product: string
  contentType: GridSlotContentType
  reason: string
}

export interface ContentStrategyPlan {
  id: string
  input: ContentStrategyInput
  contentGaps: string[]
  opportunities: string[]
  sequence: StrategyContentSlot[]
  generatedAt: string
}

export type FlowNodeType = 'start' | 'analysis' | 'gap' | 'content' | 'decision' | 'end'
export type FlowNodeStatus = 'pending' | 'in_progress' | 'done' | 'blocked'
export type FlowNodePriority = 'low' | 'medium' | 'high'

export interface FlowchartNode {
  id: string
  type: FlowNodeType
  label: string
  product?: string
  date?: string
  contentType?: string
  goal?: string
  status: FlowNodeStatus
  priority?: FlowNodePriority
  reason?: string
  gridPosition?: number
  branch?: 'yes' | 'no'
}

export interface FlowchartEdge {
  from: string
  to: string
  label?: string
}

export interface ContentFlowchart {
  id: string
  strategyId: string
  nodes: FlowchartNode[]
  edges: FlowchartEdge[]
  generatedAt: string
  approvedAt?: string
}

// ---------------------------------------------------------------------------
// Script Generation, Visual Direction, B-Roll, Regeneration
// (built from an approved ContentFlowchart node; reuses HookVariation,
// DirectorScene, and ContentHistoryItem as-is — no parallel types)
// ---------------------------------------------------------------------------

export interface VisualDirectionBeat {
  sceneNumber: number
  /** WHAT to show — never camera settings (lens, angle, exposure, etc.) */
  description: string
}

export interface BRollShot {
  sceneNumber: number
  description: string
}

export interface RegenerationFeedback {
  id: string
  targetLabel: string
  feedback: string
  submittedAt: string
}

export type GeneratedContentStatus = 'draft' | 'approved' | 'saved'

export interface GeneratedContentItem {
  id: string
  flowchartNodeId: string
  strategyId: string
  topic: string
  product: string
  gridPosition?: number
  date: string
  hooks: HookVariation[]
  scenes: DirectorScene[]
  visualDirection: VisualDirectionBeat[]
  brollPlan: BRollShot[]
  onScreenText: string[]
  cta: string
  caption: string
  status: GeneratedContentStatus
  generatedAt: string
  regenerationHistory: RegenerationFeedback[]
}

// ---------------------------------------------------------------------------
// Final UI polish: configurable "viral" definition, admin settings
// ---------------------------------------------------------------------------

/**
 * What counts as "viral" for this workspace. Configurable from Admin
 * Settings rather than hardcoded, so Virality Potential scores can be tied
 * to a real, team-defined outcome instead of an arbitrary number.
 */
export interface ViralitySettings {
  /** e.g. "Organic Views" */
  metricLabel: string
  /** e.g. 50000 — the metric value that counts as "viral" */
  threshold: number
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

export type UserRole = 'admin' | 'user'

export interface AuthUser {
  username: string
  role: UserRole
}

