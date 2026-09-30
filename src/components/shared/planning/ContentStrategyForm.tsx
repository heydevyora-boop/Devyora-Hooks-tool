import { useState } from 'react'
import { Icon } from '../../ui/Icon'
import type { ContentStrategyInput, ProductKnowledge } from '../../../types'

const FREQUENCY_OPTIONS = ['3x / week', '4x / week', '5x / week', 'Daily']

interface ContentStrategyFormProps {
  products: ProductKnowledge[]
  onGenerate: (input: ContentStrategyInput) => void
  isGenerating: boolean
}

export function ContentStrategyForm({ products, onGenerate, isGenerating }: ContentStrategyFormProps) {
  const [goal, setGoal] = useState('')
  const [durationWeeks, setDurationWeeks] = useState(4)
  const [postingFrequency, setPostingFrequency] = useState(FREQUENCY_OPTIONS[1])
  const [productIds, setProductIds] = useState<string[]>(products.map((product) => product.id))
  const [objective, setObjective] = useState('')

  const toggleProduct = (id: string) =>
    setProductIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))

  const canGenerate = goal.trim().length > 0 && productIds.length > 0

  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
      <div className="flex flex-col gap-1">
        <label className="font-label-md text-label-md text-on-surface font-semibold">Goal</label>
        <div className="bg-surface-container-low rounded-lg p-2.5 flex items-center gap-2">
          <Icon name="flag" className="text-primary text-[18px]" />
          <input
            className="w-full bg-transparent font-body-md text-body-md text-on-surface outline-none"
            type="text"
            placeholder="e.g. Grow demo bookings from Reels"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-space-sm">
        <div className="flex flex-col gap-1">
          <label className="font-label-sm text-label-sm text-on-surface-variant">
            Duration (weeks)
          </label>
          <input
            className="w-full bg-surface-container-low rounded-lg p-2.5 font-code text-label-sm text-on-surface outline-none"
            type="number"
            min={1}
            max={12}
            value={durationWeeks}
            onChange={(event) => setDurationWeeks(Number(event.target.value) || 1)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-label-sm text-label-sm text-on-surface-variant">
            Posting Frequency
          </label>
          <select
            className="w-full bg-surface-container-low rounded-lg p-2.5 font-code text-label-sm text-on-surface outline-none"
            value={postingFrequency}
            onChange={(event) => setPostingFrequency(event.target.value)}
          >
            {FREQUENCY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-label-md text-label-md text-on-surface font-semibold">
          Products
        </label>
        {products.length === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            No products yet — add one in the Content Hub first.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {products.map((product) => (
              <label
                key={product.id}
                className="flex items-center gap-2 bg-surface-container-low rounded-lg p-2.5 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-primary"
                  checked={productIds.includes(product.id)}
                  onChange={() => toggleProduct(product.id)}
                />
                <span className="font-body-sm text-body-sm text-on-surface">{product.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-label-md text-label-md text-on-surface-variant font-medium">
          Content Objective
        </label>
        <div className="bg-surface-container-low rounded-lg p-2.5 flex items-center gap-2">
          <Icon name="track_changes" className="text-on-surface-variant text-[18px]" />
          <input
            className="w-full bg-transparent font-body-md text-body-md text-on-surface outline-none"
            type="text"
            placeholder="e.g. Educate first, promote second"
            value={objective}
            onChange={(event) => setObjective(event.target.value)}
          />
        </div>
      </div>

      <button
        type="button"
        disabled={!canGenerate || isGenerating}
        onClick={() =>
          onGenerate({ goal, durationWeeks, postingFrequency, productIds, objective })
        }
        className="w-full py-3.5 px-4 rounded-xl bg-tertiary-container text-on-tertiary font-title text-title flex items-center justify-center gap-2 shadow-lg shadow-tertiary-container/25 active:scale-[0.99] lg:hover:bg-tertiary transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Icon
          name="auto_awesome"
          className={`text-[20px] ${isGenerating ? 'animate-spin' : ''}`}
        />
        <span>
          {isGenerating ? 'Synthesizing Strategy…' : '✨ Generate Content Strategy'}
        </span>
      </button>
    </div>
  )
}
