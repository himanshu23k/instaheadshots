import { useState, useCallback } from 'react'
import { StepLayout } from '@/components/layout/StepLayout'
import { OptionGrid } from '@/components/common/OptionGrid'
import { CategoryTabs } from '@/components/common/CategoryTabs'
import { CreditActionButton } from '@/components/common/CreditActionButton'
import { CreditForecastBanner } from '@/components/common/CreditForecastBanner'
import { BeforeAfterToggle } from '@/components/common/BeforeAfterToggle'
import { RenderOverlay } from '@/components/common/RenderOverlay'
import { ShopOutfitPanel } from '@/components/outfit/ShopOutfitPanel'
import { useJourneyStore } from '@/store/journey-store'
import { useRender } from '@/hooks/use-render'
import { useCredit } from '@/hooks/use-credit'
import outfitsData from '@/data/outfits.json'

const OUTFIT_TABS = ['All', 'Formal', 'Business Casual', 'Smart Casual', 'Ethnic']

export function OutfitSelection() {
  const [activeTab, setActiveTab] = useState('All')
  const [previewMode, setPreviewMode] = useState<'before' | 'after'>('after')

  const selection = useJourneyStore((s) => s.selections.outfit)
  const applied = useJourneyStore((s) => s.appliedTransformations.get('outfit'))
  const setSelection = useJourneyStore((s) => s.setSelection)
  const applyTransformation = useJourneyStore((s) => s.applyTransformation)
  const completeStep = useJourneyStore((s) => s.completeStep)
  const setCurrentStep = useJourneyStore((s) => s.setCurrentStep)
  const showToast = useJourneyStore((s) => s.showToast)
  const originalImage = useJourneyStore((s) => s.originalImage)

  const { renderState, startRender, cancelRender, showCancel } = useRender()
  const selectedId = selection?.optionId || null
  const { cost, isFree, canAfford, deduct } = useCredit('outfit', selectedId)

  const isShopTab = activeTab === 'Shop'
  const filteredOutfits = activeTab === 'All'
    ? outfitsData
    : outfitsData.filter((o) => o.category === activeTab)

  const selectedOutfit = outfitsData.find((o) => o.id === selectedId)
  const previewSrc = applied
    ? previewMode === 'before'
      ? originalImage
      : applied.renderResult || originalImage
    : selectedOutfit?.thumbnail || originalImage

  const handleSelect = (id: string) => {
    const outfit = outfitsData.find((o) => o.id === id)
    if (outfit) {
      setSelection('outfit', {
        optionId: outfit.id,
        label: outfit.name,
        thumbnail: outfit.thumbnail,
        renderResult: outfit.renderResult,
      })
    }
  }

  const handleShopSelect = (id: string, label: string, thumbnail: string) => {
    setSelection('outfit', {
      optionId: id,
      label,
      thumbnail,
      renderResult: thumbnail,
    })
  }

  const handleApply = useCallback(async () => {
    if (!selectedId || !canAfford) return

    const success = await startRender('outfit', selectedId)
    if (success && selection) {
      deduct()
      applyTransformation('outfit', selection)
      completeStep('outfit')
      showToast('Outfit applied')
      setCurrentStep('ai-prompt')
    }
  }, [selectedId, canAfford, selection, startRender, deduct, applyTransformation, completeStep, setCurrentStep, showToast])

  return (
    <StepLayout
      previewSrc={previewSrc}
      previewAlt="Outfit preview"
      previewOverlay={
        renderState.status === 'loading' ? (
          <RenderOverlay
            actionName="outfit"
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
      <h2 className="text-[18px] font-medium mb-4">Change outfit</h2>

      <CreditForecastBanner stepCost={1} />

      <CategoryTabs
        tabs={OUTFIT_TABS}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        actionLabel="Shop"
        onActionClick={() => setActiveTab('Shop')}
        actionActive={isShopTab}
      />

      {isShopTab ? (
        <ShopOutfitPanel onSelectOutfit={handleShopSelect} />
      ) : (
        <OptionGrid
          items={filteredOutfits}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      )}

      <div className="mt-4 sticky bottom-0 bg-surface pt-2 pb-1">
        {renderState.status === 'failure' && (
          <p className="text-ih-danger text-[12px] mb-2" role="alert">
            {renderState.error}
          </p>
        )}
        <CreditActionButton
          label="Apply Outfit →"
          cost={1}
          isFree={isFree}
          disabled={!selectedId || renderState.status === 'loading'}
          loading={renderState.status === 'loading'}
          onClick={handleApply}
        />
      </div>
    </StepLayout>
  )
}
