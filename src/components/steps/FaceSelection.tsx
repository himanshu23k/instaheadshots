import { useState } from 'react'
import { StepLayout } from '@/components/layout/StepLayout'
import { OptionGrid } from '@/components/common/OptionGrid'
import { CategoryTabs } from '@/components/common/CategoryTabs'
import { CreditActionButton } from '@/components/common/CreditActionButton'
import { useJourneyStore } from '@/store/journey-store'
import facesData from '@/data/faces.json'

const FACE_TABS = ['All', 'Social', 'Dating', 'Favorites']

export function FaceSelection() {
  const [activeTab, setActiveTab] = useState('All')
  const selection = useJourneyStore((s) => s.selections.face)
  const setSelection = useJourneyStore((s) => s.setSelection)
  const completeStep = useJourneyStore((s) => s.completeStep)
  const setCurrentStep = useJourneyStore((s) => s.setCurrentStep)

  const filteredFaces =
    activeTab === 'All'
      ? facesData
      : facesData.filter((f) => f.album === activeTab)

  const selectedId = selection?.optionId || 'face-01'
  const previewSrc =
    facesData.find((f) => f.id === selectedId)?.thumbnail || '/mock/faces/face-01.jpg'

  const handleSelect = (id: string) => {
    const face = facesData.find((f) => f.id === id)
    if (face) {
      setSelection('face', {
        optionId: face.id,
        label: face.name,
        thumbnail: face.thumbnail,
      })
    }
  }

  const handleConfirm = () => {
    if (!selection) {
      // Default to first face
      const defaultFace = facesData[0]
      setSelection('face', {
        optionId: defaultFace.id,
        label: defaultFace.name,
        thumbnail: defaultFace.thumbnail,
      })
    }
    completeStep('face')
    setCurrentStep('posture')
  }

  return (
    <StepLayout previewSrc={previewSrc} previewAlt="Selected face preview">
      <h2 className="text-[18px] font-medium mb-1">Choose your face</h2>
      <p className="text-[12px] text-ih-muted mb-4">
        All edits apply to this image.
      </p>

      <CategoryTabs
        tabs={FACE_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <OptionGrid
        items={filteredFaces}
        selectedId={selectedId}
        onSelect={handleSelect}
        columns={3}
      />

      <div className="mt-4 sticky bottom-0 bg-surface pt-2 pb-1">
        <CreditActionButton
          label="Confirm Face →"
          cost={0}
          onClick={handleConfirm}
        />
      </div>
    </StepLayout>
  )
}
