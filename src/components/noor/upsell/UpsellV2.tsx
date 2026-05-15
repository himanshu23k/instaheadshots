import { forwardRef, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

// ── Figma asset URLs ─────────────────────────────────────────────────────────
const imgFace1 = 'https://www.figma.com/api/mcp/asset/8ae1f899-f614-486e-918f-97a677f5aea3'
const imgFace2 = 'https://www.figma.com/api/mcp/asset/b65690e3-3b2a-45af-9b71-2ba4a1316253'
const imgFace3 = 'https://www.figma.com/api/mcp/asset/8c69029f-9768-48c1-bede-c9978930e39e'
const imgFace4 = 'https://www.figma.com/api/mcp/asset/fe554804-37b4-44ca-b273-22907c9d8708'
const imgFace5 = 'https://www.figma.com/api/mcp/asset/37cc1898-ba1e-4591-9307-641f88cadce9'
const imgGrid  = 'https://www.figma.com/api/mcp/asset/dd18eea3-37d6-4aa4-88e2-99a0386ec975'

// ── Individual feature components ────────────────────────────────────────────

export function HairstyleItem() {
  return (
    <div className="relative size-16 shrink-0">
      <div className="absolute left-0 top-0 size-[31px] border border-white shadow-[0px_2px_12px_rgba(0,0,0,0.08)] overflow-hidden">
        <img src={imgGrid} alt="" className="absolute inset-0 size-full object-cover" />
      </div>
      <div className="absolute left-[33px] top-0 size-[31px] border border-white shadow-[0px_2px_12px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(103deg,#ffccda 21%,#f6ffed 100%)' }} />
        <img src={imgFace1} alt="" className="absolute inset-0 size-full object-cover" />
      </div>
      <div className="absolute left-0 top-[33px] size-[31px] border border-white shadow-[0px_2px_12px_rgba(0,0,0,0.08)] overflow-hidden">
        <img src={imgFace2} alt="" className="absolute inset-0 size-full object-cover" />
      </div>
      <div className="absolute left-[33px] top-[33px] size-[31px] border border-white shadow-[0px_2px_12px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(103deg,#ffccda 21%,#f6ffed 100%)' }} />
        <img src={imgFace3} alt="" className="absolute inset-0 size-full object-cover" />
      </div>
    </div>
  )
}

export function ImagineItem() {
  return (
    <div className="relative size-16 shrink-0">
      <div className="absolute left-[7px] top-[5px] size-[50px] border border-white shadow-[0px_2px_12px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(103deg,#ffccda 21%,#f6ffed 100%)' }} />
        <img src={imgFace4} alt="" className="absolute inset-0 size-full object-cover" />
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-0 bg-[#fbfbfb] drop-shadow-[0px_1px_6px_rgba(0,0,0,0.08)] px-1.5 py-0.5 rounded-full whitespace-nowrap"
        style={{ fontFamily: 'var(--font-greed)' }}
      >
        <span className="text-[8px] text-[#1c1c1c]">Actor</span>
      </div>
    </div>
  )
}

export function LooksItem() {
  return (
    <div className="relative size-16 shrink-0">
      {/* back-left */}
      <div
        className="absolute size-[35px] border border-white shadow-[0px_2px_12px_rgba(0,0,0,0.08)] overflow-hidden"
        style={{ left: 2, top: 13, transform: 'rotate(-4deg)' }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(103deg,#ffccda 21%,#f6ffed 100%)' }} />
      </div>
      {/* back-right */}
      <div
        className="absolute size-[35px] border border-white shadow-[0px_2px_12px_rgba(0,0,0,0.08)] overflow-hidden"
        style={{ right: 2, top: 13, transform: 'rotate(4deg)' }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(103deg,#ffccda 21%,#f6ffed 100%)' }} />
      </div>
      {/* front center */}
      <div className="absolute left-[10px] top-[10px] size-11 border border-white shadow-[0px_2px_12px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(103deg,#ffccda 21%,#f6ffed 100%)' }} />
        <img src={imgFace5} alt="" className="absolute inset-0 size-full object-cover" />
      </div>
    </div>
  )
}

export function DatingItem() {
  return (
    <div className="relative size-16 shrink-0">
      <div className="absolute left-[7px] top-[7px] size-[50px] border border-white drop-shadow-[0px_2px_6px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(103deg,#ffccda 21%,#f6ffed 100%)' }} />
        <img src={imgFace4} alt="" className="absolute inset-0 size-full object-cover" />
        <img src={imgGrid}  alt="" className="absolute inset-0 size-full object-cover" />
      </div>
      {/* checkmark badge */}
      <div className="absolute bottom-[3px] right-[3px] size-5 bg-[#fbfbfb] rounded-full flex items-center justify-center drop-shadow-[0px_1px_6px_rgba(0,0,0,0.08)]">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2 2 4-4" stroke="#00A36D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

// ── Feature list ─────────────────────────────────────────────────────────────

interface Feature {
  id: string
  caption: string
  Component: React.ComponentType
}

const FEATURES: Feature[] = [
  {
    id: 'hairstyle',
    caption: 'Try any hairstyle and experience the look before you get that haircut done',
    Component: HairstyleItem,
  },
  {
    id: 'imagine',
    caption: 'Imagine yourself as anyone, anything, anywhere!',
    Component: ImagineItem,
  },
  {
    id: 'looks',
    caption: 'Create different looks against different backgrounds, outfits, vibes',
    Component: LooksItem,
  },
  {
    id: 'dating',
    caption: 'Create dating looks for your next Tinder date to swipe you right',
    Component: DatingItem,
  },
]

const COUNT = FEATURES.length // 4
// Triple the list so there are always items above and below the active one.
const INFINITE_FEATURES = [...FEATURES, ...FEATURES, ...FEATURES]
// Start at the first item of the middle copy so wrapping can go both ways.
const START_IDX = COUNT

// ── Emphasis row ──────────────────────────────────────────────────────────────

interface EmphasizedRowProps {
  feature: Feature
  isActive: boolean
}

const EmphasizedRow = forwardRef<HTMLDivElement, EmphasizedRowProps>(
  ({ feature, isActive }, ref) => (
    <div ref={ref} className="px-4">
      <motion.div
        animate={{
          opacity: isActive ? 1 : 0.2,
          scale: isActive ? 1 : 0.91,
        }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className={cn(
          'flex items-center gap-4 px-4 py-5 rounded-xl',
          isActive
            ? 'bg-[var(--color-bg-section)] shadow-[0_4px_24px_rgba(0,0,0,0.08)]'
            : 'bg-transparent',
        )}
      >
        <feature.Component />
        <p
          className="flex-1 min-w-0 text-[14px] leading-[18px] text-[var(--color-text-secondary)]"
          style={{ fontFamily: 'var(--font-greed)' }}
        >
          {feature.caption}
        </p>
      </motion.div>
    </div>
  ),
)

EmphasizedRow.displayName = 'EmphasizedRow'

// ── V2 section ────────────────────────────────────────────────────────────────

const INTERVAL_MS = 4000
// How long the smooth scroll animation takes before we do the silent reset.
const SCROLL_SETTLE_MS = 600

export function UpsellV2Section() {
  const containerRef  = useRef<HTMLDivElement>(null)
  const itemRefs      = useRef<Array<HTMLDivElement | null>>([])
  const virtualIdxRef = useRef(START_IDX)
  const [virtualIdx,  setVirtualIdx] = useState(START_IDX)

  // Scroll container so the item at `idx` in INFINITE_FEATURES is centered.
  const scrollToIdx = (idx: number, behavior: ScrollBehavior = 'smooth') => {
    const container = containerRef.current
    const item      = itemRefs.current[idx]
    if (!container || !item) return

    if (behavior === 'instant') {
      // Use offsetTop for accuracy during silent resets (no animation).
      const itemCenter   = item.offsetTop + item.offsetHeight / 2
      const targetScroll = itemCenter - container.clientHeight / 2
      container.scrollTop = targetScroll
    } else {
      const cRect = container.getBoundingClientRect()
      const iRect = item.getBoundingClientRect()
      const delta = (iRect.top + iRect.height / 2) - (cRect.top + cRect.height / 2)
      container.scrollTo({ top: container.scrollTop + delta, behavior: 'smooth' })
    }
  }

  // Scroll to START_IDX instantly on mount (no layout effect needed — items
  // are static so offsetTop is available on first paint).
  useEffect(() => {
    // rAF ensures the DOM has painted before we read offsetTop.
    const raf = requestAnimationFrame(() => scrollToIdx(START_IDX, 'instant'))
    return () => cancelAnimationFrame(raf)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-advance every INTERVAL_MS.
  useEffect(() => {
    const id = setInterval(() => {
      const next = virtualIdxRef.current + 1
      virtualIdxRef.current = next
      setVirtualIdx(next)
      scrollToIdx(next, 'smooth')

      // If we've entered the last copy, silently reset to the middle copy after
      // the scroll animation finishes, so the loop appears infinite.
      if (next >= COUNT * 2) {
        setTimeout(() => {
          const reset = next - COUNT
          virtualIdxRef.current = reset
          setVirtualIdx(reset)
          scrollToIdx(reset, 'instant')
        }, SCROLL_SETTLE_MS)
      }
    }, INTERVAL_MS)

    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex-1 min-h-0 overflow-y-auto',
        '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
      )}
    >
      <div className="flex flex-col gap-2 py-4">
        {INFINITE_FEATURES.map((feature, i) => (
          <EmphasizedRow
            key={`${feature.id}-${i}`}
            ref={(el) => { itemRefs.current[i] = el }}
            feature={feature}
            isActive={i === virtualIdx}
          />
        ))}
      </div>
    </div>
  )
}
