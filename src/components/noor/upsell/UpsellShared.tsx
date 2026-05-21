import { useNavigate } from 'react-router-dom'
import { X, ChevronLeft, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Polaroid images from Figma ──────────────────────────────────────────────
const imgPolaroidA = 'https://www.figma.com/api/mcp/asset/ccbd500a-1b6f-46db-a68a-6cc5464e1214'
const imgPolaroidB = 'https://www.figma.com/api/mcp/asset/d599b224-c3b5-476d-a79d-fa35c19a611f'

// ── Top close button ─────────────────────────────────────────────────────────
export function UpsellHeader() {
  const navigate = useNavigate()
  return (
    <div className="flex items-end justify-end px-4 pt-6 pb-2 shrink-0">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center justify-center size-8 text-[var(--color-text-primary)] hover:opacity-70 transition-opacity"
        aria-label="Close"
      >
        <X size={20} strokeWidth={1.5} />
      </button>
    </div>
  )
}

// ── "Top Premium feature" pill ───────────────────────────────────────────────
export function PremiumPill() {
  return (
    <div className="flex justify-center">
      <div className="relative flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#aeffde] overflow-hidden">
        {/* Two stacked gradient layers per Figma 216:3612 */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(90deg, #ddfff4 0%, #69ffcd 50%, #ddfff4 100%), linear-gradient(95.91deg, rgba(0,255,170,0.32) -37.04%, rgba(205,250,235,0.32) 101.27%)',
          }}
        />
        <div className="absolute inset-[-1px] rounded-full pointer-events-none shadow-[inset_0px_-4px_8px_0px_rgba(5,182,43,0.12),inset_0px_4px_8px_0px_rgba(255,255,255,0.24)]" />
        <Star
          size={16}
          className="relative text-[var(--color-text-emphasis)] fill-[var(--color-text-emphasis)] shrink-0"
        />
        <span
          className="relative text-[12px] leading-[14px] text-[var(--color-text-emphasis)] whitespace-nowrap"
          style={{ fontFamily: 'var(--font-greed)', fontWeight: 450 }}
        >
          Top Premium feature
        </span>
      </div>
    </div>
  )
}

// ── Title + subtitle ──────────────────────────────────────────────────────────
export function UpsellHeading() {
  return (
    <div className="px-4 flex flex-col gap-2 text-center">
      <h1
        className="text-[22px] leading-[24px] text-[var(--color-text-primary)]"
        style={{ fontFamily: 'var(--font-greed)', fontWeight: 450 }}
      >
        Discover more with premium
      </h1>
      <p
        className="text-[14px] leading-[18px] text-[var(--color-text-secondary)]"
        style={{ fontFamily: 'var(--font-greed)' }}
      >
        4 out of 5 people opt for premium plan
      </p>
    </div>
  )
}

// ── 4K comparison card ────────────────────────────────────────────────────────
// max-w defaults to the V1 row's 3 × DESKTOP_MAX_CARD + 2 × DESKTOP_GAP (320·3 + 16·2 = 992);
// callers can override via maxContentWidth to track a dynamically-sized row.
interface FourKCardProps {
  maxContentWidth?: number | null
}

export function FourKCard({ maxContentWidth }: FourKCardProps = {}) {
  const widthStyle =
    typeof maxContentWidth === 'number' && maxContentWidth > 0
      ? { maxWidth: `${maxContentWidth}px` }
      : undefined
  return (
    <div className="px-4">
      <div
        className="mx-auto max-w-[992px] relative border border-[#E1E2E5] overflow-hidden"
        style={{
          ...widthStyle,
          background:
            'linear-gradient(0deg, rgba(255, 255, 255, 0.56), rgba(255, 255, 255, 0.56)), #F3FCFF',
          backgroundBlendMode: 'multiply, normal',
          boxShadow:
            'inset 0px -8px 32px rgba(255, 234, 97, 0.12), inset 0px 8px 12px rgba(255, 255, 255, 0.24)',
        }}
      >
      {/* warm radial glow (Figma 216:3627 "shadow") — clipped by the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-120px] top-[-154px] size-[245px]"
        style={{
          background:
            'radial-gradient(circle, rgba(255,234,97,0.55) 0%, rgba(255,234,97,0) 70%)',
        }}
      />
      {/* diagonal-line pattern decoration on the right (Figma 216:3644 "pattern") */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[10px] top-[-43px] w-[58px] h-[116px] opacity-50"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(0,17,36,0.10) 0 1px, transparent 1px 6px)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
        }}
      />

      <div className="relative flex items-center gap-3 pl-1 pr-3 py-3 h-[108px]">
        {/* Polaroid stack */}
        <div className="relative shrink-0 w-[76px] h-[80px]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div style={{ transform: 'rotate(-4.15deg)' }}>
              <div className="border border-white shadow-[0px_2px_12px_rgba(0,0,0,0.08)] w-[59px] h-[73px] overflow-hidden blur-[0.5px]">
                <img src={imgPolaroidA} alt="" className="size-full object-bottom object-cover" />
              </div>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center" style={{ left: 5 }}>
            <div style={{ transform: 'rotate(3.08deg)' }}>
              <div className="border border-white shadow-[0px_2px_12px_rgba(0,0,0,0.08)] w-[59px] h-[73px] overflow-hidden">
                <img src={imgPolaroidB} alt="" className="size-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Text — heading + price-comparison lines (Figma 306:3181) */}
        <div
          className="flex flex-col gap-2 flex-1 min-w-0"
          style={{ fontFamily: 'var(--font-greed)' }}
        >
          {/* Heading */}
          <p
            className="text-[16px] leading-[20px] text-[var(--color-text-primary)]"
            style={{ fontWeight: 450 }}
          >
            Get 50 images in 4K vs 3 Photos in SD
          </p>

          {/* Price comparison — equal-weight labels, prices carry the contrast */}
          <div
            className="text-[14px] leading-[18px] text-[var(--color-text-secondary)]"
            style={{ fontWeight: 400 }}
          >
            <p>
              Starter Pack —{' '}
              <span
                className="text-[var(--color-text-primary)]"
                style={{ fontWeight: 600 }}
              >
                $20
              </span>
              /Photo in SD
            </p>
            <p>
              Premium —{' '}
              <span
                className="text-[var(--color-text-emphasis)]"
                style={{ fontWeight: 600 }}
              >
                $1.5
              </span>
              /Photo in HD +{' '}
              <span
                className="text-[var(--color-text-emphasis)]"
                style={{ fontWeight: 500 }}
              >
                50 Credits
              </span>
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

// ── Divider with label ────────────────────────────────────────────────────────
export function Breaker() {
  return (
    <div className="flex items-center gap-2 px-4">
      <div className="flex-1 h-px bg-[var(--color-border-primary)]" />
      <span
        className="text-[11px] leading-[16px] tracking-[0.08em] uppercase text-[var(--color-text-primary)] whitespace-nowrap"
        style={{ fontFamily: 'var(--font-greed)', fontWeight: 450 }}
      >
        GET upto 50 more photos WITH 50 CREDITS
      </span>
      <div className="flex-1 h-px bg-[var(--color-border-primary)]" />
    </div>
  )
}

// ── Sticky footer with two CTAs ───────────────────────────────────────────────
interface UpsellFooterProps {
  onPrimary?: () => void
  onSecondary?: () => void
  primaryPrice?: string
  secondaryPrice?: string
}

export function UpsellFooter({
  onPrimary,
  onSecondary,
  primaryPrice = '$75',
  secondaryPrice = '$59',
}: UpsellFooterProps) {
  return (
    <div
      className={cn(
        'shrink-0 flex flex-col gap-2 px-4 pt-2 pb-4',
        'border-t border-[var(--color-border-primary)] bg-[var(--color-bg-light-beige)]',
        'shadow-[0px_-8px_12px_rgba(0,0,0,0.06)]',
      )}
    >
      {/* Primary CTA */}
      <button
        onClick={onPrimary}
        className="flex items-center justify-center gap-3 h-11 w-full bg-[var(--color-button-primary-default)] text-white active:opacity-80 transition-opacity"
        style={{ fontFamily: 'var(--font-greed)' }}
      >
        <span className="text-[16px] leading-[22px]">{primaryPrice}</span>
        <span className="text-white/40 text-[16px]">|</span>
        <span className="text-[16px] leading-[22px]">Switch to premium</span>
        <ChevronLeft size={18} className="rotate-180 opacity-70" />
      </button>

      {/* Secondary CTA */}
      <button
        onClick={onSecondary}
        className="flex items-center justify-center gap-3 h-11 w-full border border-[var(--color-border-primary)] bg-[var(--color-bg-section)] text-[var(--color-text-primary)] active:opacity-80 transition-opacity"
        style={{ fontFamily: 'var(--font-greed)' }}
      >
        <span className="text-[16px] leading-[22px]">{secondaryPrice}</span>
        <span className="text-[var(--color-text-tertiary)] text-[16px]">|</span>
        <span className="text-[16px] leading-[22px]">Continue with Starter</span>
      </button>
    </div>
  )
}
