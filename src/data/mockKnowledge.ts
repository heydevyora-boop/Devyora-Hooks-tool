import type { ProductKnowledge, InstagramConnection, ContentHistoryItem } from '../types'

export const seedProducts: ProductKnowledge[] = [
  {
    id: 'product-trustengine',
    name: 'Devyora TrustEngine v2',
    description:
      'Continuous SOC2 compliance automation that maps AWS, GCP, and GitHub to controls and collects audit evidence daily.',
    features: ['1-click cloud sync', 'Continuous evidence collection', 'Auditor-ready exports'],
    benefits: ['Cuts SOC2 prep from months to weeks', 'Removes manual evidence hunting'],
    applications: ['Enterprise sales readiness', 'Series A/B fundraising diligence'],
    sellingPoints: ['9.8x ROAS on top-performing scripts', 'Zero-Knowledge verification'],
    targetAudience: 'Series A/B CTOs & SecOps Leads',
    limitations: ['Requires AWS/GCP/GitHub admin access to auto-map controls'],
    contentAngles: ['Contrarian Callout', 'Fear of Audit Failure', 'Proof Framework'],
    createdAt: '2026-07-01T09:00:00.000Z',
    updatedAt: '2026-08-14T10:30:00.000Z',
  },
]

/**
 * Instagram is NOT connected by default — no live or fabricated account data
 * is shown until the user actually goes through the connect flow. This
 * mirrors "do not fake live data" from the product requirements.
 */
export const initialInstagramConnection: InstagramConnection = {
  status: 'not_connected',
}

export const seedContentHistory: ContentHistoryItem[] = [
  {
    id: 'hist-1',
    title: '5 SOC2 Mistakes That Kill Enterprise Deals',
    product: 'Devyora TrustEngine v2',
    topic: 'SOC2 audit failure points',
    format: 'Reel',
    date: '2026-08-12',
    hook: 'Most CTOs think SOC2 is a security check...',
    performanceLabel: 'IQ 94/100',
    engagement: '1.2M views · 8.4k shares',
    status: 'Published',
  },
  {
    id: 'hist-2',
    title: 'GRC Cracks: Why Manual Audits Fail Fast',
    product: 'Devyora TrustEngine v2',
    topic: 'Manual audit inefficiency',
    format: 'Reel',
    date: '2026-08-27',
    hook: 'The 3-second code review trick...',
    performanceLabel: 'IQ 91/100',
    engagement: '850k views · A+ algo score',
    status: 'Published',
  },
  {
    id: 'hist-3',
    title: 'Zero-Trust for Fintech Founders',
    product: 'Devyora TrustEngine v2',
    topic: 'Zero-trust architecture',
    format: 'Static',
    date: '2026-08-18',
    hook: 'Stop paying $50k for compliance...',
    performanceLabel: 'IQ 93/100',
    engagement: 'Exported · TXT/PDF telemetry',
    status: 'Published',
  },
  {
    id: 'hist-4',
    title: 'Why We Fired Our SaaS Growth Agency',
    product: 'Founder POV Series',
    topic: 'Agency vs in-house growth',
    format: 'Reel',
    date: '2026-08-15',
    hook: 'If you are preparing for SOC2 on Google Sheets...',
    performanceLabel: 'IQ 91/100',
    engagement: '890k views · 81.6% hold',
    status: 'Published',
  },
  {
    id: 'hist-5',
    title: 'Why We Replaced Our Internal Security Team',
    product: 'Founder POV Series',
    topic: 'In-house vs automated compliance',
    format: 'Carousel',
    date: '2026-08-25',
    hook: 'Do not buy an AI agent until your compliance team signs off...',
    performanceLabel: 'IQ 62/100',
    engagement: '42k lifetime views · severe cliff',
    status: 'Draft',
  },
  {
    id: 'hist-6',
    title: '5 AI Architecture Flaws Costing Millions',
    product: 'Devyora TrustEngine v2',
    topic: 'AI architecture risk',
    format: 'Reel',
    date: '2026-09-03',
    hook: 'Most CTOs think SOC2 is a security check...',
    performanceLabel: 'IQ 94/100',
    engagement: '1.4M views · 88.2% hold',
    status: 'Scheduled',
  },
]
