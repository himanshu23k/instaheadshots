import { useState, useRef, useCallback } from 'react'
import { useStudioStore } from '@/store/studio-store'
import { useCreditStore } from '@/store/credit-store'
import { simulateStudioRender } from '@/services/mock-render'
import type { StationId } from '@/types/studio'

export function useStudioRender() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const startReveal = useStudioStore((s) => s.startReveal)
  const completeReveal = useStudioStore((s) => s.completeReveal)
  const cancelReveal = useStudioStore((s) => s.cancelReveal)

  const applyAtStation = useCallback(
    async (station: StationId, optionId: string): Promise<boolean> => {
      // Check credits
      const creditStore = useCreditStore.getState()
      const storeSnapshot = useStudioStore.getState()
      const refinePrompt =
        station === 'refine'
          ? storeSnapshot.stationSelections.refine.prompt.trim()
          : ''
      /** Refine: slider-only applies (no Iris prompt text) never consume credits */
      const isRefineManualOnly = station === 'refine' && refinePrompt.length === 0
      const isFreeByHistory = creditStore.isTransformationFree(station, optionId)
      const effectiveFree = isFreeByHistory || isRefineManualOnly

      if (!effectiveFree && !creditStore.canAfford(1)) {
        setError('Not enough credits')
        return false
      }

      // Cancel any in-flight render
      if (abortRef.current) abortRef.current.abort()
      abortRef.current = new AbortController()

      setLoading(true)
      setError(null)
      startReveal(station)

      try {
        const store = useStudioStore.getState()
        const userPrompt = store.irisGoalByStation[station].trim() || undefined
        const result = await simulateStudioRender(
          station,
          optionId,
          abortRef.current.signal,
          userPrompt
        )

        if (result.success) {
          // Decide charge before clearing Iris text; refine uses station prompt field (not full Iris string)
          const latest = useStudioStore.getState()
          const refinePromptAtApply =
            station === 'refine'
              ? latest.stationSelections.refine.prompt.trim()
              : ''
          const isRefineManualOnlyAtApply =
            station === 'refine' && refinePromptAtApply.length === 0
          const shouldDeductCredit =
            !creditStore.isTransformationFree(station, optionId) &&
            !isRefineManualOnlyAtApply

          if (shouldDeductCredit) {
            creditStore.deductCredit(station, optionId)
          }

          latest.clearIrisGoalForStation(station)

          // Start reveal animation
          useStudioStore.getState().startReveal(station, 'single')
          // Brief delay for reveal phase to show
          await new Promise((r) => setTimeout(r, 100))
          useStudioStore.setState({ revealPhase: 'revealing' })
          await new Promise((r) => setTimeout(r, result.revealDuration || 600))

          completeReveal(result.imageUrl)
          setLoading(false)
          return true
        } else {
          setError(result.error || 'Render failed')
          cancelReveal()
          setLoading(false)
          return false
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          cancelReveal()
          setLoading(false)
          return false
        }
        setError('Something went wrong')
        cancelReveal()
        setLoading(false)
        return false
      }
    },
    [startReveal, completeReveal, cancelReveal]
  )

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
  }, [])

  return { loading, error, applyAtStation, cancel }
}
