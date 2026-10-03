import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/ui/Icon'
import { PageContainer } from '../components/layout/PageContainer'
import { StatCard } from '../components/shared/StatCard'
import { TopScriptCard } from '../components/shared/TopScriptCard'
import { RecentScriptRow } from '../components/shared/RecentScriptRow'
import { HomeIntelCard } from '../components/shared/HomeIntelCard'
import { statCards, topScripts, recentScripts } from '../data/mockHome'
import { usePersistentState } from '../hooks/usePersistentState'
import { ApiError } from '../api/client'
import { getDashboard, type DashboardView } from '../api/dashboard'
import type { ContentFlowchart } from '../types'

function describeError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  return "Couldn't reach the server — try again in a moment."
}

export function HomePage() {
  // The one piece of planning state still read from the Plan page's own
  // persisted key — it's the real per-node approval ratio for the active
  // flowchart, which the Dashboard aggregator doesn't break out by node
  // type. Everything else below comes straight from GET /dashboard.
  const [flowchart] = usePersistentState<ContentFlowchart | null>('devyora-content-flowchart', null)

  const [dashboard, setDashboard] = useState<DashboardView | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getDashboard()
      .then((result) => {
        if (!cancelled) setDashboard(result)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(describeError(err))
      })
    return () => {
      cancelled = true
    }
  }, [])

  const contentNodes = flowchart?.nodes.filter((node) => node.type === 'content') ?? []
  const doneContentNodes = contentNodes.filter((node) => node.status === 'done')
  const contentGaps = dashboard?.contentGaps ?? []
  const opportunities = dashboard?.newOpportunities ?? []
  const instagramConnection = dashboard?.instagram ?? { status: 'not_connected' as const }
  const productIntelligenceCount = dashboard?.productIntelligence.length ?? 0

  return (
    <PageContainer className="flex flex-col space-y-space-md lg:space-y-8 py-space-md lg:py-8">
      {loadError && (
        <div className="bg-error-container rounded-lg p-2.5 flex items-start gap-2">
          <Icon name="error" className="text-error text-[16px] mt-0.5" />
          <p className="font-label-sm text-label-sm text-on-error-container">{loadError}</p>
        </div>
      )}
      <section className="flex flex-col space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-ping" />
              Q3 Telemetry Active
            </span>
          </div>
          <span className="text-label-sm font-label-sm text-on-surface-variant font-code">
            SYNCED 10m AGO
          </span>
        </div>
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile lg:text-headline-lg lg:font-headline-lg text-on-surface tracking-tight">
          Good morning, Sarah
        </h1>
        <p className="text-body-sm font-body-sm lg:text-body-lg lg:font-body-lg text-on-surface-variant leading-relaxed lg:max-w-2xl">
          Script Brain synced with 142 company scripts &amp; Q3 performance telemetry.
        </p>
      </section>

      <section className="flex flex-col lg:flex-row gap-2 lg:gap-4">
        <Link
          to="/create"
          className="w-full lg:flex-[2] relative overflow-hidden group rounded-xl lg:rounded-2xl p-3.5 lg:p-6 bg-gradient-to-r from-primary-container via-secondary-container to-tertiary-container shadow-md shadow-primary-container/20 flex items-center justify-between text-on-primary transition-transform active:scale-[0.98] lg:hover:shadow-lg"
        >
          <div className="flex items-center space-x-2.5 lg:space-x-4 z-10">
            <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-surface-container-lowest/20 flex items-center justify-center backdrop-blur-sm">
              <Icon name="auto_awesome" className="text-[18px] lg:text-[24px]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-title text-title lg:text-headline-sm lg:font-headline-sm leading-tight">
                Create New Script
              </span>
              <span className="font-label-sm text-[10px] lg:text-body-sm lg:font-body-sm opacity-80">
                Full telemetry-guided hook synthesis
              </span>
            </div>
          </div>
          <Icon
            name="arrow_forward"
            className="text-[20px] lg:text-[26px] opacity-80 group-hover:translate-x-0.5 transition-transform z-10"
          />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 lg:w-40 lg:h-40 bg-surface-container-lowest/10 rounded-full blur-xl pointer-events-none" />
        </Link>

        <div className="grid grid-cols-2 lg:flex-1 gap-2 lg:gap-4">
          <button className="bg-surface-container-lowest rounded-xl p-3 lg:p-4 shadow-sm flex items-center space-x-2 lg:space-x-3 text-left active:bg-surface-container-low lg:hover:bg-surface-container-low transition-colors">
            <div className="w-7 h-7 lg:w-9 lg:h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
              <Icon name="bolt" className="text-[16px] lg:text-[18px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm lg:text-body-sm lg:font-body-sm lg:font-semibold text-on-surface truncate">
                Improve Script
              </span>
              <span className="text-[10px] text-on-surface-variant truncate">
                Upload URL / Draft
              </span>
            </div>
          </button>
          <button className="bg-surface-container-lowest rounded-xl p-3 lg:p-4 shadow-sm flex items-center space-x-2 lg:space-x-3 text-left active:bg-surface-container-low lg:hover:bg-surface-container-low transition-colors">
            <div className="w-7 h-7 lg:w-9 lg:h-9 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary shrink-0">
              <Icon name="psychology_alt" className="text-[16px] lg:text-[18px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm lg:text-body-sm lg:font-body-sm lg:font-semibold text-on-surface truncate">
                Generate 10 Angles
              </span>
              <span className="text-[10px] text-on-surface-variant truncate">
                Curiosity booster
              </span>
            </div>
          </button>
        </div>
      </section>

      <section className="flex flex-col space-y-2.5 lg:space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="hub" className="text-[18px] text-primary" />
          <h2 className="font-title text-title lg:text-headline-sm lg:font-headline-sm text-on-surface">
            Content Intelligence
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 lg:gap-4">
          <HomeIntelCard
            icon="photo_camera"
            label="Instagram"
            value={
              instagramConnection.status === 'connected'
                ? (instagramConnection.handle ?? 'Connected')
                : 'Not connected'
            }
            detail={
              instagramConnection.status === 'connected'
                ? `${instagramConnection.followers?.toLocaleString() ?? '—'} followers`
                : 'Connect to see analytics'
            }
            tone={instagramConnection.status === 'connected' ? 'positive' : 'muted'}
            to="/hub?tab=instagram"
          />
          <HomeIntelCard
            icon="account_tree"
            label="Content Flow"
            value={flowchart ? `${doneContentNodes.length}/${contentNodes.length} done` : 'No plan yet'}
            detail={
              flowchart
                ? flowchart.approvedAt
                  ? 'Plan approved'
                  : 'Awaiting approval'
                : 'Build a content strategy first'
            }
            tone={flowchart?.approvedAt ? 'positive' : flowchart ? 'attention' : 'muted'}
            to={flowchart ? '/plan?tab=flowchart' : '/plan'}
          />
          <HomeIntelCard
            icon="troubleshoot"
            label="Content Gaps"
            value={contentGaps.length > 0 ? `${contentGaps.length} identified` : '—'}
            detail={contentGaps[0]?.description ?? 'No content gaps detected right now'}
            tone={contentGaps.length > 0 ? 'attention' : 'muted'}
            to="/plan"
          />
          <HomeIntelCard
            icon="lightbulb"
            label="New Opportunities"
            value={opportunities.length > 0 ? `${opportunities.length} found` : '—'}
            detail={opportunities[0]?.description ?? 'No new opportunities detected right now'}
            tone={opportunities.length > 0 ? 'positive' : 'muted'}
            to="/plan"
          />
          <HomeIntelCard
            icon="inventory_2"
            label="Product Intelligence"
            value={String(productIntelligenceCount)}
            detail={productIntelligenceCount === 1 ? 'product tracked' : 'products tracked'}
            to="/hub?tab=products"
          />
        </div>
      </section>

      <section className="flex flex-col space-y-2.5 lg:space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="query_stats" className="text-[18px] text-on-surface-variant" />
          <h2 className="font-title text-title lg:text-headline-sm lg:font-headline-sm text-on-surface">
            Script Performance
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-4">
          {statCards.map((stat) => (
            <StatCard key={stat.id} {...stat} />
          ))}
        </div>
      </section>

      <section className="bg-surface-container-low rounded-xl p-3.5 lg:p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-start space-x-3 lg:space-x-4">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-tertiary-container text-on-tertiary flex items-center justify-center shrink-0 mt-0.5">
            <Icon name="neurology" className="text-[18px] lg:text-[20px]" />
          </div>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-tertiary font-semibold uppercase tracking-wider">
                Live Neural Pulse
              </span>
              <span className="font-code text-[10px] text-on-surface-variant">Auto-applied</span>
            </div>
            <p className="font-body-sm text-body-sm lg:text-body-md lg:font-body-md text-on-surface leading-snug">
              <strong className="font-semibold text-on-surface">Drop Alert:</strong> 3s retention
              drops precipitously when technical jargon appears before second 2.4. Permanent
              rulebook updated.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col space-y-2.5 lg:space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="local_fire_department" className="text-[18px] text-primary" />
            <h2 className="font-title text-title lg:text-headline-sm lg:font-headline-sm text-on-surface">
              Top Performing Scripts
            </h2>
          </div>
          <Link to="/library" className="text-label-sm font-label-sm text-primary font-medium">
            Telemetry view
          </Link>
        </div>
        <div className="flex lg:grid lg:grid-cols-3 space-x-3 lg:space-x-0 lg:gap-4 overflow-x-auto lg:overflow-visible pb-1 -mx-gutter-mobile px-gutter-mobile lg:mx-0 lg:px-0 snap-x scrollbar-none">
          {topScripts.map((script) => (
            <TopScriptCard key={script.id} script={script} />
          ))}
        </div>
      </section>

      <section className="flex flex-col space-y-2.5 lg:space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="pending_actions" className="text-[18px] text-on-surface-variant" />
            <h2 className="font-title text-title lg:text-headline-sm lg:font-headline-sm text-on-surface">
              Recent Scripts in Production
            </h2>
          </div>
          <Link to="/library" className="text-label-sm font-label-sm text-primary font-medium">
            All (14)
          </Link>
        </div>
        <div className="space-y-2 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-3">
          {recentScripts.map((script) => (
            <RecentScriptRow key={script.id} script={script} />
          ))}
        </div>
      </section>
    </PageContainer>
  )
}
