import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '../components/ui/Icon'
import { PageContainer } from '../components/layout/PageContainer'
import { ReadinessChecklist } from '../components/shared/planning/ReadinessChecklist'
import { ContentStrategyForm } from '../components/shared/planning/ContentStrategyForm'
import { StrategyResultSummary } from '../components/shared/planning/StrategyResultSummary'
import { ContentFlowchart } from '../components/shared/planning/ContentFlowchart'
import { usePersistentState } from '../hooks/usePersistentState'
import { ApiError } from '../api/client'
import { listProducts } from '../api/products'
import { getInstagramStatus } from '../api/instagram'
import { listContentHistory } from '../api/history'
import { listInspiration } from '../api/inspiration'
import { listGridTemplates, getActiveGridTemplate } from '../api/grid'
import { createStrategy, type CreateStrategyRequest } from '../api/strategy'
import { generateFlowchart, updateFlowchartNode, approveFlowchart } from '../api/flowchart'
import type {
  ProductKnowledge,
  InstagramConnection,
  ContentHistoryItem,
  InspirationItem,
  GridTemplate,
  ContentStrategyInput,
  ContentStrategyPlan,
  ContentFlowchart as ContentFlowchartType,
} from '../types'

type PlanTab = 'strategy' | 'flowchart'

function describeError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  return "Couldn't reach the server — try again in a moment."
}

function toCreateStrategyRequest(input: ContentStrategyInput, gridTemplateId: string | null): CreateStrategyRequest {
  return {
    goal: input.goal,
    objective: input.objective || undefined,
    durationWeeks: input.durationWeeks,
    postingFrequency: input.postingFrequency,
    productIds: input.productIds,
    gridTemplateId: gridTemplateId ?? undefined,
  }
}

export function PlanPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab: PlanTab = searchParams.get('tab') === 'flowchart' ? 'flowchart' : 'strategy'
  const [activeTab, setActiveTab] = useState<PlanTab>(initialTab)
  const changeTab = (tab: PlanTab) => {
    setActiveTab(tab)
    setSearchParams(tab === 'strategy' ? {} : { tab })
  }

  const [products, setProducts] = useState<ProductKnowledge[]>([])
  const [instagramConnection, setInstagramConnection] = useState<InstagramConnection>({ status: 'not_connected' })
  const [history, setHistory] = useState<ContentHistoryItem[]>([])
  const [inspirationItems, setInspirationItems] = useState<InspirationItem[]>([])
  const [gridTemplates, setGridTemplates] = useState<GridTemplate[]>([])
  const [activeGridId, setActiveGridId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setLoadError(null)
      try {
        const [productsResult, instagramResult, historyResult, inspirationResult, gridResult, activeGridResult] =
          await Promise.all([
            listProducts(),
            getInstagramStatus(),
            listContentHistory(),
            listInspiration(),
            listGridTemplates(),
            getActiveGridTemplate(),
          ])
        if (cancelled) return
        setProducts(productsResult)
        setInstagramConnection(instagramResult)
        setHistory(historyResult)
        setInspirationItems(inspirationResult)
        setGridTemplates(gridResult)
        setActiveGridId(activeGridResult?.id ?? null)
      } catch (err) {
        if (!cancelled) setLoadError(describeError(err))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const activeGrid = gridTemplates.find((template) => template.id === activeGridId) ?? null

  // Shared with ScriptGenerationPage/HomePage via the same persisted keys
  // — Plan is where these records are produced, so this is the one place
  // that writes them, not a second parallel store.
  const [strategyPlan, setStrategyPlan] = usePersistentState<ContentStrategyPlan | null>(
    'devyora-content-strategy',
    null,
  )
  const [flowchart, setFlowchart] = usePersistentState<ContentFlowchartType | null>(
    'devyora-content-flowchart',
    null,
  )
  const [generationIdByNode] = usePersistentState<Record<string, string>>('devyora-generation-ids', {})
  const generatedNodeIds = new Set(Object.keys(generationIdByNode))
  const [isGenerating, setIsGenerating] = useState(false)
  const [isBuildingFlow, setIsBuildingFlow] = useState(false)

  const readinessItems = [
    { label: 'Product Knowledge', ready: products.length > 0 },
    { label: 'Account Analysis', ready: instagramConnection.status === 'connected' },
    { label: 'Historical Content', ready: history.length > 0 },
    { label: 'Inspiration', ready: inspirationItems.length > 0 },
    { label: 'Grid Selected', ready: activeGrid !== null },
  ]

  const handleGenerateStrategy = async (input: ContentStrategyInput) => {
    setActionError(null)
    setIsGenerating(true)
    try {
      const plan = await createStrategy(toCreateStrategyRequest(input, activeGridId))
      setStrategyPlan(plan)
      setFlowchart(null)
    } catch (err) {
      setActionError(describeError(err))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleBuildFlowchart = async () => {
    if (!strategyPlan) return
    setActionError(null)
    setIsBuildingFlow(true)
    try {
      setFlowchart(await generateFlowchart(strategyPlan.id))
    } catch (err) {
      setActionError(describeError(err))
    } finally {
      setIsBuildingFlow(false)
    }
  }

  /**
   * There's no in-place "regenerate" on the backend — a flowchart is
   * immutable once generated for a strategy. Regenerating means creating
   * a fresh strategy from the same input (re-run against current real
   * data) and a fresh flowchart for it, rather than mutating either.
   */
  const handleRegenerateAll = async () => {
    if (!strategyPlan) return
    setActionError(null)
    try {
      const plan = await createStrategy(toCreateStrategyRequest(strategyPlan.input, activeGridId))
      const nextFlowchart = await generateFlowchart(plan.id)
      setStrategyPlan(plan)
      setFlowchart(nextFlowchart)
    } catch (err) {
      setActionError(describeError(err))
    }
  }

  const handleApproveNode = async (nodeId: string) => {
    if (!flowchart) return
    setActionError(null)
    try {
      setFlowchart(await updateFlowchartNode(flowchart.id, nodeId, { status: 'done' }))
    } catch (err) {
      setActionError(describeError(err))
    }
  }

  const handleApprovePlan = async () => {
    if (!flowchart) return
    setActionError(null)
    try {
      setFlowchart(await approveFlowchart(flowchart.id))
    } catch (err) {
      setActionError(describeError(err))
    }
  }

  return (
    <PageContainer className="flex flex-col py-space-md lg:py-8 lg:max-w-3xl">
      <div className="pt-space-xs pb-space-xs flex flex-col gap-space-xs">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile lg:text-headline-lg lg:font-headline-lg text-on-surface tracking-tight">
          Plan
        </h1>
        <p className="font-body-sm text-body-sm lg:text-body-md lg:font-body-md text-on-surface-variant">
          Turn everything in your Content Hub into a content strategy, then a visual flowchart.
        </p>
      </div>

      {loadError && (
        <div className="bg-error-container rounded-lg p-2.5 flex items-start gap-2">
          <Icon name="error" className="text-error text-[16px] mt-0.5" />
          <p className="font-label-sm text-label-sm text-on-error-container">{loadError}</p>
        </div>
      )}
      {actionError && (
        <div className="bg-error-container rounded-lg p-2.5 flex items-start gap-2">
          <Icon name="error" className="text-error text-[16px] mt-0.5" />
          <p className="font-label-sm text-label-sm text-on-error-container">{actionError}</p>
        </div>
      )}

      <div className="grid grid-cols-2 p-1 rounded-xl bg-surface-container-high font-label-md text-label-md select-none mt-space-sm lg:mt-6">
        <button
          onClick={() => changeTab('strategy')}
          className={`py-2 text-center rounded-lg transition-all ${
            activeTab === 'strategy'
              ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Strategy
        </button>
        <button
          onClick={() => changeTab('flowchart')}
          className={`py-2 text-center rounded-lg transition-all ${
            activeTab === 'flowchart'
              ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Flowchart
        </button>
      </div>

      {isLoading ? (
        <div className="mt-space-md font-body-sm text-body-sm text-on-surface-variant">Loading…</div>
      ) : (
        <div className="mt-space-md flex flex-col gap-space-md">
          {activeTab === 'strategy' && (
            <>
              <ReadinessChecklist items={readinessItems} />
              {products.length === 0 ? (
                <div className="rounded-xl bg-surface-container-low p-space-md text-center flex flex-col items-center gap-2">
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Add at least one product in the Content Hub before generating a strategy.
                  </p>
                  <Link
                    to="/hub?tab=products"
                    className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold"
                  >
                    Go to Content Hub
                  </Link>
                </div>
              ) : (
                <ContentStrategyForm
                  products={products}
                  onGenerate={handleGenerateStrategy}
                  isGenerating={isGenerating}
                />
              )}

              {strategyPlan && <StrategyResultSummary plan={strategyPlan} />}

              {strategyPlan && (
                <button
                  type="button"
                  onClick={() => changeTab('flowchart')}
                  className="w-full py-3 px-4 rounded-xl bg-surface-container-high text-primary font-title text-[14px] flex items-center justify-center gap-2"
                >
                  <Icon name="account_tree" className="text-[18px]" />
                  <span>Continue to Flowchart</span>
                </button>
              )}
            </>
          )}

          {activeTab === 'flowchart' &&
            (!strategyPlan ? (
              <div className="rounded-xl bg-surface-container-low p-space-md text-center flex flex-col items-center gap-2">
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Generate a Content Strategy first — the flowchart is built from its output.
                </p>
                <button
                  type="button"
                  onClick={() => changeTab('strategy')}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold"
                >
                  Go to Strategy
                </button>
              </div>
            ) : !flowchart ? (
              <button
                type="button"
                onClick={handleBuildFlowchart}
                disabled={isBuildingFlow}
                className="w-full py-3.5 px-4 rounded-xl bg-tertiary-container text-on-tertiary font-title text-title flex items-center justify-center gap-2 shadow-lg shadow-tertiary-container/25 active:scale-[0.99] transition-transform disabled:opacity-50"
              >
                <Icon
                  name="account_tree"
                  className={`text-[20px] ${isBuildingFlow ? 'animate-spin' : ''}`}
                />
                <span>{isBuildingFlow ? 'Building Flow…' : '✨ Generate Content Flowchart'}</span>
              </button>
            ) : (
              <ContentFlowchart
                flowchart={flowchart}
                onChange={setFlowchart}
                onRegenerateAll={handleRegenerateAll}
                onApprovePlan={handleApprovePlan}
                onApproveNode={handleApproveNode}
                generatedNodeIds={generatedNodeIds}
              />
            ))}
        </div>
      )}
    </PageContainer>
  )
}
