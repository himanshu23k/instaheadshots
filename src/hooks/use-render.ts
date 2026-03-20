import { useCallback, useRef, useState } from 'react'
import type { RenderState, StepId } from '@/types'
import { simulateRender } from '@/services/mock-render'
import { useJourneyStore } from '@/store/journey-store'

interface UseRenderReturn {
  renderState: RenderState
  startRender: (step: StepId, optionId: string) => Promise<boolean>
  cancelRender: () => void
  resetRender: () => void
  showCancel: boolean
}

export function useRender(): UseRenderReturn {
  const [renderState, setRenderState] = useState<RenderState>({
    status: 'idle',
    startedAt: null,
    error: null,
  })
  const [showCancel, setShowCancel] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const cancelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const setStoreRenderState = useJourneyStore((s) => s.setRenderState)

  const cleanup = useCallback(() => {
    if (cancelTimerRef.current) {
      clearTimeout(cancelTimerRef.current)
      cancelTimerRef.current = null
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current)
      timeoutTimerRef.current = null
    }
    setShowCancel(false)
  }, [])

  const startRender = useCallback(
    async (step: StepId, optionId: string): Promise<boolean> => {
      // Abort any existing render
      abortControllerRef.current?.abort()
      cleanup()

      const controller = new AbortController()
      abortControllerRef.current = controller

      const loadingState: RenderState = {
        status: 'loading',
        startedAt: Date.now(),
        error: null,
      }
      setRenderState(loadingState)
      setStoreRenderState(step, loadingState)

      // Show cancel link after 3 seconds
      cancelTimerRef.current = setTimeout(() => {
        setShowCancel(true)
      }, 3000)

      // 30s timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutTimerRef.current = setTimeout(() => {
          reject(new Error('timeout'))
        }, 30000)
      })

      try {
        const result = await Promise.race([
          simulateRender(step, optionId, controller.signal),
          timeoutPromise,
        ])

        cleanup()

        if (result.success) {
          const successState: RenderState = {
            status: 'success',
            startedAt: null,
            error: null,
          }
          setRenderState(successState)
          setStoreRenderState(step, successState)
          return true
        } else {
          const failState: RenderState = {
            status: 'failure',
            startedAt: null,
            error: result.error || 'Render failed',
          }
          setRenderState(failState)
          setStoreRenderState(step, failState)
          return false
        }
      } catch (err) {
        cleanup()

        if (err instanceof DOMException && err.name === 'AbortError') {
          const cancelledState: RenderState = {
            status: 'cancelled',
            startedAt: null,
            error: null,
          }
          setRenderState(cancelledState)
          setStoreRenderState(step, cancelledState)
          return false
        }

        // Timeout or other error
        const timeoutState: RenderState = {
          status: err instanceof Error && err.message === 'timeout' ? 'timeout' : 'failure',
          startedAt: null,
          error: 'Something went wrong. Your credit was not charged. Try again.',
        }
        setRenderState(timeoutState)
        setStoreRenderState(step, timeoutState)
        return false
      }
    },
    [cleanup, setStoreRenderState]
  )

  const cancelRender = useCallback(() => {
    abortControllerRef.current?.abort()
    cleanup()
  }, [cleanup])

  const resetRender = useCallback(() => {
    setRenderState({ status: 'idle', startedAt: null, error: null })
    setShowCancel(false)
  }, [])

  return { renderState, startRender, cancelRender, resetRender, showCancel }
}
