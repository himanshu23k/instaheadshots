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
      const isFree = creditStore.isTransformationFree(station, optionId)
      if (!isFree && !creditStore.canAfford(1)) {
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
        const result = await simulateStudioRender(
          station,
          optionId,
          abortRef.current.signal
        )

        if (result.success) {
          // Deduct credit
          if (!isFree) {
            creditStore.deductCredit(station, optionId)
          }

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
