import { useRef, useCallback, useEffect } from 'react'

interface UseSwipeOptions {
  onSwipeLeft: () => void
  onSwipeRight: () => void
  threshold?: number
  enabled?: boolean
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  enabled = true,
}: UseSwipeOptions) {
  const startX = useRef(0)
  const startY = useRef(0)
  const tracking = useRef(false)

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return
      startX.current = e.touches[0].clientX
      startY.current = e.touches[0].clientY
      tracking.current = true
    },
    [enabled]
  )

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !tracking.current) return
      tracking.current = false

      const endX = e.changedTouches[0].clientX
      const endY = e.changedTouches[0].clientY
      const deltaX = endX - startX.current
      const deltaY = endY - startY.current

      // Only trigger if horizontal movement exceeds vertical (prevents scroll hijacking)
      if (Math.abs(deltaX) < threshold || Math.abs(deltaX) < Math.abs(deltaY)) {
        return
      }

      if (deltaX < 0) {
        onSwipeLeft()
      } else {
        onSwipeRight()
      }
    },
    [enabled, threshold, onSwipeLeft, onSwipeRight]
  )

  const swipeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = swipeRef.current
    if (!node || !enabled) return

    node.addEventListener('touchstart', handleTouchStart, { passive: true })
    node.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      node.removeEventListener('touchstart', handleTouchStart)
      node.removeEventListener('touchend', handleTouchEnd)
    }
  }, [enabled, handleTouchStart, handleTouchEnd])

  return { swipeRef }
}
