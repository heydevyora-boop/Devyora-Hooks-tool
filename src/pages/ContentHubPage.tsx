import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Icon } from '../components/ui/Icon'
import { PageContainer } from '../components/layout/PageContainer'
import { ProductCard } from '../components/shared/knowledge/ProductCard'
import { ProductForm } from '../components/shared/knowledge/ProductForm'
import { InstagramConnectionCard } from '../components/shared/knowledge/InstagramConnectionCard'
import { SourceImportPanel } from '../components/shared/knowledge/SourceImportPanel'
import { ContentHistoryCard } from '../components/shared/knowledge/ContentHistoryCard'
import { ContentTimeline } from '../components/shared/knowledge/ContentTimeline'
import { InspirationTab } from '../components/shared/knowledge/InspirationTab'
import { GridPlanningTab } from '../components/shared/grid/GridPlanningTab'
import { usePersistentState } from '../hooks/usePersistentState'
import { seedProducts, initialInstagramConnection, seedContentHistory } from '../data/mockKnowledge'
import { presetGridTemplates } from '../data/mockGrid'
import type {
  ProductKnowledge,
  ContentSourceItem,
  InspirationItem,
  GridTemplate,
  PendingApproval,
  ApprovalTargetType,
} from '../types'

type HubTab = 'products' | 'instagram' | 'import' | 'history' | 'timeline' | 'inspiration' | 'grid'

const TABS: { id: HubTab; label: string; icon: string }[] = [
  { id: 'products', label: 'Products', icon: 'inventory_2' },
  { id: 'instagram', label: 'Instagram', icon: 'photo_camera' },
  { id: 'import', label: 'Import', icon: 'upload_file' },
  { id: 'history', label: 'History', icon: 'history' },
  { id: 'timeline', label: 'Timeline', icon: 'timeline' },
  { id: 'inspiration', label: 'Inspiration', icon: 'auto_awesome' },
  { id: 'grid', label: 'Grid', icon: 'grid_view' },
]

const TAB_IDS = TABS.map((tab) => tab.id)

export function ContentHubPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = TAB_IDS.includes(searchParams.get('tab') as HubTab)
    ? (searchParams.get('tab') as HubTab)
    : 'products'
  const [activeTab, setActiveTab] = useState<HubTab>(initialTab)

  const changeTab = (tab: HubTab) => {
    setActiveTab(tab)
    setSearchParams(tab === 'products' ? {} : { tab })
  }

  const [products, setProducts] = usePersistentState<ProductKnowledge[]>(
    'devyora-products',
    seedProducts,
  )
  const [instagramConnection, setInstagramConnection] = usePersistentState(
    'devyora-instagram-connection',
    initialInstagramConnection,
  )
  const [sources, setSources] = usePersistentState<ContentSourceItem[]>(
    'devyora-content-sources',
    [],
  )
  const [history] = usePersistentState('devyora-content-history', seedContentHistory)
  const [inspirationItems, setInspirationItems] = usePersistentState<InspirationItem[]>(
    'devyora-inspiration-items',
    [],
  )
  const [gridTemplates, setGridTemplates] = usePersistentState<GridTemplate[]>(
    'devyora-grid-templates',
    presetGridTemplates,
  )
  const [activeGridId, setActiveGridId] = usePersistentState<string | null>(
    'devyora-active-grid-id',
    null,
  )
  const [pendingApprovals, setPendingApprovals] = usePersistentState<PendingApproval[]>(
    'devyora-pending-approvals',
    [],
  )

  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [isAddingProduct, setIsAddingProduct] = useState(false)

  const editingProduct = products.find((product) => product.id === editingProductId)

  const handleSaveProduct = (product: ProductKnowledge) => {
    setProducts((prev) => {
      const exists = prev.some((item) => item.id === product.id)
      return exists ? prev.map((item) => (item.id === product.id ? product : item)) : [product, ...prev]
    })
    setEditingProductId(null)
    setIsAddingProduct(false)
  }

  const isPendingDeletion = (targetId: string) =>
    pendingApprovals.some((approval) => approval.targetId === targetId)

  /**
   * Deletion of permanent knowledge (products, grid templates, inspiration
   * patterns) is never immediate — it queues a PendingApproval that only the
   * Knowledge Base's admin-approval panel (on the Intelligence page) can
   * resolve, per the requirement that important knowledge removal requires
   * admin approval.
   */
  const requestDelete = (targetType: ApprovalTargetType, targetId: string, targetLabel: string) => {
    if (isPendingDeletion(targetId)) return
    setPendingApprovals((prev) => [
      ...prev,
      {
        id: `approval-${Date.now()}`,
        targetType,
        targetId,
        targetLabel,
        requestedAt: new Date().toISOString(),
      },
    ])
  }

  return (
    <PageContainer className="flex flex-col py-space-md lg:py-8">
      <div className="pt-space-xs pb-space-xs flex flex-col gap-space-xs">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile lg:text-headline-lg lg:font-headline-lg text-on-surface tracking-tight">
          Content Hub
        </h1>
        <p className="font-body-sm text-body-sm lg:text-body-md lg:font-body-md text-on-surface-variant">
          Product knowledge, connected accounts, imported sources, and everything you've already
          created.
        </p>
      </div>

      <div className="w-full overflow-x-auto no-scrollbar py-space-xs -mx-gutter-mobile px-gutter-mobile lg:mx-0 lg:px-0">
        <div className="flex items-center gap-space-xs whitespace-nowrap min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => changeTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md flex items-center gap-1.5 transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant lg:hover:bg-surface-container'
              }`}
            >
              <Icon name={tab.icon} className="text-[16px]" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-space-sm lg:mt-6 flex flex-col gap-space-md lg:max-w-3xl">
        {activeTab === 'products' && (
          <>
            {!isAddingProduct && !editingProduct && (
              <button
                type="button"
                onClick={() => setIsAddingProduct(true)}
                className="w-full py-3 px-4 rounded-xl bg-surface-container-high text-primary font-title text-[14px] flex items-center justify-center gap-2 lg:hover:bg-surface-container-highest transition-colors"
              >
                <Icon name="add" className="text-[18px]" />
                <span>Add Product</span>
              </button>
            )}

            {isAddingProduct && (
              <ProductForm onSave={handleSaveProduct} onCancel={() => setIsAddingProduct(false)} />
            )}

            <div className="flex flex-col gap-2.5">
              {products.map((product) =>
                editingProductId === product.id ? (
                  <ProductForm
                    key={product.id}
                    initialProduct={product}
                    onSave={handleSaveProduct}
                    onCancel={() => setEditingProductId(null)}
                  />
                ) : isPendingDeletion(product.id) ? (
                  <div
                    key={product.id}
                    className="rounded-xl bg-surface-container-low p-3.5 flex items-center justify-between"
                  >
                    <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                      {product.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-[11px] font-semibold">
                      Pending admin approval
                    </span>
                  </div>
                ) : (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={() => setEditingProductId(product.id)}
                    onDelete={() => requestDelete('product', product.id, product.name)}
                  />
                ),
              )}
              {products.length === 0 && !isAddingProduct && (
                <div className="rounded-xl bg-surface-container-low p-space-md text-center font-body-sm text-body-sm text-on-surface-variant">
                  No products yet — add one to start building permanent product intelligence.
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'instagram' && (
          <InstagramConnectionCard
            connection={instagramConnection}
            onChange={setInstagramConnection}
          />
        )}

        {activeTab === 'import' && (
          <SourceImportPanel sources={sources} onChange={setSources} />
        )}

        {activeTab === 'history' && (
          <div className="flex flex-col gap-2.5">
            {history.map((item) => (
              <ContentHistoryCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {activeTab === 'timeline' && <ContentTimeline items={history} />}

        {activeTab === 'inspiration' && (
          <InspirationTab
            items={inspirationItems}
            onChange={setInspirationItems}
            onRequestDelete={(id, label) => requestDelete('inspiration', id, label)}
            isPendingDeletion={isPendingDeletion}
          />
        )}

        {activeTab === 'grid' && (
          <GridPlanningTab
            templates={gridTemplates}
            onChange={setGridTemplates}
            activeGridId={activeGridId}
            onSetActiveGridId={setActiveGridId}
            products={products}
            onRequestDelete={(id, label) => requestDelete('grid_template', id, label)}
            isPendingDeletion={isPendingDeletion}
          />
        )}
      </div>
    </PageContainer>
  )
}
