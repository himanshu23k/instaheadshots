import { useJourneyStore } from '@/store/journey-store'
import { STEP_MAP } from '@/constants/steps'
import {
  User,
  Move,
  Image,
  Shirt,
  Sparkles,
  Eraser,
} from 'lucide-react'
import type { StepId } from '@/types'

const STEP_ICONS: Record<StepId, React.ElementType> = {
  face: User,
  posture: Move,
  background: Image,
  outfit: Shirt,
  'ai-prompt': Sparkles,
  eraser: Eraser,
}

export function EditSummaryStrip() {
  const appliedTransformations = useJourneyStore((s) => s.appliedTransformations)

  const entries = Array.from(appliedTransformations.entries())

  if (entries.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {entries.map(([stepId, selection]) => {
        const Icon = STEP_ICONS[stepId]
        const stepDef = STEP_MAP[stepId]
        return (
          <div
            key={stepId}
            className="flex-shrink-0 flex items-center gap-1.5 border border-ih-border rounded-[var(--radius-chip)] px-2.5 py-1 text-[12px]"
          >
            <Icon className="w-3.5 h-3.5 text-ih-muted" />
            <span className="text-primary-cta font-medium">
              {stepDef.shortLabel}:
            </span>
            <span className="text-ih-muted truncate max-w-[100px]">
              {selection.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
