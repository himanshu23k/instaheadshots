import { TooltipProvider } from '@/components/ui/tooltip'
import { useJourneyStore } from '@/store/journey-store'
import { EntrySheet } from '@/components/entry-sheet/EntrySheet'
import { AppShell } from '@/components/layout/AppShell'
import { FinalPreview } from '@/components/final-preview/FinalPreview'
import { FaceSelection } from '@/components/steps/FaceSelection'
import { PostureSelection } from '@/components/steps/PostureSelection'
import { BackgroundSelection } from '@/components/steps/BackgroundSelection'
import { OutfitSelection } from '@/components/steps/OutfitSelection'
import { AIPromptRefinement } from '@/components/steps/AIPromptRefinement'
import { MagicEraser } from '@/components/steps/MagicEraser'
import type { StepId } from '@/types'

const STEP_COMPONENTS: Record<StepId, React.ComponentType> = {
  face: FaceSelection,
  posture: PostureSelection,
  background: BackgroundSelection,
  outfit: OutfitSelection,
  'ai-prompt': AIPromptRefinement,
  eraser: MagicEraser,
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

function App() {
  const view = useJourneyStore((s) => s.view)

  return (
    <TooltipProvider>
      {view === 'entry' && <EntrySheet />}
      {view === 'journey' && <EditJourney />}
      {view === 'final' && <FinalPreview />}
    </TooltipProvider>
  )
}

export default App
