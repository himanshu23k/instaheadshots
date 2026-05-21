import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  UpsellHeader,
  PremiumPill,
  UpsellHeading,
  FourKCard,
  Breaker,
  UpsellFooter,
} from './UpsellShared'
import { UpsellV1Section } from './UpsellV1'
import { UpsellV2Section } from './UpsellV2'

export function UpsellPage() {
  const [params] = useSearchParams()
  const version = params.get('version') ?? 'v1'

  // V1's actual cards-row width (desktop only) so FourKCard can match it edge-to-edge.
  const [v1RowWidth, setV1RowWidth] = useState<number | null>(null)

  return (
    <div
      className="fixed inset-0 flex flex-col bg-[var(--color-bg-light-beige)] overflow-hidden"
      style={{ fontFamily: 'var(--font-greed)' }}
    >
      {/* Decorative blurred-ellipse stack behind the header (Figma 216:3486 "circle").
          Two filled circles with heavy blur + screen blend, wrapper opacity 0.24. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-[-129px] size-[175px]"
        style={{ opacity: 0.24 }}
      >
        {/* Ellipse 18613 — green */}
        <div
          className="absolute left-0 top-0 size-[175px] rounded-full"
          style={{ background: '#00EA3B', filter: 'blur(100px)' }}
        />
        {/* Ellipse 18614 — blue, screen blend */}
        <div
          className="absolute left-[33px] top-[33px] size-[109px] rounded-full"
          style={{
            background: '#3F88FF',
            mixBlendMode: 'screen',
            filter: 'blur(100px)',
          }}
        />
      </div>

      {/* Fixed above-the-fold content – same for both versions */}
      <div className="relative shrink-0">
        <UpsellHeader />
        <div className="flex flex-col gap-3 pb-4">
          <PremiumPill />
          <UpsellHeading />
        </div>
        <FourKCard maxContentWidth={version === 'v1' ? v1RowWidth : null} />
        <div className="py-4">
          <Breaker />
        </div>
      </div>

      {/*
       * Both sections are flex-1 min-h-0 and own their own scroll.
       * V1: horizontal card carousel
       * V2: vertically scrolling emphasis list
       */}
      {version === 'v1' ? (
        <UpsellV1Section onRowWidthChange={setV1RowWidth} />
      ) : (
        <UpsellV2Section />
      )}

      {/* Sticky footer */}
      <UpsellFooter />
    </div>
  )
}
