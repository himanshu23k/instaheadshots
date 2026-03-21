import { useState, useCallback } from 'react'
import { StepLayout } from '@/components/layout/StepLayout'
import { OptionGrid } from '@/components/common/OptionGrid'
import { CreditActionButton } from '@/components/common/CreditActionButton'
import { CreditForecastBanner } from '@/components/common/CreditForecastBanner'
import { BeforeAfterToggle } from '@/components/common/BeforeAfterToggle'
import { RenderOverlay } from '@/components/common/RenderOverlay'
import { BetaBadge } from '@/components/common/BetaBadge'
import { useJourneyStore } from '@/store/journey-store'
import { useRender } from '@/hooks/use-render'
import { useCredit } from '@/hooks/use-credit'
import posturesData from '@/data/postures.json'

const DEFAULT_POSTURE = 'posture-straight'

export function PostureSelection() {
  const selection = useJourneyStore((s) => s.selections.posture)
  const applied = useJourneyStore((s) => s.appliedTransformations.get('posture'))
  const setSelection = useJourneyStore((s) => s.setSelection)
  const applyTransformation = useJourneyStore((s) => s.applyTransformation)
  const completeStep = useJourneyStore((s) => s.completeStep)
  const setCurrentStep = useJourneyStore((s) => s.setCurrentStep)
  const showToast = useJourneyStore((s) => s.showToast)
  const originalImage = useJourneyStore((s) => s.originalImage)

  const { renderState, startRender, cancelRender, showCancel } = useRender()
  const selectedId = selection?.optionId || DEFAULT_POSTURE
  const isNoChange = selectedId === DEFAULT_POSTURE
  const { isFree, canAfford, deduct } = useCredit('posture', isNoChange ? null : selectedId)

  const [previewMode, setPreviewMode] = useState<'before' | 'after'>('after')

  const selectedPosture = posturesData.find((p) => p.id === selectedId)
  const previewSrc = applied
    ? previewMode === 'before'
      ? originalImage
      : applied.renderResult || originalImage
    : selectedPosture?.thumbnail || originalImage

  const handleSelect = (id: string) => {
    const posture = posturesData.find((p) => p.id === id)
    if (posture) {
      setSelection('posture', {
        optionId: posture.id,
        label: posture.name,
        thumbnail: posture.thumbnail,
        renderResult: posture.renderResult,
      })
    }
  }

  const handleApply = useCallback(async () => {
    if (isNoChange) {
      completeStep('posture')
      setCurrentStep('background')
      return
    }

    if (!canAfford) return

    const success = await startRender('posture', selectedId)
    if (success && selection) {
      deduct()
      applyTransformation('posture', selection)
      completeStep('posture')
      showToast('Posture applied')
      setCurrentStep('background')
    }
  }, [isNoChange, canAfford, selectedId, selection, startRender, deduct, applyTransformation, completeStep, setCurrentStep, showToast])

  return (
    <StepLayout
      previewSrc={previewSrc}
      previewAlt="Posture preview"
      previewOverlay={
        renderState.status === 'loading' ? (
          <RenderOverlay
            actionName="posture"
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
      footer={
        <>
          {renderState.status === 'failure' && (
            <p className="text-ih-danger text-[12px] mb-2" role="alert">
              {renderState.error}
            </p>
          )}
          <p className="mb-2 text-[11px] text-ih-warning-text">
            Beta: Posture quality may vary. Credit is still charged on apply.
          </p>
          <CreditActionButton
            label={isNoChange ? 'Continue →' : 'Apply Posture →'}
            cost={isNoChange ? 0 : 1}
            isFree={isFree}
            disabled={renderState.status === 'loading'}
            loading={renderState.status === 'loading'}
            onClick={handleApply}
          />
        </>
      }
    >
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-[18px] font-medium">Choose posture</h2>
        <BetaBadge />
      </div>
      <p className="text-[12px] text-ih-muted mb-4">
        Select how you want to be positioned.
      </p>

      <CreditForecastBanner stepCost={1} />

      <OptionGrid
        items={posturesData}
        selectedId={selectedId}
        onSelect={handleSelect}
      />
    </StepLayout>
  )
}
