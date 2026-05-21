import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

// ── Videos from /public/videos ───────────────────────────────────────────────
const video1 = '/videos/magnific_a-woman-stands-smiling-co_2987138259.mp4'
const video2 = '/videos/magnific_a-woman-with-long-brown-h_2987142386.mp4'
const video3 = '/videos/magnific_a-woman-with-long-curly-d_2987001021.mp4'

export interface CarouselCard {
  id: string
  caption: string
  mediaSrc: string
}

const defaultCards: CarouselCard[] = [
  {
    id: 'edit',
    caption: 'Try hairstyles, outfits, backgrounds & much more',
    mediaSrc: video2,
  },
  {
    id: 'imagine',
    caption: 'Imagine yourself as anyone, anything, anywhere!',
    mediaSrc: video1,
  },
  {
    id: 'looks',
    caption: 'Create any look from our 2500 set of looks',
    mediaSrc: video3,
  },
]

// Height of the caption area — fixed so we can back-calculate the 1:1 video size.
const CAPTION_H = 52
// Top/bottom padding inside the section.
const TOP_PAD = 20
const BOTTOM_PAD = 16
// Left snap inset (matches pl-4 on the scroll container).
const SNAP_LEFT = 16
// ≥640px switches to the centered flex layout (matches Tailwind `sm`).
const DESKTOP_MIN_WIDTH = 640
const DESKTOP_GAP = 16
const DESKTOP_SIDE_PAD = 16
const DESKTOP_MAX_CARD = 320

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`)
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

interface UpsellV1SectionProps {
  cards?: CarouselCard[]
  onRowWidthChange?: (width: number | null) => void
}

export function UpsellV1Section({ cards = defaultCards, onRowWidthChange }: UpsellV1SectionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [cardWidth, setCardWidth] = useState(0)
  const isDesktop = useIsDesktop()

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    const compute = () => {
      const heightBased = el.clientHeight - TOP_PAD - BOTTOM_PAD - CAPTION_H
      if (isDesktop) {
        const widthBased =
          (el.clientWidth - 2 * DESKTOP_SIDE_PAD - (cards.length - 1) * DESKTOP_GAP) /
          cards.length
        setCardWidth(Math.max(Math.min(heightBased, widthBased, DESKTOP_MAX_CARD), 120))
      } else {
        // Cap card size at 70% of viewport width on mobile.
        const widthCap = el.clientWidth * 0.7
        setCardWidth(Math.max(Math.min(heightBased, widthCap), 120))
      }
    }

    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [isDesktop, cards.length])

  // Surface the actual cards-row width so the parent can match FourKCard above.
  useEffect(() => {
    if (!onRowWidthChange) return
    if (isDesktop && cardWidth > 0) {
      onRowWidthChange(cards.length * cardWidth + (cards.length - 1) * DESKTOP_GAP)
    } else {
      onRowWidthChange(null)
    }
    return () => onRowWidthChange(null)
  }, [cardWidth, isDesktop, cards.length, onRowWidthChange])

  // Allow the last card to snap flush-left at SNAP_LEFT px even at max scroll.
  const trailingW =
    !isDesktop && cardWidth > 0 ? window.innerWidth - SNAP_LEFT - cardWidth : 0

  return (
    // flex-1 min-h-0 lets this section consume all remaining height given by its
    // flex parent in UpsellPage (V1 layout).
    <div ref={wrapperRef} className="flex-1 min-h-0">
      <div
        className={cn(
          'h-full flex items-start gap-3',
          isDesktop
            ? 'justify-center sm:gap-4 px-4'
            : cn(
                'overflow-x-auto scroll-smooth',
                'snap-x snap-mandatory',
                // pl-4 positions card 1 at 16 px; scroll-padding-left keeps every
                // subsequent card snapping at the same 16 px inset.
                'pl-4 [scroll-padding-left:16px]',
                '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
              ),
        )}
        style={{ paddingTop: TOP_PAD, paddingBottom: BOTTOM_PAD }}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            className={cn(
              'shrink-0 flex flex-col border border-[#f2f2f2] bg-[var(--color-bg-section)]',
              'shadow-[inset_0px_-8px_32px_0px_rgba(255,234,97,0.12),inset_0px_8px_12px_0px_rgba(255,255,255,0.24)]',
              !isDesktop && 'snap-start',
            )}
            style={{ width: cardWidth || undefined }}
          >
            {/* 1:1 video — width === height === cardWidth */}
            <div
              className="overflow-hidden"
              style={{ width: cardWidth || undefined, height: cardWidth || undefined }}
            >
              {cardWidth > 0 && (
                <video
                  src={card.mediaSrc}
                  className="size-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              )}
            </div>

            {/* Caption */}
            <div
              className="shrink-0 flex items-center px-3"
              style={{ height: CAPTION_H }}
            >
              <p
                className="text-[13px] leading-[17px] text-[var(--color-text-secondary)] line-clamp-2"
                style={{ fontFamily: 'var(--font-greed)' }}
              >
                {card.caption}
              </p>
            </div>
          </div>
        ))}

        {/* trailing spacer — lets the last card snap at SNAP_LEFT px from viewport left */}
        {trailingW > 0 && <div className="shrink-0" style={{ width: trailingW }} />}
      </div>
    </div>
  )
}
