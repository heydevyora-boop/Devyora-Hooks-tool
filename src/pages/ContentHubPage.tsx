import { useState } from 'react'
import { Icon } from '../components/ui/Icon'
import { PageContainer } from '../components/layout/PageContainer'
import { ProductCard } from '../components/shared/knowledge/ProductCard'
import { ProductForm } from '../components/shared/knowledge/ProductForm'
import { InstagramConnectionCard } from '../components/shared/knowledge/InstagramConnectionCard'
import { SourceImportPanel } from '../components/shared/knowledge/SourceImportPanel'
import { ContentHistoryCard } from '../components/shared/knowledge/ContentHistoryCard'
import { ContentTimeline } from '../components/shared/knowledge/ContentTimeline'
import { usePersistentState } from '../hooks/usePersistentState'
import { seedProducts, initialInstagramConnection, seedContentHistory } from '../data/mockKnowledge'
import type { ProductKnowledge, ContentSourceItem } from '../types'

type HubTab = 'products' | 'instagram' | 'import' | 'history' | 'timeline'

const TABS: { id: HubTab; label: string; icon: string }[] = [
  { id: 'products', label: 'Products', icon: 'inventory_2' },
  { id: 'instagram', label: 'Instagram', icon: 'photo_camera' },
  { id: 'import', label: 'Import', icon: 'upload_file' },
  { id: 'history', label: 'History', icon: 'history' },
  { id: 'timeline', label: 'Timeline', icon: 'timeline' },
]

export function ContentHubPage() {
  const [activeTab, setActiveTab] = useState<HubTab>('products')

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
              onClick={() => setActiveTab(tab.id)}
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
                ) : (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={() => setEditingProductId(product.id)}
                    onDelete={() => setProducts((prev) => prev.filter((p) => p.id !== product.id))}
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
      </div>
    </PageContainer>
  )
}
