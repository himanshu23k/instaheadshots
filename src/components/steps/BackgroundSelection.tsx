import { useState, useCallback } from 'react'
import { StepLayout } from '@/components/layout/StepLayout'
import { OptionGrid } from '@/components/common/OptionGrid'
import { CategoryTabs } from '@/components/common/CategoryTabs'
import { CreditActionButton } from '@/components/common/CreditActionButton'
import { CreditForecastBanner } from '@/components/common/CreditForecastBanner'
import { BeforeAfterToggle } from '@/components/common/BeforeAfterToggle'
import { RenderOverlay } from '@/components/common/RenderOverlay'
import { CustomUploadZone } from '@/components/background/CustomUploadZone'
import { useJourneyStore } from '@/store/journey-store'
import { useRender } from '@/hooks/use-render'
import { useCredit } from '@/hooks/use-credit'
import backgroundsData from '@/data/backgrounds.json'

const BG_TABS = ['Studio', 'Outdoor', 'Location']

export function BackgroundSelection() {
  const [activeTab, setActiveTab] = useState('Studio')
  const [customUploads, setCustomUploads] = useState<
    Array<{ id: string; name: string; thumbnail: string; renderResult: string }>
  >([])
  const [previewMode, setPreviewMode] = useState<'before' | 'after'>('after')

  const selection = useJourneyStore((s) => s.selections.background)
  const applied = useJourneyStore((s) => s.appliedTransformations.get('background'))
  const setSelection = useJourneyStore((s) => s.setSelection)
  const applyTransformation = useJourneyStore((s) => s.applyTransformation)
  const completeStep = useJourneyStore((s) => s.completeStep)
  const setCurrentStep = useJourneyStore((s) => s.setCurrentStep)
  const showToast = useJourneyStore((s) => s.showToast)
  const originalImage = useJourneyStore((s) => s.originalImage)

  const { renderState, startRender, cancelRender, showCancel } = useRender()
  const selectedId = selection?.optionId || null
  const { isFree, canAfford, deduct } = useCredit('background', selectedId)

  const isCustom = activeTab === 'Custom'
  const allBackgrounds = isCustom
    ? customUploads
    : backgroundsData.filter((bg) => bg.category === activeTab)

  const selectedBg = [...backgroundsData, ...customUploads].find((bg) => bg.id === selectedId)
  const previewSrc = applied
    ? previewMode === 'before'
      ? originalImage
      : applied.renderResult || originalImage
    : selectedBg?.thumbnail || originalImage

  const handleSelect = (id: string) => {
    const bg = [...backgroundsData, ...customUploads].find((b) => b.id === id)
    if (bg) {
      setSelection('background', {
        optionId: bg.id,
        label: bg.name,
        thumbnail: bg.thumbnail,
        renderResult: bg.renderResult,
      })
    }
  }

  const handleUploadComplete = (imageUrl: string) => {
    const newUpload = {
      id: `custom-${Date.now()}`,
      name: 'Your Upload',
      thumbnail: imageUrl,
      renderResult: imageUrl,
    }
    setCustomUploads((prev) => [newUpload, ...prev])
    handleSelect(newUpload.id)
  }

  const handleApply = useCallback(async () => {
    if (!selectedId || !canAfford) return

    const success = await startRender('background', selectedId)
    if (success && selection) {
      deduct()
      applyTransformation('background', selection)
      completeStep('background')
      showToast('Background applied')
      setCurrentStep('outfit')
    }
  }, [selectedId, canAfford, selection, startRender, deduct, applyTransformation, completeStep, setCurrentStep, showToast])

  return (
    <StepLayout
      previewSrc={previewSrc}
      previewAlt="Background preview"
      previewOverlay={
        renderState.status === 'loading' ? (
          <RenderOverlay
            actionName="background"
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
          <CreditActionButton
            label="Apply Background →"
            cost={1}
            isFree={isFree}
            disabled={!selectedId || renderState.status === 'loading'}
            loading={renderState.status === 'loading'}
            onClick={handleApply}
          />
        </>
      }
    >
      <h2 className="text-[18px] font-medium mb-4">Change background</h2>

      <CreditForecastBanner stepCost={1} />

      <CategoryTabs
        tabs={BG_TABS}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        actionLabel="Upload"
        onActionClick={() => setActiveTab('Custom')}
        actionActive={isCustom}
      />

      {isCustom && (
        <div className="mb-4">
          <CustomUploadZone onUploadComplete={handleUploadComplete} />
        </div>
      )}

      <OptionGrid
        items={allBackgrounds}
        selectedId={selectedId}
        onSelect={handleSelect}
      />
    </StepLayout>
  )
}
