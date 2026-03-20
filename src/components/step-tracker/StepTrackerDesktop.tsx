import { STEPS } from '@/constants/steps'
import { useJourneyStore } from '@/store/journey-store'
import { Check } from 'lucide-react'

export function StepTrackerDesktop() {
  const currentStep = useJourneyStore((s) => s.currentStep)
  const completedSteps = useJourneyStore((s) => s.completedSteps)
  const navigateToStep = useJourneyStore((s) => s.navigateToStep)
  const isRendering = useJourneyStore(
    (s) => s.renderStates[s.currentStep]?.status === 'loading'
  )

  return (
    <div
      className={`hidden items-center gap-2 px-4 py-3 bg-surface border-b border-ih-border ${
        isRendering ? 'opacity-40 pointer-events-none' : ''
      }`}
      role="list"
      aria-label="Edit journey steps"
    >
      {STEPS.map((step, index) => {
        const isActive = step.id === currentStep
        const isCompleted = completedSteps.has(step.id)

        return (
          <div key={step.id} className="flex items-center" role="listitem">
            {index > 0 && (
              <div className="w-4 h-px bg-ih-border mx-1" aria-hidden="true" />
            )}
            <button
              onClick={() => navigateToStep(step.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-pill)] text-[12px] font-medium transition-colors
                ${isActive
                  ? 'bg-primary-cta text-white'
                  : isCompleted
                  ? 'bg-ih-accent-bg text-ih-accent'
                  : 'bg-transparent text-ih-disabled border border-ih-border'
                }
              `}
              aria-current={isActive ? 'step' : undefined}
            >
              {isCompleted && !isActive && (
                <Check className="w-3 h-3" aria-hidden="true" />
              )}
              {step.shortLabel}
            </button>
          </div>
        )
      })}
    </div>
  )
}
