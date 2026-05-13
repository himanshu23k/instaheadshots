import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Home, Album, Heart, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { clamp01, easeInQuint, easeOutQuint } from './easing'

type Tab = { id: 'home' | 'albums' | 'favourites'; label: string; Icon: LucideIcon }

const TABS: Tab[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'albums', label: 'Albums', Icon: Album },
  { id: 'favourites', label: 'Favourites', Icon: Heart },
]

const DURATION = 720
const LEAD_TIME_MULTIPLIER = 1.55
const MAX_SQUASH = 0.10

export function BottomNav() {
  const [activeIndex, setActiveIndex] = useState(0)

  const navRef = useRef<HTMLElement | null>(null)
  const indicatorRef = useRef<HTMLDivElement | null>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const rafIdRef = useRef<number | null>(null)
  const reducedMotionRef = useRef(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotionRef.current = mq.matches
    const onChange = () => {
      reducedMotionRef.current = mq.matches
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Position indicator under the active tab on mount and on resize.
  useLayoutEffect(() => {
    const setToActive = () => {
      const el = indicatorRef.current
      const tab = tabRefs.current[activeIndex]
      if (!el || !tab) return
      el.style.left = `${tab.offsetLeft}px`
      el.style.width = `${tab.offsetWidth}px`
      el.style.transform = 'scaleY(1)'
    }
    setToActive()
    window.addEventListener('resize', setToActive)
    return () => window.removeEventListener('resize', setToActive)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cancelAnim = () => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
  }

  const onTabClick = (toIndex: number) => {
    if (toIndex === activeIndex) return

    const indicator = indicatorRef.current
    const nav = navRef.current
    if (!indicator || !nav) {
      setActiveIndex(toIndex)
      return
    }

    // Capture current visual position (handles mid-flight interrupts).
    const navRect = nav.getBoundingClientRect()
    const indRect = indicator.getBoundingClientRect()
    const fromLeft = indRect.left - navRect.left
    const fromRight = indRect.right - navRect.left

    cancelAnim()

    const forward = toIndex > activeIndex
    setActiveIndex(toIndex)

    if (reducedMotionRef.current) {
      // Settle on next frame after labels begin transitioning.
      requestAnimationFrame(() => {
        const tab = tabRefs.current[toIndex]
        if (!tab) return
        indicator.style.transition = 'left 250ms ease, width 250ms ease'
        indicator.style.left = `${tab.offsetLeft}px`
        indicator.style.width = `${tab.offsetWidth}px`
        indicator.style.transform = 'scaleY(1)'
        window.setTimeout(() => {
          indicator.style.transition = ''
        }, 280)
      })
      return
    }

    const startTime = performance.now()

    const tick = (now: number) => {
      const target = tabRefs.current[toIndex]
      if (!target) {
        rafIdRef.current = null
        return
      }
      const toLeft = target.offsetLeft
      const toRight = target.offsetLeft + target.offsetWidth
      const restingWidth = target.offsetWidth

      const p = clamp01((now - startTime) / DURATION)

      // Leading edge sprints with a time multiplier; trailing edge lags.
      const leadP = clamp01(p * LEAD_TIME_MULTIPLIER)
      const trailP = p

      let left: number
      let right: number
      if (forward) {
        // Right edge leads, left edge trails.
        right = fromRight + (toRight - fromRight) * easeOutQuint(leadP)
        left = fromLeft + (toLeft - fromLeft) * easeInQuint(trailP)
      } else {
        // Left edge leads, right edge trails.
        left = fromLeft + (toLeft - fromLeft) * easeOutQuint(leadP)
        right = fromRight + (toRight - fromRight) * easeInQuint(trailP)
      }

      const width = Math.max(0, right - left)
      const stretch = Math.max(0, (width - restingWidth) / Math.max(1, restingWidth))
      const scaleY = 1 - MAX_SQUASH * Math.min(1, stretch)

      indicator.style.left = `${left}px`
      indicator.style.width = `${width}px`
      indicator.style.transform = `scaleY(${scaleY})`

      if (p < 1) {
        rafIdRef.current = requestAnimationFrame(tick)
      } else {
        // Settle precisely on resting geometry.
        indicator.style.left = `${toLeft}px`
        indicator.style.width = `${restingWidth}px`
        indicator.style.transform = 'scaleY(1)'
        rafIdRef.current = null
      }
    }

    rafIdRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => () => cancelAnim(), [])

  return (
    <nav
      ref={navRef}
      aria-label="Primary"
      className="relative h-[60px] bg-button-primary-default flex items-center px-1 pointer-events-auto"
      style={{ boxShadow: 'var(--shadow-03)' }}
    >
      <div
        ref={indicatorRef}
        aria-hidden
        className="absolute top-1 bottom-1 bg-bg-section pointer-events-none"
        style={{ left: 0, width: 0, transformOrigin: 'center' }}
      />
      {TABS.map((tab, i) => {
        const isActive = i === activeIndex
        const { Icon } = tab
        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[i] = el
            }}
            type="button"
            onClick={() => onTabClick(i)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={tab.label}
            className={cn(
              'relative z-10 flex items-center gap-2 h-[52px] px-4',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-button-primary-default',
              'transition-colors',
            )}
          >
            <Icon
              className={cn(
                'w-5 h-5 shrink-0 transition-colors',
                isActive ? 'text-text-body' : 'text-text-white/55',
              )}
            />
            <span
              className={cn(
                'overflow-hidden whitespace-nowrap text-14 font-medium leading-18',
                isActive ? 'text-text-body' : 'text-text-white/55',
              )}
              style={{
                maxWidth: isActive ? 110 : 0,
                opacity: isActive ? 1 : 0,
                transition:
                  'max-width 550ms cubic-bezier(0.65, 0, 0.35, 1), opacity 550ms cubic-bezier(0.65, 0, 0.35, 1)',
              }}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
