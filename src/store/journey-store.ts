import { create } from 'zustand'
import type { AppView, JourneyMode, RenderState, Selection, StepId } from '@/types'
import { STEPS, getStepIndex } from '@/constants/steps'

interface JourneyState {
  // View management
  view: AppView
  journeyMode: JourneyMode | null

  // Step navigation
  currentStep: StepId
  completedSteps: Set<StepId>

  // Selections (per step, before apply)
  selections: Record<StepId, Selection | null>

  // Applied transformations (after successful render)
  appliedTransformations: Map<StepId, Selection>

  // Track unique transforms for credit-free re-apply
  transformationHistory: Set<string> // "step:optionId" strings

  // Render state per step
  renderStates: Record<StepId, RenderState>

  // Pending navigation (for cascade confirm)
  pendingNavigation: { target: StepId; stepsToReset: StepId[] } | null

  // Before image (original face)
  originalImage: string

  // Toast
  toast: { message: string; visible: boolean }

  // Out of credits modal
  showOutOfCredits: boolean

  // Actions
  setView: (view: AppView) => void
  startJourney: (mode: JourneyMode, startStep?: StepId) => void
  setCurrentStep: (step: StepId) => void
  setSelection: (step: StepId, selection: Selection | null) => void
  applyTransformation: (step: StepId, selection: Selection) => void
  completeStep: (step: StepId) => void
  setRenderState: (step: StepId, state: RenderState) => void
  navigateToStep: (targetStep: StepId) => void
  confirmNavigation: () => void
  cancelNavigation: () => void
  cascadeReset: (fromStep: StepId) => void
  showToast: (message: string) => void
  hideToast: () => void
  setShowOutOfCredits: (show: boolean) => void
  reset: () => void
  finishJourney: () => void
  backToEditing: () => void
}

const defaultRenderState: RenderState = { status: 'idle', startedAt: null, error: null }

const initialSelections: Record<StepId, Selection | null> = {
  face: null,
  posture: null,
  background: null,
  outfit: null,
  'ai-prompt': null,
  eraser: null,
}

const initialRenderStates: Record<StepId, RenderState> = {
  face: { ...defaultRenderState },
  posture: { ...defaultRenderState },
  background: { ...defaultRenderState },
  outfit: { ...defaultRenderState },
  'ai-prompt': { ...defaultRenderState },
  eraser: { ...defaultRenderState },
}

export const useJourneyStore = create<JourneyState>((set, get) => ({
  view: 'entry',
  journeyMode: null,
  currentStep: 'face',
  completedSteps: new Set(),
  selections: { ...initialSelections },
  appliedTransformations: new Map(),
  transformationHistory: new Set(),
  renderStates: { ...initialRenderStates },
  pendingNavigation: null,
  originalImage: '/mock/faces/face-01.jpg',
  toast: { message: '', visible: false },
  showOutOfCredits: false,

  setView: (view) => set({ view }),

  startJourney: (mode, startStep) => {
    set({
      view: 'journey',
      journeyMode: mode,
      currentStep: startStep || 'face',
      completedSteps: new Set(),
      selections: { ...initialSelections },
      appliedTransformations: new Map(),
      renderStates: { ...initialRenderStates },
      pendingNavigation: null,
    })
  },

  setCurrentStep: (step) => set({ currentStep: step }),

  setSelection: (step, selection) =>
    set((state) => ({
      selections: { ...state.selections, [step]: selection },
    })),

  applyTransformation: (step, selection) =>
    set((state) => {
      const newApplied = new Map(state.appliedTransformations)
      newApplied.set(step, selection)
      const newHistory = new Set(state.transformationHistory)
      newHistory.add(`${step}:${selection.optionId}`)
      return {
        appliedTransformations: newApplied,
        transformationHistory: newHistory,
      }
    }),

  completeStep: (step) =>
    set((state) => {
      const newCompleted = new Set(state.completedSteps)
      newCompleted.add(step)
      return { completedSteps: newCompleted }
    }),

  setRenderState: (step, renderState) =>
    set((state) => ({
      renderStates: { ...state.renderStates, [step]: renderState },
    })),

  navigateToStep: (targetStep) => {
    const state = get()
    const targetIndex = getStepIndex(targetStep)
    const currentIndex = getStepIndex(state.currentStep)

    // Going forward or to same step — no cascade
    if (targetIndex >= currentIndex) {
      set({ currentStep: targetStep })
      return
    }

    // Going backwards — check if cascade reset is needed
    // Face/Posture changes cascade everything
    if (targetStep === 'face' || targetStep === 'posture') {
      const stepsAfterTarget = STEPS.slice(targetIndex + 1)
        .filter((s) => state.appliedTransformations.has(s.id))
        .map((s) => s.id)

      if (stepsAfterTarget.length > 0) {
        set({ pendingNavigation: { target: targetStep, stepsToReset: stepsAfterTarget } })
        return
      }
    }

    // Background/Outfit are independent — going back to one doesn't reset the other
    // But AI Prompt and Eraser depend on both
    if (targetStep === 'background' || targetStep === 'outfit') {
      const dependentSteps: StepId[] = ['ai-prompt', 'eraser']
      const stepsToReset = dependentSteps.filter((s) => state.appliedTransformations.has(s))

      if (stepsToReset.length > 0) {
        set({ pendingNavigation: { target: targetStep, stepsToReset } })
        return
      }
    }

    set({ currentStep: targetStep })
  },

  confirmNavigation: () => {
    const state = get()
    if (!state.pendingNavigation) return

    const { target, stepsToReset } = state.pendingNavigation
    const newApplied = new Map(state.appliedTransformations)
    const newCompleted = new Set(state.completedSteps)
    const newSelections = { ...state.selections }
    const newRenderStates = { ...state.renderStates }

    for (const stepId of stepsToReset) {
      newApplied.delete(stepId)
      newCompleted.delete(stepId)
      newSelections[stepId] = null
      newRenderStates[stepId] = { ...defaultRenderState }
    }

    set({
      currentStep: target,
      appliedTransformations: newApplied,
      completedSteps: newCompleted,
      selections: newSelections,
      renderStates: newRenderStates,
      pendingNavigation: null,
    })
  },

  cancelNavigation: () => set({ pendingNavigation: null }),

  cascadeReset: (fromStep) => {
    const state = get()
    const fromIndex = getStepIndex(fromStep)
    const stepsToReset = STEPS.slice(fromIndex + 1).map((s) => s.id)

    const newApplied = new Map(state.appliedTransformations)
    const newCompleted = new Set(state.completedSteps)
    const newSelections = { ...state.selections }
    const newRenderStates = { ...state.renderStates }

    for (const stepId of stepsToReset) {
      newApplied.delete(stepId)
      newCompleted.delete(stepId)
      newSelections[stepId] = null
      newRenderStates[stepId] = { ...defaultRenderState }
    }

    set({
      appliedTransformations: newApplied,
      completedSteps: newCompleted,
      selections: newSelections,
      renderStates: newRenderStates,
    })
  },

  showToast: (message) => {
    set({ toast: { message, visible: true } })
    setTimeout(() => {
      set({ toast: { message: '', visible: false } })
    }, 4000)
  },

  hideToast: () => set({ toast: { message: '', visible: false } }),

  setShowOutOfCredits: (show) => set({ showOutOfCredits: show }),

  reset: () =>
    set({
      view: 'entry',
      journeyMode: null,
      currentStep: 'face',
      completedSteps: new Set(),
      selections: { ...initialSelections },
      appliedTransformations: new Map(),
      transformationHistory: new Set(),
      renderStates: { ...initialRenderStates },
      pendingNavigation: null,
      toast: { message: '', visible: false },
      showOutOfCredits: false,
    }),

  finishJourney: () => set({ view: 'final' }),

  backToEditing: () => set({ view: 'journey' }),
}))
