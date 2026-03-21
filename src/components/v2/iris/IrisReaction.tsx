import { useEffect, useState, useRef } from 'react'
import { useStudioStore } from '@/store/studio-store'

export function IrisReaction() {
  const reaction = useStudioStore((s) => s.irisReaction)
  const setIrisReaction = useStudioStore((s) => s.setIrisReaction)
  const [visible, setVisible] = useState(false)
  const [displayText, setDisplayText] = useState('')
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    // Clear any running timers
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    if (!reaction) {
      setVisible(false)
      // Clear display text after fade-out transition (300ms)
      const clearTextTimer = setTimeout(() => setDisplayText(''), 350)
      timersRef.current = [clearTextTimer]
      return () => { clearTimeout(clearTextTimer) }
    }

    setDisplayText(reaction)

    // Slight delay so the DOM renders with opacity 0, then transition to 1
    const showTimer = setTimeout(() => setVisible(true), 20)

    // Hold for 1.5s then fade out
    const hideTimer = setTimeout(() => setVisible(false), 1700)

    // Clear reaction state after fade-out completes (300ms)
    const clearTimer = setTimeout(() => {
      setIrisReaction(null)
    }, 2000)

    timersRef.current = [showTimer, hideTimer, clearTimer]

    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [reaction, setIrisReaction])

  if (!displayText && !visible) return null

  return (
    <div
      className="py-2 px-4 text-center shrink-0"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${visible ? '200ms' : '300ms'} ease`,
      }}
      role="status"
      aria-live="polite"
    >
      <p className="text-[12px] text-ih-muted italic">{displayText}</p>
    </div>
  )
}
