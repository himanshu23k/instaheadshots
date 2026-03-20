import { useState, useCallback } from 'react'
import { StepLayout } from '@/components/layout/StepLayout'
import { CreditActionButton } from '@/components/common/CreditActionButton'
import { CreditForecastBanner } from '@/components/common/CreditForecastBanner'
import { BeforeAfterToggle } from '@/components/common/BeforeAfterToggle'
import { RenderOverlay } from '@/components/common/RenderOverlay'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useJourneyStore } from '@/store/journey-store'
import { useRender } from '@/hooks/use-render'
import { useCredit } from '@/hooks/use-credit'
import { checkModeration } from '@/constants/moderation'
import promptChips from '@/data/prompt-chips.json'

const MAX_CHARS = 300

export function AIPromptRefinement() {
  const [prompt, setPrompt] = useState('')
  const [moderationError, setModerationError] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'before' | 'after'>('after')

  const applied = useJourneyStore((s) => s.appliedTransformations.get('ai-prompt'))
  const setSelection = useJourneyStore((s) => s.setSelection)
  const applyTransformation = useJourneyStore((s) => s.applyTransformation)
  const completeStep = useJourneyStore((s) => s.completeStep)
  const setCurrentStep = useJourneyStore((s) => s.setCurrentStep)
  const showToast = useJourneyStore((s) => s.showToast)
  const originalImage = useJourneyStore((s) => s.originalImage)

  const { renderState, startRender, cancelRender, showCancel } = useRender()
  const optionId = prompt.trim() ? `prompt-${prompt.trim().slice(0, 20)}` : null
  const { cost, isFree, canAfford, deduct } = useCredit('ai-prompt', optionId)

  const previewSrc = applied
    ? previewMode === 'before'
      ? originalImage
      : applied.renderResult || originalImage
    : originalImage

  const handlePromptChange = (value: string) => {
    if (value.length <= MAX_CHARS) {
      setPrompt(value)
      setModerationError(null)
    }
  }

  const handleChipClick = (chip: string) => {
    const newPrompt = prompt.trim() ? `${prompt}, ${chip.toLowerCase()}` : chip
    if (newPrompt.length <= MAX_CHARS) {
      setPrompt(newPrompt)
    }
  }

  const handleApply = useCallback(async () => {
    if (!prompt.trim()) return

    // Client-side moderation
    const modResult = checkModeration(prompt)
    if (!modResult.allowed) {
      setModerationError(
        modResult.message ||
          "This edit isn't supported. Try describing lighting, background, clothing, or general expression instead."
      )
      return
    }

    if (!canAfford) return

    const selection = {
      optionId: `prompt-${Date.now()}`,
      label: prompt.trim().slice(0, 40),
      renderResult: `/mock/renders/render-${Math.floor(Math.random() * 6) + 1}.jpg`.replace(/(\d)$/, (m) => m.padStart(2, '0')),
    }

    setSelection('ai-prompt', selection)

    const success = await startRender('ai-prompt', selection.optionId)
    if (success) {
      deduct()
      applyTransformation('ai-prompt', selection)
      completeStep('ai-prompt')
      showToast('AI refinement applied')
      setCurrentStep('edits')
    }
  }, [prompt, canAfford, startRender, deduct, applyTransformation, completeStep, setCurrentStep, showToast, setSelection])

  const handleSkip = () => {
    completeStep('ai-prompt')
    setCurrentStep('edits')
  }

  const charCount = prompt.length

  return (
    <StepLayout
      previewSrc={previewSrc}
      previewAlt="AI refinement preview"
      previewOverlay={
        renderState.status === 'loading' ? (
          <RenderOverlay
            actionName="AI refinement"
            showCancel={showCancel}
            onCancel={cancelRender}
          />
        ) : null
      }
      previewTopRight={
        applied ? (
          <BeforeAfterToggle mode={previewMode} onToggle={setPreviewMode} />
        ) : null
      }
    >
      <h2 className="text-[18px] font-medium mb-1">Describe refinements</h2>
      <p className="text-[12px] text-ih-muted mb-4">
        Lighting, mood, expression, collar, background detail — anything subtle.
      </p>

      <CreditForecastBanner stepCost={1} />

      <Textarea
        value={prompt}
        onChange={(e) => handlePromptChange(e.target.value)}
        placeholder="e.g. Warmer lighting, sharpen the collar, soften background blur, confident expression..."
        className="min-h-[120px] resize-y border-ih-border text-[14px] leading-relaxed mb-1"
        maxLength={MAX_CHARS}
      />

      <div className="flex justify-end mb-3">
        <span
          className={`text-[12px] ${
            charCount >= MAX_CHARS
              ? 'text-ih-danger font-medium'
              : charCount >= 280
              ? 'text-ih-danger'
              : 'text-ih-muted'
          }`}
        >
          {charCount} / {MAX_CHARS}
        </span>
      </div>

      {/* Suggestion chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {(promptChips as string[]).map((chip) => (
          <button
            key={chip}
            onClick={() => handleChipClick(chip)}
            className="flex-shrink-0 border border-ih-border rounded-[var(--radius-chip)] px-3 py-1 text-[12px] bg-surface hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            {chip}
          </button>
        ))}
      </div>

      {moderationError && (
        <p className="text-ih-danger text-[12px] mb-3" role="alert">
          {moderationError}
        </p>
      )}

      <div className="sticky bottom-0 bg-surface pt-2 pb-1">
        {renderState.status === 'failure' && (
          <p className="text-ih-danger text-[12px] mb-2" role="alert">
            {renderState.error}
          </p>
        )}

        {prompt.trim() ? (
          <CreditActionButton
            label="Apply Prompt →"
            cost={1}
            isFree={isFree}
            disabled={renderState.status === 'loading'}
            loading={renderState.status === 'loading'}
            onClick={handleApply}
          />
        ) : (
          <Button
            variant="outline"
            className="w-full border-ih-border text-primary-cta"
            onClick={handleSkip}
          >
            Skip — Continue →
          </Button>
        )}
      </div>
    </StepLayout>
  )
}
