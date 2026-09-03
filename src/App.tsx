import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
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
import { HomePage } from '@/components/home/HomePage'
import { PaymentPlansSheet } from '@/components/payment-plans/PaymentPlansSheet'
import { UpsellPage } from '@/components/noor/upsell/UpsellPage'
import { ReferralPre } from '@/components/devansh/ReferralPre'
import { CreateProfilePage } from '@/components/create-profile/CreateProfilePage'
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

function V1App() {
  const view = useJourneyStore((s) => s.view)
  return (
    <>
      {view === 'entry' && (<><GalleryView /><EditModal /></>)}
      {view === 'journey' && <EditJourney />}
      {view === 'final' && <FinalPreview />}
    </>
  )
}

function AppRoutes() {
  const location = useLocation()
  const state = location.state as { backgroundLocation?: ReturnType<typeof useLocation> } | null
  const bgLocation = state?.backgroundLocation
  const hasModal = !!bgLocation

  return (
    <>
      {/* Black base visible behind the scaled-down page */}
      <div className="fixed inset-0 bg-black" />

      {/* Page — scales down while a sheet is open, driven by framer motion (no CSS timing hacks) */}
      <motion.div
        className="fixed inset-0 overflow-hidden"
        style={{ willChange: 'transform', transformOrigin: 'top center' }}
        animate={{
          scale: hasModal ? 0.93 : 1,
          y: hasModal ? 8 : 0,
          borderRadius: hasModal ? 12 : 0,
        }}
        transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
      >
        <Routes location={bgLocation ?? location}>
          <Route path="/" element={<V1App />} />
          <Route path="/edit-v2" element={<StudioShell />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/create-profile" element={<CreateProfilePage />} />
          <Route path="/noor/upsell" element={<UpsellPage />} />
          <Route path="/devansh/referral-pre" element={<ReferralPre />} />
          {/* Prevent /payment-plans from rendering inside the scaled background */}
          <Route path="/payment-plans" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>

      {/* Sheet overlay — rendered on top, always when at /payment-plans */}
      <Routes>
        <Route path="/payment-plans" element={<PaymentPlansSheet />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <TooltipProvider>
      <AppRoutes />
    </TooltipProvider>
  )
}

export default App
