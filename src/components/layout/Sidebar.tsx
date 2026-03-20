import { STEPS } from '@/constants/steps'
import { useJourneyStore } from '@/store/journey-store'
import {
  User,
  Move,
  Image,
  Shirt,
  Sparkles,
  Eraser,
} from 'lucide-react'
import { Check } from 'lucide-react'
import type { StepId } from '@/types'

const STEP_ICONS: Record<StepId, React.ElementType> = {
  face: User,
  posture: Move,
  background: Image,
  outfit: Shirt,
  'ai-prompt': Sparkles,
  edits: Eraser,
}

export function Sidebar() {
  const currentStep = useJourneyStore((s) => s.currentStep)
  const completedSteps = useJourneyStore((s) => s.completedSteps)
  const navigateToStep = useJourneyStore((s) => s.navigateToStep)
  const isRendering = useJourneyStore(
    (s) => s.renderStates[s.currentStep]?.status === 'loading'
  )

  const completedCount = completedSteps.size
  const totalSteps = STEPS.length
  const progressPercent = Math.round((completedCount / totalSteps) * 100)

  return (
    <nav
      className={`w-[var(--sidebar-width)] bg-surface border-r border-ih-border p-4 hidden lg:block flex-shrink-0 ${
        isRendering ? 'opacity-40 pointer-events-none' : ''
      }`}
      aria-label="Edit steps"
    >
      {/* Progress indicator */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] font-medium text-primary-cta">Progress</span>
          <span className="text-[11px] text-ih-muted">
            {completedCount}/{totalSteps}
          </span>
        </div>
        <div className="w-full h-1.5 bg-ih-border rounded-full overflow-hidden">
          <div
            className="h-full bg-ih-accent rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <ul className="space-y-1" role="list">
        {STEPS.map((step) => {
          const Icon = STEP_ICONS[step.id]
          const isActive = step.id === currentStep
          const isCompleted = completedSteps.has(step.id)

          return (
            <li key={step.id} role="listitem">
              <button
                onClick={() => navigateToStep(step.id)}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 rounded-[var(--radius-btn)] text-[14px] transition-colors
                  ${isActive
                    ? 'bg-ih-accent-bg text-ih-accent font-medium'
                    : isCompleted
                    ? 'text-primary-cta hover:bg-gray-50'
                    : 'text-ih-muted hover:bg-gray-50'
                  }
                `}
                aria-current={isActive ? 'step' : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{step.shortLabel}</span>
                {isCompleted && !isActive && (
                  <span className="w-4 h-4 rounded-full bg-ih-accent flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
