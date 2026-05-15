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

// Fixed-height content that lives above the variant section on both versions.
function AboveContent() {
  return (
    <>
      <UpsellHeader />
      <div className="flex flex-col gap-3 pb-4">
        <PremiumPill />
        <UpsellHeading />
      </div>
      <FourKCard />
      <div className="py-4">
        <Breaker />
      </div>
    </>
  )
}

export function UpsellPage() {
  const [params] = useSearchParams()
  const version = params.get('version') ?? 'v1'

  return (
    <div
      className="fixed inset-0 flex flex-col bg-[var(--color-bg-light-beige)] overflow-hidden"
      style={{ fontFamily: 'var(--font-greed)' }}
    >
      {/* Fixed above-the-fold content – same for both versions */}
      <div className="shrink-0">
        <AboveContent />
      </div>

      {/*
       * Both sections are flex-1 min-h-0 and own their own scroll.
       * V1: horizontal card carousel
       * V2: vertically scrolling emphasis list
       */}
      {version === 'v1' ? <UpsellV1Section /> : <UpsellV2Section />}

      {/* Sticky footer */}
      <UpsellFooter />
    </div>
  )
}
