import { Routes, Route, Navigate } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useJourneyStore } from '@/store/journey-store'
import { GalleryView } from '@/components/gallery/GalleryView'
import { EditModal } from '@/components/gallery/EditModal'
import { AppShell } from '@/components/layout/AppShell'
import { FinalPreview } from '@/components/final-preview/FinalPreview'
import { FaceSelection } from '@/components/steps/FaceSelection'
import { PostureSelection } from '@/components/steps/PostureSelection'
import { BackgroundSelection } from '@/components/steps/BackgroundSelection'
import { OutfitSelection } from '@/components/steps/OutfitSelection'
import { AIPromptRefinement } from '@/components/steps/AIPromptRefinement'
import { MagicEraser } from '@/components/steps/MagicEraser'
import { StudioShell } from '@/components/v2/StudioShell'
import type { StepId } from '@/types'

const STEP_COMPONENTS: Record<StepId, React.ComponentType> = {
  face: FaceSelection,
  posture: PostureSelection,
  background: BackgroundSelection,
  outfit: OutfitSelection,
  'ai-prompt': AIPromptRefinement,
  edits: MagicEraser,
}

function EditJourney() {
  const currentStep = useJourneyStore((s) => s.currentStep)
  const StepComponent = STEP_COMPONENTS[currentStep]

  return (
    <AppShell>
      <StepComponent />
    </AppShell>
  )
}

/** v1 edit experience — state-driven views */
function V1App() {
  const view = useJourneyStore((s) => s.view)

  return (
    <>
      {view === 'entry' && (
        <>
          <GalleryView />
          <EditModal />
        </>
      )}
      {view === 'journey' && <EditJourney />}
      {view === 'final' && <FinalPreview />}
    </>
  )
}

function App() {
  return (
    <TooltipProvider>
      <Routes>
        <Route path="/" element={<V1App />} />
        <Route path="/edit-v2" element={<StudioShell />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </TooltipProvider>
  )
}

export default App
