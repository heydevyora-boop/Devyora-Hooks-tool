import type { StatCardData, TopScript, RecentScript } from '../types'

export const statCards: StatCardData[] = [
  {
    id: 'synthesized',
    label: 'Scripts Synthesized',
    value: '142',
    icon: 'description',
    iconColorClass: 'text-on-surface-variant',
    trendValue: '+18%',
    trendValueColorClass: 'text-emerald-600',
    trendCaption: 'MoM volume',
  },
  {
    id: 'retention',
    label: 'Avg 3s Retention',
    value: '72.4%',
    icon: 'query_stats',
    iconColorClass: 'text-tertiary',
    trendValue: 'Top 5%',
    trendValueColorClass: 'text-tertiary',
    trendCaption: 'creator cohort',
  },
  {
    id: 'active-hooks',
    label: 'Active Hooks',
    value: '38',
    icon: 'dynamic_feed',
    iconColorClass: 'text-primary',
    trendCaption: 'In current rotation',
    showDot: true,
  },
  {
    id: 'this-week',
    label: 'This Week',
    value: '14',
    icon: 'calendar_today',
    iconColorClass: 'text-on-surface-variant',
    trendValue: '+4 awaiting',
    trendValueColorClass: 'text-primary font-medium',
    trendCaption: 'QA signoff',
  },
]

export const topScripts: TopScript[] = [
  {
    id: 'top-1',
    format: 'REEL • 1.4M VIEWS',
    views: '1.4M',
    iq: 94,
    title: '5 AI Architecture Flaws Costing Millions',
    hookHold: '88.2%',
    tags: ['#ProblemSolution', '#FounderPOV'],
    badgeColorClass: 'text-primary',
  },
  {
    id: 'top-2',
    format: 'SHORTS • 890K VIEWS',
    views: '890K',
    iq: 91,
    title: 'Why We Fired Our SaaS Growth Agency',
    hookHold: '81.6%',
    tags: ['#Storytelling', '#AgencyRealTalk'],
    badgeColorClass: 'text-secondary',
  },
]

export const recentScripts: RecentScript[] = [
  {
    id: 'recent-1',
    title: 'GRC Automation vs Manual Audits',
    status: 'Draft',
    statusNote: 'Ready for review',
    icon: 'edit_note',
    iconColorClass: 'bg-surface-container text-primary',
    score: 86,
    scoreColorClass: 'text-on-surface',
  },
  {
    id: 'recent-2',
    title: 'Zero-Trust for Fintech Founders',
    status: 'Exported',
    statusNote: 'TXT / PDF Telemetry',
    icon: 'file_download_done',
    iconColorClass: 'bg-tertiary-fixed text-tertiary',
    score: 93,
    scoreColorClass: 'text-emerald-700',
  },
]
