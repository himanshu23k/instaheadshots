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
        {/* gradient fill */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, #ddfff4 0%, #69ffcd 50%, #ddfff4 100%)',
          }}
        />
        <div className="absolute inset-[-1px] rounded-full pointer-events-none shadow-[inset_0px_-4px_8px_0px_rgba(5,182,43,0.12),inset_0px_4px_8px_0px_rgba(255,255,255,0.24)]" />
        <Star
          size={14}
          className="relative text-[var(--color-text-emphasis)] fill-[var(--color-text-emphasis)] shrink-0"
        />
        <span
          className="relative text-[12px] leading-[14px] text-[var(--color-text-emphasis)] whitespace-nowrap"
          style={{ fontFamily: 'var(--font-greed)' }}
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
export function FourKCard() {
  return (
    <div className="mx-4 relative border border-[var(--color-border-primary)] overflow-hidden">
      {/* tinted background */}
      <div className="absolute inset-0 bg-[#f3fcff]" />
      <div className="absolute inset-0 bg-white/56 mix-blend-multiply" />
      <div className="absolute inset-0 shadow-[inset_0px_-8px_32px_0px_rgba(255,234,97,0.12),inset_0px_8px_12px_0px_rgba(255,255,255,0.24)] pointer-events-none" />

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

        {/* Text */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <p
            className="text-[16px] leading-[20px] text-[var(--color-text-primary)]"
            style={{ fontFamily: 'var(--font-greed)', fontWeight: 450 }}
          >
            Get 50 images in 4K vs 3 Photos in SD
          </p>
          <div
            className="text-[14px] leading-[18px] text-[var(--color-text-secondary)]"
            style={{ fontFamily: 'var(--font-greed)' }}
          >
            <p>Starter Pack - $20/Photo</p>
            <p>Premium - 1.5$/Photo in HD + 50 Credits</p>
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
        <span className="text-[16px] leading-[22px]">Pay to purchase premium</span>
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
        <span className="text-[16px] leading-[22px]">Keep starter &amp; continue</span>
      </button>
    </div>
  )
}
