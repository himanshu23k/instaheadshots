import { ArrowLeft } from 'lucide-react'
import { CreditIndicator } from '@/components/common/CreditIndicator'
import { useJourneyStore } from '@/store/journey-store'
import { STEPS } from '@/constants/steps'

export function Header() {
  const currentStep = useJourneyStore((s) => s.currentStep)
  const view = useJourneyStore((s) => s.view)
  const reset = useJourneyStore((s) => s.reset)
  const isRendering = useJourneyStore(
    (s) => s.renderStates[s.currentStep]?.status === 'loading'
  )

  const stepDef = STEPS.find((s) => s.id === currentStep)

  const handleBack = () => {
    if (window.confirm('Exit editing? Your applied edits are saved in your gallery. Any unapplied selections will be lost.')) {
      reset()
    }
  }

  if (view !== 'journey') return null

  return (
    <header
      className={`flex items-center justify-between px-4 py-3 bg-surface border-b border-ih-border ${
        isRendering ? 'opacity-40 pointer-events-none' : ''
      }`}
    >
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-ih-muted hover:text-primary-cta transition-colors"
        aria-label="Exit editing"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-[14px] font-medium hidden sm:inline">Exit</span>
      </button>

      <h1 className="text-[18px] font-medium text-primary-cta">
        {stepDef?.label || 'Edit'}
      </h1>

      <CreditIndicator />
    </header>
  )
}
