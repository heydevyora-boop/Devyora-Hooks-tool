import { useEffect, useState } from 'react'
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
import { ApiError } from '../api/client'
import { listProducts, createProduct, updateProduct, requestDeleteProduct, type ApprovalView } from '../api/products'
import { getInstagramStatus } from '../api/instagram'
import { listSources } from '../api/sources'
import { listContentHistory } from '../api/history'
import { listInspiration, requestDeleteInspiration } from '../api/inspiration'
import { listGridTemplates, getActiveGridTemplate, createGridTemplate, updateGridTemplate, activateGridTemplate, requestDeleteGridTemplate } from '../api/grid'
import { listApprovals } from '../api/approvals'
import type {
  ProductKnowledge,
  ContentSourceItem,
  InstagramConnection,
  ContentHistoryItem,
  InspirationItem,
  GridTemplate,
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

function describeError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  return "Couldn't reach the server — try again in a moment."
}

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

  const [products, setProducts] = useState<ProductKnowledge[]>([])
  const [instagramConnection, setInstagramConnection] = useState<InstagramConnection>({ status: 'not_connected' })
  const [sources, setSources] = useState<ContentSourceItem[]>([])
  const [history, setHistory] = useState<ContentHistoryItem[]>([])
  const [inspirationItems, setInspirationItems] = useState<InspirationItem[]>([])
  const [gridTemplates, setGridTemplates] = useState<GridTemplate[]>([])
  const [activeGridId, setActiveGridId] = useState<string | null>(null)
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalView[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setLoadError(null)
      try {
        const [
          productsResult,
          instagramResult,
          sourcesResult,
          historyResult,
          inspirationResult,
          gridResult,
          activeGridResult,
          approvalsResult,
        ] = await Promise.all([
          listProducts(),
          getInstagramStatus(),
          listSources(),
          listContentHistory(),
          listInspiration(),
          listGridTemplates(),
          getActiveGridTemplate(),
          listApprovals(),
        ])
        if (cancelled) return
        setProducts(productsResult)
        setInstagramConnection(instagramResult)
        setSources(sourcesResult)
        setHistory(historyResult)
        setInspirationItems(inspirationResult)
        setGridTemplates(gridResult)
        setActiveGridId(activeGridResult?.id ?? null)
        setPendingApprovals(approvalsResult)
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

  useEffect(() => {
    const instagramParam = searchParams.get('instagram')
    if (!instagramParam) return
    if (instagramParam === 'connected') {
      getInstagramStatus().then(setInstagramConnection).catch((err) => setActionError(describeError(err)))
    } else if (instagramParam === 'error') {
      setActionError('Instagram connection could not be completed. Please try again.')
    }
    const next = new URLSearchParams(searchParams)
    next.delete('instagram')
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [isAddingProduct, setIsAddingProduct] = useState(false)

  const editingProduct = products.find((product) => product.id === editingProductId)

  const handleSaveProduct = async (product: ProductKnowledge) => {
    setActionError(null)
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = product
    try {
      if (editingProductId) {
        const saved = await updateProduct(editingProductId, input)
        setProducts((prev) => prev.map((item) => (item.id === saved.id ? saved : item)))
      } else {
        const saved = await createProduct(input)
        setProducts((prev) => [saved, ...prev])
      }
      setEditingProductId(null)
      setIsAddingProduct(false)
    } catch (err) {
      setActionError(describeError(err))
    }
  }

  const isPendingDeletion = (targetId: string) =>
    pendingApprovals.some((approval) => approval.targetId === targetId && approval.resolution === 'pending')

  /**
   * Deletion of permanent knowledge (products, grid templates, inspiration
   * patterns) is never immediate — it queues a PendingApproval that only an
   * admin can resolve (Settings → Admin), per the requirement that
   * important knowledge removal requires admin approval.
   */
  const requestDelete = async (targetType: ApprovalTargetType, targetId: string, targetLabel: string) => {
    if (isPendingDeletion(targetId)) return
    setActionError(null)
    try {
      const approval =
        targetType === 'product'
          ? await requestDeleteProduct(targetId)
          : targetType === 'grid_template'
            ? await requestDeleteGridTemplate(targetId)
            : await requestDeleteInspiration(targetId)
      setPendingApprovals((prev) => [...prev, approval])
      void targetLabel
    } catch (err) {
      setActionError(describeError(err))
    }
  }

  const handleGridChange = async (next: GridTemplate[]): Promise<GridTemplate | undefined> => {
    setActionError(null)
    try {
      if (next.length > gridTemplates.length) {
        const draft = next[0]!
        const saved = await createGridTemplate(draft)
        setGridTemplates([saved, ...gridTemplates])
        return saved
      } else {
        const changed = next.find((template) => {
          const existing = gridTemplates.find((item) => item.id === template.id)
          return existing && JSON.stringify(existing) !== JSON.stringify(template)
        })
        if (changed) {
          const saved = await updateGridTemplate(changed.id, changed)
          setGridTemplates((prev) => prev.map((item) => (item.id === saved.id ? saved : item)))
          return saved
        }
        return undefined
      }
    } catch (err) {
      setActionError(describeError(err))
      return undefined
    }
  }

  const handleSetActiveGridId = async (id: string) => {
    setActionError(null)
    try {
      await activateGridTemplate(id)
      setActiveGridId(id)
    } catch (err) {
      setActionError(describeError(err))
    }
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

      {isLoading ? (
        <div className="mt-space-sm lg:mt-6 font-body-sm text-body-sm text-on-surface-variant">
          Loading…
        </div>
      ) : (
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
              {history.length === 0 && (
                <div className="rounded-xl bg-surface-container-low p-space-md text-center font-body-sm text-body-sm text-on-surface-variant">
                  No published content yet.
                </div>
              )}
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
              onChange={handleGridChange}
              activeGridId={activeGridId}
              onSetActiveGridId={handleSetActiveGridId}
              products={products}
              onRequestDelete={(id, label) => requestDelete('grid_template', id, label)}
              isPendingDeletion={isPendingDeletion}
            />
          )}
        </div>
      )}
    </PageContainer>
  )
}
