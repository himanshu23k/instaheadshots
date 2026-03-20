import { STEPS, getStepIndex } from '@/constants/steps'
import { useJourneyStore } from '@/store/journey-store'
import { useScrollHidden } from '@/hooks/use-scroll-direction'
import {
  User,
  Move,
  Image,
  Shirt,
  Sparkles,
  Eraser,
  Check,
} from 'lucide-react'
import type { StepId } from '@/types'

const STEP_ICONS: Record<StepId, React.ElementType> = {
  face: User,
  posture: Move,
  background: Image,
  outfit: Shirt,
  'ai-prompt': Sparkles,
  edits: Eraser,
}

const STEP_SHORT: Record<StepId, string> = {
  face: 'Face',
  posture: 'Posture',
  background: 'BG',
  outfit: 'Outfit',
  'ai-prompt': 'AI',
  edits: 'Edit',
}

export function StepTrackerMobile() {
  const currentStep = useJourneyStore((s) => s.currentStep)
  const completedSteps = useJourneyStore((s) => s.completedSteps)
  const navigateToStep = useJourneyStore((s) => s.navigateToStep)
  const scrollHidden = useScrollHidden()
  const currentIndex = getStepIndex(currentStep)

  return (
    <div
      className={`lg:hidden bg-surface border-b border-ih-border transition-all duration-200 ${
        scrollHidden ? 'max-h-0 overflow-hidden opacity-0' : 'max-h-28 opacity-100'
      }`}
    >
      {/* Progress bar */}
      <div className="h-[3px] bg-ih-border">
        <div
          className="h-full bg-ih-accent transition-all duration-300"
          style={{ width: `${Math.round(((currentIndex + 1) / STEPS.length) * 100)}%` }}
        />
      </div>

      {/* Step icons row */}
      <div className="flex items-center px-1 py-1.5" role="list" aria-label="Step progress">
        {STEPS.map((step) => {
          const Icon = STEP_ICONS[step.id]
          const isActive = step.id === currentStep
          const isCompleted = completedSteps.has(step.id)
          return (
            <button
              key={step.id}
              type="button"
              role="listitem"
              aria-current={isActive ? 'step' : undefined}
              aria-label={`${step.shortLabel}${isCompleted ? ' (completed)' : isActive ? ' (current)' : ''}`}
              onClick={() => navigateToStep(step.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-1 rounded-[var(--radius-btn)] transition-colors ${
                isActive
                  ? 'text-ih-accent'
                  : isCompleted
                  ? 'text-primary-cta'
                  : 'text-ih-muted'
              }`}
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                {isCompleted && !isActive ? (
                  <div className="w-5 h-5 rounded-full bg-ih-accent flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span className={`text-[10px] leading-none ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {STEP_SHORT[step.id]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
