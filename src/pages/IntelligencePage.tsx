import { useState } from 'react'
import { Icon } from '../components/ui/Icon'
import { PageContainer } from '../components/layout/PageContainer'
import { KnowledgeModuleCard } from '../components/shared/KnowledgeModuleCard'
import { MicroModuleCard } from '../components/shared/MicroModuleCard'
import { RulebookCard } from '../components/shared/RulebookCard'
import { RetentionCurveChart } from '../components/shared/RetentionCurveChart'
import { KnowledgeSourceTile } from '../components/shared/knowledge/KnowledgeSourceTile'
import { PendingApprovalsPanel } from '../components/shared/knowledge/PendingApprovalsPanel'
import { usePersistentState } from '../hooks/usePersistentState'
import { seedProducts, seedContentHistory } from '../data/mockKnowledge'
import { presetGridTemplates } from '../data/mockGrid'
import {
  intelligenceCategories,
  knowledgeModules,
  microModules,
  rulebookEntries,
} from '../data/mockIntelligence'
import type {
  ProductKnowledge,
  ContentHistoryItem,
  InspirationItem,
  GridTemplate,
  PendingApproval,
} from '../types'

export function IntelligencePage() {
  const [activeCategory, setActiveCategory] = useState('knowledge-base')

  // Read the same persisted keys Content Hub writes to, so this vault
  // reflects real counts instead of a second, divergent copy of the data.
  const [products, setProducts] = usePersistentState<ProductKnowledge[]>(
    'devyora-products',
    seedProducts,
  )
  const [history] = usePersistentState<ContentHistoryItem[]>(
    'devyora-content-history',
    seedContentHistory,
  )
  const [inspirationItems, setInspirationItems] = usePersistentState<InspirationItem[]>(
    'devyora-inspiration-items',
    [],
  )
  const [gridTemplates, setGridTemplates] = usePersistentState<GridTemplate[]>(
    'devyora-grid-templates',
    presetGridTemplates,
  )
  const [pendingApprovals, setPendingApprovals] = usePersistentState<PendingApproval[]>(
    'devyora-pending-approvals',
    [],
  )

  const handleApprove = (approval: PendingApproval) => {
    if (approval.targetType === 'product') {
      setProducts((prev) => prev.filter((item) => item.id !== approval.targetId))
    } else if (approval.targetType === 'grid_template') {
      setGridTemplates((prev) => prev.filter((item) => item.id !== approval.targetId))
    } else if (approval.targetType === 'inspiration') {
      setInspirationItems((prev) => prev.filter((item) => item.id !== approval.targetId))
    }
    setPendingApprovals((prev) => prev.filter((item) => item.id !== approval.id))
  }

  const handleReject = (approval: PendingApproval) => {
    setPendingApprovals((prev) => prev.filter((item) => item.id !== approval.id))
  }

  return (
    <PageContainer className="flex flex-col py-space-md lg:py-8">
      <div className="pt-space-xs pb-space-xs flex flex-col gap-space-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse" />
            <span className="font-code text-label-sm text-tertiary uppercase tracking-wider">
              Cognitive Matrix
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface">
            <Icon name="neurology" className="text-[14px] text-primary" filled />
            <span className="font-code text-label-sm">18 Active Models • 100% Calibrated</span>
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile lg:text-headline-lg lg:font-headline-lg text-on-surface tracking-tight">
            The Neural Brain
          </h1>
          <p className="font-body-sm text-body-sm lg:text-body-md lg:font-body-md text-on-surface-variant">
            Autonomous script synthesis memory, anti-patterns &amp; brand telemetry.
          </p>
        </div>
      </div>

      <div className="w-full overflow-x-auto no-scrollbar py-space-xs -mx-gutter-mobile px-gutter-mobile lg:mx-0 lg:px-0">
        <div className="flex items-center gap-space-xs whitespace-nowrap min-w-max">
          {intelligenceCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md flex items-center gap-1.5 transition-colors ${
                activeCategory === category.id
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant lg:hover:bg-surface-container'
              }`}
            >
              <Icon name={category.icon} className="text-[16px]" />
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-space-sm lg:mt-6 flex flex-col gap-space-lg lg:gap-10">
        <section className="flex flex-col gap-space-sm lg:gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <Icon name="folder_supervised" className="text-[18px] text-primary" />
              <h2 className="font-title text-title lg:text-headline-sm lg:font-headline-sm text-on-surface">
                Knowledge Base Vault
              </h2>
            </div>
            <span className="font-code text-label-sm text-on-surface-variant">
              9 Modules Active
            </span>
          </div>

          <PendingApprovalsPanel
            approvals={pendingApprovals}
            onApprove={handleApprove}
            onReject={handleReject}
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <KnowledgeSourceTile
              icon="inventory_2"
              label="Products"
              count={products.length}
              to="/hub?tab=products"
            />
            <KnowledgeSourceTile
              icon="history"
              label="Content History"
              count={history.length}
              to="/hub?tab=history"
            />
            <KnowledgeSourceTile
              icon="grid_view"
              label="Grid Structures"
              count={gridTemplates.length}
              to="/hub?tab=grid"
            />
            <KnowledgeSourceTile
              icon="auto_awesome"
              label="Inspiration Patterns"
              count={inspirationItems.length}
              to="/hub?tab=inspiration"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 lg:gap-3.5">
            {knowledgeModules.slice(0, 5).map((module) => (
              <KnowledgeModuleCard key={module.id} module={module} />
            ))}

            <div className="grid grid-cols-2 gap-2.5 lg:gap-3.5">
              {microModules.map((module) => (
                <MicroModuleCard
                  key={module.id}
                  icon={module.icon}
                  iconColorClass={module.iconColorClass}
                  title={module.title}
                  description={module.description}
                  meta={module.meta}
                  metaColorClass={module.metaColorClass}
                />
              ))}
            </div>

            <KnowledgeModuleCard module={knowledgeModules[5]} />
          </div>
        </section>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <section className="flex flex-col gap-space-sm lg:gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <Icon name="rule" className="text-[18px] text-primary" />
              <h2 className="font-title text-title lg:text-headline-sm lg:font-headline-sm text-on-surface">
                Permanent Rulebook
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-code text-label-sm">
              4 Locked Rules
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 lg:gap-3.5">
            {rulebookEntries.map((rule) => (
              <RulebookCard key={rule.id} rule={rule} />
            ))}
          </div>
        </section>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <section className="flex flex-col gap-space-sm lg:gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <Icon name="troubleshoot" className="text-[18px] text-tertiary" />
              <h2 className="font-title text-title lg:text-headline-sm lg:font-headline-sm text-on-surface">
                Failure Analysis Engine
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-code text-label-sm">
              Self-Correcting
            </span>
          </div>
          <div className="p-4 lg:p-6 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-3 lg:max-w-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-error animate-ping" />
                <span className="font-code text-label-sm text-error font-medium">
                  Incident #89 Self-Correction
                </span>
              </div>
              <span className="font-code text-[11px] text-on-surface-variant">2h ago</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface">
              Script #89 underperformed because product demo was shown without establishing pain
              point first. Auto-guardrail applied to generator prompts.
            </p>
            <RetentionCurveChart />
            <div className="flex items-center gap-2 pt-1">
              <Icon name="auto_mode" className="text-[16px] text-primary" />
              <span className="font-code text-label-sm text-primary">
                Rule patch v4.8 deployed across all active nodes
              </span>
            </div>
          </div>
        </section>

        <section className="flex flex-col lg:flex-row gap-2.5 lg:gap-3 pt-space-xs pb-space-lg lg:pb-2 lg:max-w-2xl">
          <button className="w-full lg:flex-1 py-3 px-4 rounded-xl bg-primary text-on-primary font-title text-[14px] flex items-center justify-center gap-2 shadow-md lg:hover:bg-primary/90 transition-colors">
            <Icon name="mic" className="text-[18px]" />
            <span>Sync New Customer Call Recording</span>
          </button>
          <button className="w-full lg:flex-1 py-3 px-4 rounded-xl bg-surface-container-high text-on-surface font-title text-[14px] flex items-center justify-center gap-2 lg:hover:bg-surface-container-highest transition-colors">
            <Icon name="edit_note" className="text-[18px]" />
            <span>Update Rulebook</span>
          </button>
          <button className="w-full lg:flex-1 py-3 px-4 rounded-xl bg-surface-container text-primary font-title text-[14px] flex items-center justify-center gap-2 lg:hover:bg-surface-container-high transition-colors">
            <Icon name="offline_bolt" className="text-[18px]" />
            <span>Run Intelligence Audit</span>
          </button>
        </section>
      </div>
    </PageContainer>
  )
}
