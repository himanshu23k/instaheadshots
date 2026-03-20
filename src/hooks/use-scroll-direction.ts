import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * Returns a ref to attach to a scrollable element and whether
 * the user is scrolling down (true) or up/idle (false).
 */
export function useScrollDirection() {
  const [hidden, setHidden] = useState(false)
  const lastScrollTop = useRef(0)
  const threshold = 8

  const onScroll = useCallback((e: Event) => {
    const target = e.target as HTMLElement
    const scrollTop = target.scrollTop
    if (Math.abs(scrollTop - lastScrollTop.current) < threshold) return
    setHidden(scrollTop > lastScrollTop.current && scrollTop > 20)
    lastScrollTop.current = scrollTop
  }, [])

  const scrollRef = useCallback(
    (node: HTMLElement | null) => {
      if (node) {
        node.addEventListener('scroll', onScroll, { passive: true })
      }
    },
    [onScroll]
  )

  return { scrollRef, hidden }
}

// Lightweight global signal so StepLayout can tell StepTrackerMobile to hide
let listeners: Array<(h: boolean) => void> = []

export function emitScrollHidden(h: boolean) {
  listeners.forEach((fn) => fn(h))
}

export function useScrollHidden() {
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    listeners.push(setHidden)
    return () => {
      listeners = listeners.filter((fn) => fn !== setHidden)
    }
  }, [])
  return hidden
}
