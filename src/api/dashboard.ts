import { api } from './client'
import type { ContentHistoryItem, InstagramConnection } from '../types'
import type { GeneratedContentView } from './generation'
import type { TrendOrOpportunity } from './trends'
import type { CalendarEntryView } from './calendar'

export interface ContentHealth {
  type: 'calculated'
  overallScore: number | null
  postingConsistency: { score: number | null; postsLast30Days: number; averageGapDays: number | null }
  productCoverage: { totalProducts: number; productsWithContent: number; coveragePercent: number | null }
  contentFrequency: { postsLast30Days: number; postsPerWeek: number }
  contentTypeDistribution: Record<string, number>
  historicalPerformance: { averageViews: number | null; averageEngagementRate: number | null; averageHoldRate3s: number | null; snapshotCount: number }
  strategyCompletion: { activeStrategies: number; totalSlots: number; completedSlots: number; completionPercent: number | null }
  plannedVsPublished: { planned: number; published: number; publishedPercent: number | null }
}

export interface DashboardView {
  instagram: InstagramConnection
  contentHealth: ContentHealth
  currentContent: { recentlyPublished: ContentHistoryItem[]; inProgress: GeneratedContentView[] }
  contentGaps: TrendOrOpportunity[]
  emergingTrends: TrendOrOpportunity[]
  newOpportunities: TrendOrOpportunity[]
  productsDue: { productId: string; productName: string; reason: string }[]
  contentFlow: { nodeStatusCounts: Record<string, number>; nextUp: { id: string; label: string; product?: string; status: string; gridPosition?: number }[] }
  contentCalendar: CalendarEntryView[]
  productIntelligence: { productId: string; productName: string; contentCount: number; lastUsedDate: string | null; hasOpenGap: boolean }[]
}

export function getDashboard(): Promise<DashboardView> {
  return api.get<{ dashboard: DashboardView }>('/dashboard').then((r) => r.dashboard)
}
