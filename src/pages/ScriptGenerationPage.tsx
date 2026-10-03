import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icon } from '../components/ui/Icon'
import { VoiceInputButton } from '../components/ui/VoiceInputButton'
import { Tooltip } from '../components/ui/Tooltip'
import { PageContainer } from '../components/layout/PageContainer'
import { HookVariationCard } from '../components/shared/HookVariationCard'
import { SceneCard } from '../components/shared/SceneCard'
import { ScoreCard } from '../components/shared/ScoreCard'
import { VisualDirectionList } from '../components/shared/script/VisualDirectionList'
import { BRollPlanList } from '../components/shared/script/BRollPlanList'
import { RegenerateControl } from '../components/shared/script/RegenerateControl'
import {
  generateContent,
  getGeneration,
  getVideoBlueprint,
  regenerateContent,
  approveGeneration,
  rejectGeneration,
  saveGeneration,
  type GeneratedContentView,
  type VideoBlueprintView,
} from '../api/generation'
import { findProductIdByName } from '../api/products'
import { ApiError } from '../api/client'
import { usePersistentState } from '../hooks/usePersistentState'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'
import { seedProducts, seedContentHistory } from '../data/mockKnowledge'
import type { ContentFlowchart, ProductKnowledge, ContentHistoryItem } from '../types'

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
  // Content Hub/Plan aren't wired to the real backend yet (out of this
  // chunk's scope) — their node/flowchart ids are frontend-only, so this
  // just remembers which real backend generation belongs to which local
  // node, instead of relying on a real foreign key.
  const [generationIdByNode, setGenerationIdByNode] = usePersistentState<Record<string, string>>(
    'devyora-generation-ids',
    {},
  )

  const [instructions, setInstructions] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isWorking, setIsWorking] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [item, setItem] = useState<GeneratedContentView | null>(null)
  const [blueprint, setBlueprint] = useState<VideoBlueprintView | null>(null)
  const { copied, copy } = useCopyToClipboard()

  const node = flowchart?.nodes.find((n) => n.id === nodeId && n.type === 'content')
  const isPlanApproved = Boolean(flowchart?.approvedAt)
  const product = products.find((p) => p.name === node?.product) ?? null

  useEffect(() => {
    if (!node) return
    const existingId = generationIdByNode[node.id]
    if (!existingId) {
      setItem(null)
      setBlueprint(null)
      return
    }
    getGeneration(existingId)
      .then((generation) => {
        setItem(generation)
        return getVideoBlueprint(existingId)
      })
      .then(setBlueprint)
      .catch(() => {
        // The id we remembered no longer resolves (e.g. a fresh dev DB) —
        // fall back to the pre-generation form rather than looping forever.
        setItem(null)
        setBlueprint(null)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node?.id])

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

  function describeError(err: unknown): string {
    if (err instanceof ApiError) return err.message
    return "Couldn't reach the server — try again in a moment."
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const productId = await findProductIdByName(product?.name ?? node.product ?? '')
      const generated = await generateContent({
        productId,
        topic: node.reason ?? node.label,
        platform: 'instagram',
        userInstructions: instructions.trim() || undefined,
      })
      setGenerationIdByNode((prev) => ({ ...prev, [node.id]: generated.id }))
      setItem(generated)
      setBlueprint(await getVideoBlueprint(generated.id))
    } catch (err) {
      setError(describeError(err))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = (targetLabel: string) => async (feedback: string, origin: 'text' | 'speech') => {
    if (!item) return
    setIsWorking(true)
    setError(null)
    try {
      const updated = await regenerateContent(item.id, { targetLabel, reason: feedback, reasonOrigin: origin })
      setItem(updated)
      setBlueprint(await getVideoBlueprint(item.id))
    } catch (err) {
      setError(describeError(err))
    } finally {
      setIsWorking(false)
    }
  }

  const handleApprove = async () => {
    if (!item) return
    setIsWorking(true)
    setError(null)
    try {
      setItem(await approveGeneration(item.id))
    } catch (err) {
      setError(describeError(err))
    } finally {
      setIsWorking(false)
    }
  }

  const handleReject = async () => {
    if (!item) return
    setIsWorking(true)
    setError(null)
    try {
      setItem(await rejectGeneration(item.id, 'Sent back for another pass before approving'))
    } catch (err) {
      setError(describeError(err))
    } finally {
      setIsWorking(false)
    }
  }

  const handleSaveToIntelligence = async () => {
    if (!item) return
    setIsWorking(true)
    setError(null)
    try {
      const saved = await saveGeneration(item.id)
      setItem(saved)

      // Content Hub's historical content list isn't wired to the backend
      // yet (out of this chunk's scope) — mirror the save locally too so
      // the existing local-only views stay consistent. The real,
      // authoritative record is the ContentHistory row the backend just
      // created (saved.contentHistoryId).
      const historyItem: ContentHistoryItem = {
        id: `hist-${saved.id}`,
        title: saved.topic,
        product: saved.product,
        topic: saved.topic,
        format:
          node.contentType === 'reel'
            ? 'Reel'
            : node.contentType === 'carousel'
              ? 'Carousel'
              : node.contentType === 'story'
                ? 'Story'
                : 'Static',
        date: new Date().toISOString().slice(0, 10),
        hook: saved.hooks.find((h) => h.selected)?.text,
        performanceLabel: undefined,
        engagement: undefined,
        status: 'Draft',
      }
      setHistory((prev) => [historyItem, ...prev])
      setFlowchart({
        ...flowchart,
        nodes: flowchart.nodes.map((n) => (n.id === node.id ? { ...n, status: 'done' } : n)),
      })
      setJustSaved(true)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setIsWorking(false)
    }
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

      {error && (
        <div className="mt-space-sm bg-error-container text-on-error-container rounded-lg p-3 flex items-start gap-2">
          <Icon name="error" className="text-[18px] mt-0.5" />
          <p className="font-body-sm text-body-sm">{error}</p>
        </div>
      )}

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
            Rule-based generation from your real product, grid, and plan context — not a language
            model. See the Video Blueprint score below for an analytical (not guaranteed) read on
            the result.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-space-md mt-space-md">
          {blueprint && (
            <ScoreCard
              score={blueprint.score}
              tierLabel={blueprint.tierLabel}
              tierBadge={blueprint.tierBadge}
              diagnosis={blueprint.diagnosis}
              metrics={blueprint.metrics}
              viralityThresholdLabel={blueprint.viralityThresholdLabel}
            />
          )}

          {item.similarityWarnings.length > 0 && (
            <div className="bg-surface-container-high/60 rounded-lg p-2.5 flex items-start gap-2">
              <Icon name="warning" className="text-tertiary-container text-[18px] mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                  Similar to past content
                </span>
                {item.similarityWarnings.map((warning, index) => (
                  <p key={index} className="font-body-sm text-body-sm text-on-surface-variant">
                    {warning.message}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="font-title text-title lg:text-headline-sm lg:font-headline-sm text-on-surface flex items-center gap-1.5">
                <Icon name="flare" className="text-tertiary-container text-[20px]" />
                Hooks
                <Tooltip text="Different hook options for the same content — pick whichever opening line works best." />
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
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Icon name="verified" className="text-[20px]" />
                  <span className="font-title text-title">Saved to Content Intelligence</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  This content is now part of your historical intelligence — future strategies and
                  scripts will take it into account.
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to="/hub?tab=history"
                    className="px-3 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold flex items-center gap-1.5"
                  >
                    <Icon name="history" className="text-[16px]" />
                    View in Content Hub
                  </Link>
                  <Link
                    to="/plan?tab=flowchart"
                    className="px-3 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold flex items-center gap-1.5"
                  >
                    <Icon name="account_tree" className="text-[16px]" />
                    Create Next Content
                  </Link>
                  <Link
                    to="/"
                    className="px-3 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center gap-1.5"
                  >
                    <Icon name="home" className="text-[16px]" />
                    Back to Home
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
                    <>
                      <button
                        type="button"
                        onClick={handleReject}
                        disabled={isWorking}
                        title="Send back for another pass before approving"
                        className="px-3 py-2.5 rounded-xl bg-surface-container text-error font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <Icon name="close" className="text-[16px]" />
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={isWorking}
                        className="flex-1 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <Icon name="check" className="text-[16px]" />
                        Approve
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    disabled={item.status !== 'approved' || isWorking}
                    onClick={handleSaveToIntelligence}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Icon name="save" className="text-[16px]" />
                    Save to Content Intelligence
                  </button>
                </div>
                {item.stage === 'review' && item.rejectionReason && (
                  <p className="font-label-sm text-label-sm text-error">Rejected: {item.rejectionReason}</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  )
}
