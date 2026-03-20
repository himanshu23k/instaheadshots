import { STEPS, getStepIndex } from '@/constants/steps'
import { useJourneyStore } from '@/store/journey-store'

export function StepTrackerMobile() {
  const currentStep = useJourneyStore((s) => s.currentStep)
  const completedSteps = useJourneyStore((s) => s.completedSteps)
  const currentIndex = getStepIndex(currentStep)
  const stepDef = STEPS[currentIndex]

  return (
    <div className="lg:hidden flex flex-col items-center gap-2 py-3 bg-surface border-b border-ih-border">
      <p className="text-[14px] font-medium text-primary-cta">
        Step {currentIndex + 1} of {STEPS.length} — {stepDef.shortLabel}
      </p>
      <div className="flex items-center gap-2.5" role="list" aria-label="Step progress">
        {STEPS.map((step) => {
          const isActive = step.id === currentStep
          const isCompleted = completedSteps.has(step.id)

          return (
            <div
              key={step.id}
              role="listitem"
              aria-current={isActive ? 'step' : undefined}
              aria-label={`${step.shortLabel}${isCompleted ? ' (completed)' : isActive ? ' (current)' : ''}`}
              className={`
                rounded-full transition-all
                ${isActive
                  ? 'w-3 h-3 bg-primary-cta'
                  : isCompleted
                  ? 'w-2.5 h-2.5 bg-ih-accent'
                  : 'w-2.5 h-2.5 border border-ih-disabled bg-transparent'
                }
              `}
            />
          )
        })}
      </div>
    </div>
  )
}
