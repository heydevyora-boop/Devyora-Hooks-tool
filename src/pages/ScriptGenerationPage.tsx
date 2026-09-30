import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icon } from '../components/ui/Icon'
import { VoiceInputButton } from '../components/ui/VoiceInputButton'
import { PageContainer } from '../components/layout/PageContainer'
import { HookVariationCard } from '../components/shared/HookVariationCard'
import { SceneCard } from '../components/shared/SceneCard'
import { VisualDirectionList } from '../components/shared/script/VisualDirectionList'
import { BRollPlanList } from '../components/shared/script/BRollPlanList'
import { RegenerateControl } from '../components/shared/script/RegenerateControl'
import { generateScriptContent, regenerateWithFeedback } from '../components/shared/script/generateScriptContent'
import { usePersistentState } from '../hooks/usePersistentState'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { seedProducts, seedContentHistory } from '../data/mockKnowledge'
import type {
  ContentFlowchart,
  ProductKnowledge,
  ContentHistoryItem,
  GeneratedContentItem,
} from '../types'

export function ScriptGenerationPage() {
  const { nodeId } = useParams<{ nodeId: string }>()

  const [flowchart, setFlowchart] = usePersistentState<ContentFlowchart | null>(
    'devyora-content-flowchart',
    null,
  )
  const [products] = usePersistentState<ProductKnowledge[]>('devyora-products', seedProducts)
  const [, setHistory] = usePersistentState<ContentHistoryItem[]>(
    'devyora-content-history',
    seedContentHistory,
  )
  const [generatedItems, setGeneratedItems] = usePersistentState<GeneratedContentItem[]>(
    'devyora-generated-content',
    [],
  )

  const [instructions, setInstructions] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const { copied, copy } = useCopyToClipboard()

  const node = flowchart?.nodes.find((n) => n.id === nodeId && n.type === 'content')
  const isPlanApproved = Boolean(flowchart?.approvedAt)

  // Hard gate: no route here works without an approved plan containing
  // this exact content node. This is what keeps script generation from
  // bypassing Product Knowledge -> Account -> History -> Inspiration ->
  // Grid -> Strategy -> Flowchart -> Approval.
  if (!flowchart || !isPlanApproved || !node) {
    return (
      <PageContainer className="flex flex-col py-space-md lg:py-8 lg:max-w-xl">
        <div className="rounded-xl bg-surface-container-low p-space-md text-center flex flex-col items-center gap-3 mt-space-lg">
          <Icon name="lock" className="text-on-surface-variant text-[28px]" />
          <h1 className="font-title text-title text-on-surface">
            {!flowchart || !isPlanApproved
              ? 'This script needs an approved plan first'
              : "This content item wasn't found"}
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Script generation only opens from an approved Content Flowchart — it can't be started
            on its own. Go build and approve a plan in Plan → Flowchart.
          </p>
          <Link
            to="/plan?tab=flowchart"
            className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold"
          >
            Go to Flowchart
          </Link>
        </div>
      </PageContainer>
    )
  }

  const product = products.find((p) => p.name === node.product) ?? null
  const item = generatedItems.find((existing) => existing.flowchartNodeId === node.id)

  const persistItem = (next: GeneratedContentItem) => {
    setGeneratedItems((prev) => {
      const exists = prev.some((existing) => existing.id === next.id)
      return exists ? prev.map((existing) => (existing.id === next.id ? next : existing)) : [next, ...prev]
    })
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const generated = generateScriptContent(
        node,
        product,
        flowchart.strategyId,
        instructions.trim() || undefined,
      )
      persistItem(generated)
      setIsGenerating(false)
    }, 900)
  }

  const handleRegenerate = (targetLabel: string) => (feedback: string) => {
    if (!item) return
    persistItem(regenerateWithFeedback(item, targetLabel, feedback))
  }

  const handleApprove = () => {
    if (!item) return
    persistItem({ ...item, status: 'approved' })
  }

  const handleSaveToIntelligence = () => {
    if (!item) return
    const historyItem: ContentHistoryItem = {
      id: `hist-${item.id}`,
      title: item.topic,
      product: item.product,
      topic: item.topic,
      format:
        node.contentType === 'reel'
          ? 'Reel'
          : node.contentType === 'carousel'
            ? 'Carousel'
            : node.contentType === 'story'
              ? 'Story'
              : 'Static',
      date: new Date().toISOString().slice(0, 10),
      hook: item.hooks.find((h) => h.selected)?.text,
      performanceLabel: undefined,
      engagement: undefined,
      status: 'Draft',
    }
    setHistory((prev) => [historyItem, ...prev])
    persistItem({ ...item, status: 'saved' })
    setFlowchart({
      ...flowchart,
      nodes: flowchart.nodes.map((n) => (n.id === node.id ? { ...n, status: 'done' } : n)),
    })
    setJustSaved(true)
  }

  return (
    <PageContainer className="flex flex-col py-space-md lg:py-8 lg:max-w-3xl">
      <div className="pt-space-xs pb-space-xs flex flex-col gap-space-xs">
        <div className="flex items-center gap-1.5">
          <Icon name="movie" className="text-primary text-[18px]" />
          <span className="font-code text-label-sm text-primary uppercase tracking-wider">
            Script Generation
          </span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile lg:text-headline-md lg:font-headline-md text-on-surface tracking-tight">
          {node.label}
        </h1>
        <div className="flex items-center gap-1.5 flex-wrap">
          {node.product && (
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
              {node.product}
            </span>
          )}
          {node.date && (
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
              {node.date}
            </span>
          )}
          {node.gridPosition !== undefined && (
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
              Grid #{node.gridPosition + 1}
            </span>
          )}
        </div>
      </div>

      {!item ? (
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md mt-space-md">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Additional instructions (optional)
              </label>
              <VoiceInputButton onTranscript={(transcript) => setInstructions(transcript)} />
            </div>
            <textarea
              className="w-full bg-surface-container-low rounded-lg p-2.5 font-body-md text-body-md text-on-surface outline-none min-h-[70px] resize-y"
              placeholder="Anything specific this script should cover?"
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3.5 px-4 rounded-xl bg-tertiary-container text-on-tertiary font-title text-title flex items-center justify-center gap-2 shadow-lg shadow-tertiary-container/25 active:scale-[0.99] lg:hover:bg-tertiary transition-transform disabled:opacity-50"
          >
            <Icon name="auto_awesome" className={`text-[20px] ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing Script…' : '✨ Generate Script'}</span>
          </button>
          <p className="font-label-sm text-[11px] text-on-surface-variant text-center">
            Mock generation — no AI backend is connected yet. Output is placeholder content built
            from your product and plan data.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-space-md mt-space-md">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="font-title text-title lg:text-headline-sm lg:font-headline-sm text-on-surface flex items-center gap-1.5">
                <Icon name="flare" className="text-tertiary-container text-[20px]" />
                Hooks
              </h2>
              <RegenerateControl targetLabel="Hook #1" onRegenerate={handleRegenerate('Hook #1')} />
            </div>
            {item.hooks.map((hook) => (
              <HookVariationCard key={hook.id} hook={hook} />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-title text-title lg:text-headline-sm lg:font-headline-sm text-on-surface flex items-center gap-1.5">
              <Icon name="theaters" className="text-primary text-[20px]" />
              Scene Flow
            </h2>
            {item.scenes.map((scene) => (
              <div key={scene.id} className="flex flex-col gap-1.5">
                <SceneCard scene={scene} />
                <RegenerateControl
                  targetLabel={`Scene ${scene.id}`}
                  onRegenerate={handleRegenerate(`Scene ${scene.id}`)}
                  className="self-end"
                />
              </div>
            ))}
          </div>

          <VisualDirectionList
            beats={item.visualDirection}
            onRegenerate={handleRegenerate('Visual Direction')}
          />

          <BRollPlanList shots={item.brollPlan} onRegenerate={handleRegenerate('B-Roll Plan')} />

          {item.onScreenText.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-2">
              <span className="font-title text-title text-on-surface flex items-center gap-1.5">
                <Icon name="closed_caption" className="text-tertiary-container text-[20px]" />
                On-Screen Text
              </span>
              <div className="flex flex-wrap gap-1.5">
                {item.onScreenText.map((text, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded bg-yellow-300 text-black font-code text-label-sm font-black"
                  >
                    {text}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-title text-title text-on-surface flex items-center gap-1.5">
                <Icon name="ads_click" className="text-tertiary-container text-[20px]" />
                Call to Action
              </span>
              <RegenerateControl targetLabel="CTA" onRegenerate={handleRegenerate('CTA')} />
            </div>
            <p className="font-body-md text-body-md text-on-surface">{item.cta}</p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="font-title text-title text-on-surface flex items-center gap-1.5">
                <Icon name="content_copy" className="text-primary text-[20px]" />
                Caption
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copy(item.caption)}
                  className="text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 bg-surface-container px-2 py-1 rounded"
                >
                  <Icon name={copied ? 'check' : 'copy_all'} className="text-[14px]" />
                  {copied ? 'Copied!' : 'Copy Text'}
                </button>
                <RegenerateControl targetLabel="Caption" onRegenerate={handleRegenerate('Caption')} />
              </div>
            </div>
            <div className="bg-surface-container-low p-3 rounded-lg font-code text-body-sm text-on-surface whitespace-pre-line leading-relaxed">
              {item.caption}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-3">
            {item.status === 'saved' || justSaved ? (
              <div className="flex items-center gap-2 text-emerald-700">
                <Icon name="verified" className="text-[20px]" />
                <div className="flex flex-col">
                  <span className="font-title text-title">Saved to Content Intelligence</span>
                  <Link to="/hub?tab=history" className="font-label-sm text-label-sm underline">
                    View it in Content Hub → History
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {item.status === 'approved'
                    ? 'Approved content becomes part of your historical intelligence, ready for future planning.'
                    : 'Approve this content, then save it — it becomes part of your historical intelligence for future planning.'}
                </p>
                <div className="flex items-center gap-2">
                  {item.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={handleApprove}
                      className="flex-1 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Icon name="check" className="text-[16px]" />
                      Approve
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={item.status !== 'approved'}
                    onClick={handleSaveToIntelligence}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Icon name="save" className="text-[16px]" />
                    Save to Content Intelligence
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  )
}
