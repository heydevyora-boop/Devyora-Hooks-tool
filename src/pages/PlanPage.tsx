import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '../components/ui/Icon'
import { PageContainer } from '../components/layout/PageContainer'
import { ReadinessChecklist } from '../components/shared/planning/ReadinessChecklist'
import { ContentStrategyForm } from '../components/shared/planning/ContentStrategyForm'
import { StrategyResultSummary } from '../components/shared/planning/StrategyResultSummary'
import { ContentFlowchart } from '../components/shared/planning/ContentFlowchart'
import { generateContentStrategy } from '../components/shared/planning/generateStrategy'
import { generateContentFlowchart } from '../components/shared/planning/generateFlowchart'
import { usePersistentState } from '../hooks/usePersistentState'
import { seedProducts, initialInstagramConnection, seedContentHistory } from '../data/mockKnowledge'
import { presetGridTemplates } from '../data/mockGrid'
import type {
  ProductKnowledge,
  ContentHistoryItem,
  InspirationItem,
  GridTemplate,
  ContentStrategyInput,
  ContentStrategyPlan,
  ContentFlowchart as ContentFlowchartType,
} from '../types'

type PlanTab = 'strategy' | 'flowchart'

export function PlanPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab: PlanTab = searchParams.get('tab') === 'flowchart' ? 'flowchart' : 'strategy'
  const [activeTab, setActiveTab] = useState<PlanTab>(initialTab)
  const changeTab = (tab: PlanTab) => {
    setActiveTab(tab)
    setSearchParams(tab === 'strategy' ? {} : { tab })
  }

  const [products] = usePersistentState<ProductKnowledge[]>('devyora-products', seedProducts)
  const [instagramConnection] = usePersistentState(
    'devyora-instagram-connection',
    initialInstagramConnection,
  )
  const [history] = usePersistentState<ContentHistoryItem[]>(
    'devyora-content-history',
    seedContentHistory,
  )
  const [inspirationItems] = usePersistentState<InspirationItem[]>('devyora-inspiration-items', [])
  const [gridTemplates] = usePersistentState<GridTemplate[]>(
    'devyora-grid-templates',
    presetGridTemplates,
  )
  const [activeGridId] = usePersistentState<string | null>('devyora-active-grid-id', null)
  const activeGrid = gridTemplates.find((template) => template.id === activeGridId) ?? null

  const [strategyPlan, setStrategyPlan] = usePersistentState<ContentStrategyPlan | null>(
    'devyora-content-strategy',
    null,
  )
  const [flowchart, setFlowchart] = usePersistentState<ContentFlowchartType | null>(
    'devyora-content-flowchart',
    null,
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [isBuildingFlow, setIsBuildingFlow] = useState(false)

  const readinessItems = [
    { label: 'Product Knowledge', ready: products.length > 0 },
    { label: 'Account Analysis', ready: instagramConnection.status === 'connected' },
    { label: 'Historical Content', ready: history.length > 0 },
    { label: 'Inspiration', ready: inspirationItems.length > 0 },
    { label: 'Grid Selected', ready: activeGrid !== null },
  ]

  const handleGenerateStrategy = (input: ContentStrategyInput, startOffset = 0) => {
    setIsGenerating(true)
    setTimeout(() => {
      const plan = generateContentStrategy(input, products, history, activeGrid, startOffset)
      setStrategyPlan(plan)
      setFlowchart(null)
      setIsGenerating(false)
    }, 900)
  }

  const handleBuildFlowchart = () => {
    if (!strategyPlan) return
    setIsBuildingFlow(true)
    setTimeout(() => {
      setFlowchart(generateContentFlowchart(strategyPlan))
      setIsBuildingFlow(false)
    }, 700)
  }

  const handleRegenerateAll = () => {
    if (!strategyPlan) return
    const plan = generateContentStrategy(
      strategyPlan.input,
      products,
      history,
      activeGrid,
      Math.floor(Math.random() * 7),
    )
    setStrategyPlan(plan)
    setFlowchart(generateContentFlowchart(plan))
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
              onApprovePlan={() =>
                setFlowchart({ ...flowchart, approvedAt: new Date().toISOString() })
              }
            />
          ))}
      </div>
    </PageContainer>
  )
}
