import type { Step, StepId } from '@/types'

export const STEPS: Step[] = [
  { id: 'face', label: 'Face Selection', shortLabel: 'Face', cost: 0, dependsOn: [] },
  { id: 'posture', label: 'Posture Selection', shortLabel: 'Posture', cost: 1, dependsOn: ['face'] },
  { id: 'background', label: 'Change Background', shortLabel: 'Background', cost: 1, dependsOn: ['face', 'posture'] },
  { id: 'outfit', label: 'Change Outfit', shortLabel: 'Outfit', cost: 1, dependsOn: ['face', 'posture'] },
  { id: 'ai-prompt', label: 'AI Refinement', shortLabel: 'AI Refine', cost: 1, dependsOn: ['face', 'posture', 'background', 'outfit'] },
  { id: 'edits', label: 'Edits', shortLabel: 'Edits', cost: 0, dependsOn: ['face', 'posture', 'background', 'outfit', 'ai-prompt'] },
]

export const STEP_MAP = Object.fromEntries(STEPS.map(s => [s.id, s])) as Record<StepId, Step>

/**
 * Get the list of steps that must be reset when navigating back to `targetStep`.
 * A step is reset if it depends (directly or transitively) on any step
 * that comes at or after `targetStep` in the journey order.
 */
export function getStepsToReset(targetStep: StepId): StepId[] {
  const targetIndex = STEPS.findIndex(s => s.id === targetStep)
  // All steps after the target that have already been visited could be affected
  const laterSteps = STEPS.slice(targetIndex + 1)

  return laterSteps
    .filter(step => {
      // A step needs reset if it depends on the target step
      // (meaning the target step's output feeds into it)
      return step.dependsOn.includes(targetStep)
    })
    .map(s => s.id)
}

/**
 * Check if going back from currentStep to targetStep requires a cascade reset.
 * Background and Outfit are independent — going back to one doesn't reset the other.
 */
export function requiresCascadeReset(currentStep: StepId, targetStep: StepId): boolean {
  const targetIndex = STEPS.findIndex(s => s.id === targetStep)
  const currentIndex = STEPS.findIndex(s => s.id === currentStep)

  // Only relevant when going backwards
  if (targetIndex >= currentIndex) return false

  // Face/Posture changes cascade everything after them
  if (targetStep === 'face' || targetStep === 'posture') return true

  // Background and Outfit are independent of each other
  // Going back to Background doesn't reset Outfit and vice versa
  // But going back to either resets AI Prompt and Edits
  if (targetStep === 'background' || targetStep === 'outfit') {
    // Only cascade if we're currently past AI Prompt or Eraser
    // and those steps have been applied
    return currentIndex > STEPS.findIndex(s => s.id === 'ai-prompt')
  }

  return false
}

export function getStepIndex(stepId: StepId): number {
  return STEPS.findIndex(s => s.id === stepId)
}
