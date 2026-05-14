import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { Dialog } from '@base-ui/react/dialog'
import { GalleryView } from '@/components/gallery/GalleryView'
import { cn } from '@/lib/utils'
import { Toggle } from './Toggle'
import {
  DiscountStar,
  DiscountStarHero,
  Icon50,
  Icon4K,
  Icon100,
  Sparkle,
  CheckIcon,
  CrossIcon,
} from './icons'

type View = 'select' | 'invite' | 'unlocked'

const BASE_PRICE = 4500
const DISCOUNT_PRICE = 3999
const STRIKE_PRICE = 7500
const STANDARD_PRICE = 3499
const STARTER_PRICE = 2499
const DISCOUNT_USD = 75
const STRIKE_USD = 100

export function PaymentPlansSheet() {
  const navigate = useNavigate()
  const [view, setView] = useState<View>('select')
  const [discountOn, setDiscountOn] = useState(false)
  const [emails, setEmails] = useState<[string, string, string]>(['', '', ''])
  const [shareHeadshot, setShareHeadshot] = useState(true)

  const handleClose = () => navigate(-1)
  const currentPrice = discountOn ? DISCOUNT_PRICE : BASE_PRICE
  const allEmailsFilled = emails.every((e) => e.trim().length > 0)

  const handleCTA = () => {
    if (view === 'select') {
      if (discountOn) setView('invite')
      else handleClose()
    } else if (view === 'invite') {
      if (allEmailsFilled) setView('unlocked')
    } else {
      handleClose()
    }
  }

  return (
    <>
      {/* Backdrop layer — the "previous page" visible behind the sheet */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <GalleryView />
      </div>

      <Dialog.Root open onOpenChange={(open) => !open && handleClose()}>
        <Dialog.Portal>
          <Dialog.Backdrop
            className="fixed inset-0 z-40 bg-[rgba(1,1,1,0.6)] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0"
          />
          <Dialog.Popup
            className={cn(
              'fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white text-text-primary',
              'transition-transform duration-300 ease-out data-ending-style:translate-y-full data-starting-style:translate-y-full',
              view === 'invite' && 'max-h-[78vh]',
              view === 'unlocked' && 'max-h-[88vh]',
              view === 'select' && 'max-h-[95vh]',
              'shadow-[0_-8px_24px_0_rgba(0,0,0,0.08)]',
            )}
            style={{ fontFamily: 'var(--font-greed)' }}
          >
            {/* Drag handle — pinned at top center */}
            <div className="relative shrink-0 pt-4 pb-1 flex justify-center">
              <div className="h-1 w-12 rounded-full bg-[#eeeef0]" />
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {/* X close — top-right of body, above content */}
              <div className="flex items-center justify-end mb-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex size-5 items-center justify-center text-text-primary"
                  aria-label="Close"
                >
                  <X className="size-5" strokeWidth={1.5} />
                </button>
              </div>

              {view === 'select' && (
                <SelectView discountOn={discountOn} onToggleDiscount={setDiscountOn} />
              )}
              {view === 'invite' && (
                <InviteView
                  emails={emails}
                  onEmailsChange={setEmails}
                  shareHeadshot={shareHeadshot}
                  onShareHeadshotChange={setShareHeadshot}
                />
              )}
              {view === 'unlocked' && <UnlockedView />}
            </div>

            {/* Footer CTA */}
            <FooterCTA
              view={view}
              discountOn={discountOn}
              currentPrice={currentPrice}
              allEmailsFilled={allEmailsFilled}
              onClick={handleCTA}
            />
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

/* ────────────────────────────────────────────────────────────── */
/* Select view — States 1 & 2                                     */
/* ────────────────────────────────────────────────────────────── */
function SelectView({
  discountOn,
  onToggleDiscount,
}: {
  discountOn: boolean
  onToggleDiscount: (next: boolean) => void
}) {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-[24px] leading-[28px] font-medium text-text-primary">
          Select a pack
        </h1>
        <p className="text-[16px] leading-[22px] text-text-secondary">
          Get print ready headshots and unlock credits with premium pack.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {/* Discount toggle card + Premium card — flush stacked */}
        <div className="flex flex-col">
          <DiscountToggleCard checked={discountOn} onChange={onToggleDiscount} />
          <PremiumCard discountOn={discountOn} />
        </div>

        <StandardCard />
        <StarterCard />
      </div>
    </div>
  )
}

function DiscountToggleCard({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <div
      className="flex items-start justify-between p-3"
      style={{
        background:
          'linear-gradient(to right, #d3f4e9 0%, #baf2de 54.3%, #dbfdf2 100%)',
        borderTop: '0.5px solid #c2f5e3',
        borderLeft: '0.5px solid #c2f5e3',
        borderRight: '0.5px solid #c2f5e3',
        backdropFilter: 'blur(3px)',
      }}
    >
      <div className="flex items-start gap-2">
        <div className="shrink-0 mt-0.5">
          <DiscountStar size={22} />
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-[14px] leading-[18px] font-medium text-[#0b6e4b]">
            Unlock Extra 25% off on Premium
          </p>
          <p className="text-[12px] leading-[14px] text-[rgba(11,110,75,0.8)]">
            Invite 3 people who'd want headshots too.
          </p>
        </div>
      </div>
      <Toggle
        checked={checked}
        onChange={onChange}
        ariaLabel="Toggle extra 25% off discount"
      />
    </div>
  )
}

function PremiumCard({ discountOn }: { discountOn: boolean }) {
  return (
    <div
      className="relative bg-[#011124] text-white p-4"
      style={{ border: '2px solid #c2f5e3' }}
    >
      {/* BEST VALUE ribbon — pinned to top-right, slightly overhanging */}
      <BestValueRibbon />

      <div className="flex flex-col gap-4">
        {/* Header — title + price */}
        <div className="flex flex-col gap-3">
          <p className="text-[16px] leading-[22px] text-white">Premium</p>

          <div className="flex flex-col gap-2 items-start">
            <div className="flex items-end gap-1">
              <span
                className="text-[20px] leading-[22px] text-[#99a0a7]"
                style={{ textDecoration: 'line-through' }}
              >
                ₹{STRIKE_PRICE.toLocaleString('en-IN')}
              </span>
              {discountOn ? (
                <>
                  <span
                    className="text-[20px] leading-[22px] text-white"
                    style={{
                      textDecoration: 'line-through',
                      textDecorationColor: '#00EA9C',
                      textDecorationThickness: '2px',
                    }}
                  >
                    ₹{BASE_PRICE.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[20px] leading-[22px] text-white">
                    ₹{DISCOUNT_PRICE.toLocaleString('en-IN')}
                  </span>
                </>
              ) : (
                <span className="text-[20px] leading-[22px] text-white">
                  ₹{BASE_PRICE.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-[11px] leading-[16px] tracking-[0.88px] uppercase text-white ml-0.5">
                INR
              </span>
            </div>

            <div className="bg-white px-2 py-0.5">
              <span className="text-[11px] leading-[16px] tracking-[0.88px] uppercase text-[#003000] whitespace-pre">
                {discountOn ? '47% OFF  + 10% EXTRA' : '47% OFF'}
              </span>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/10 -mx-4" />

        {/* Benefit rows */}
        <div className="flex flex-col gap-3">
          <BenefitRow
            icon={<Icon50 size={64} />}
            title="All 50 headshots"
            subtitle="You keep everything"
          />
          <BenefitRow
            icon={<Icon4K size={64} />}
            title="High resolution Print ready"
            subtitle="Send it directly to your printer"
          />
          <BenefitRow
            icon={<Icon100 size={64} />}
            title="100 credits"
            subtitle={
              <>
                <span>Use credits to generate new headshots in over 2500 styles</span>
                <button
                  type="button"
                  className="block mt-0.5 text-[14px] leading-[18px] text-[#00EA9C]"
                >
                  Know more
                </button>
              </>
            }
          />
        </div>
      </div>
    </div>
  )
}

function BestValueRibbon() {
  return (
    <div className="absolute top-3 right-[-2px] pointer-events-none select-none">
      <div className="relative">
        <div
          className="flex h-6 items-center gap-1.5 pl-6 pr-3"
          style={{
            background:
              'linear-gradient(to left, #005438 4.6%, rgba(0,84,56,0) 97%)',
          }}
        >
          <Sparkle size={11} color="#00EA9C" />
          <span className="text-[11px] leading-[16px] tracking-[0.88px] uppercase text-[#00EA9C]">
            BEST VALUE
          </span>
        </div>
        {/* fold triangle — bottom-right corner, below ribbon */}
        <div
          className="absolute right-0 top-6 w-[5px] h-[5px]"
          style={{
            background: '#003000',
            clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
          }}
        />
      </div>
    </div>
  )
}

function BenefitRow({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0 size-16 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <p className="text-[16px] leading-[20px] text-white">{title}</p>
        <div className="text-[14px] leading-[18px] text-[#99a0a7]">{subtitle}</div>
      </div>
    </div>
  )
}

function StandardCard() {
  return (
    <PackageCard
      name="Standard"
      price={STANDARD_PRICE}
      features={[
        { label: '50 headshots', granted: true },
        { label: 'Standard Resolution', granted: true },
        { label: 'No credits', granted: false },
      ]}
    />
  )
}

function StarterCard() {
  return (
    <PackageCard
      name="Starter"
      price={STARTER_PRICE}
      features={[
        { label: '03 headshot', granted: true },
        { label: 'Standard Resolution', granted: true },
        { label: 'No credits', granted: false },
      ]}
    />
  )
}

function PackageCard({
  name,
  price,
  features,
}: {
  name: string
  price: number
  features: { label: string; granted: boolean }[]
}) {
  return (
    <div className="bg-white border border-[#e1e2e5]">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <p className="text-[16px] leading-[20px] text-text-primary">{name}</p>
        <div className="flex items-baseline gap-1 text-text-primary">
          <span className="text-[20px] leading-[22px]">
            ₹{price.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] leading-[16px] tracking-[0.88px] uppercase">
            INR
          </span>
        </div>
      </div>

      <div
        className="px-4 py-2 flex items-center gap-2 border-t border-[rgba(44,44,44,0.08)]"
        style={{
          background:
            'linear-gradient(to right, #f6f5f3 30%, rgba(255,255,255,0) 100%)',
        }}
      >
        {features.map((f, i) => (
          <span key={f.label} className="flex items-center gap-1 shrink-0">
            {f.granted ? (
              <CheckIcon size={14} color="#011124" />
            ) : (
              <CrossIcon size={14} color="#011124" />
            )}
            <span className="text-[12px] leading-[14px] text-text-primary">
              {f.label}
            </span>
            {i < features.length - 1 && (
              <span className="ml-1 size-1 rounded-full bg-[rgba(44,44,44,0.18)]" />
            )}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────── */
/* Invite view — State 3                                          */
/* ────────────────────────────────────────────────────────────── */
function InviteView({
  emails,
  onEmailsChange,
  shareHeadshot,
  onShareHeadshotChange,
}: {
  emails: [string, string, string]
  onEmailsChange: (next: [string, string, string]) => void
  shareHeadshot: boolean
  onShareHeadshotChange: (next: boolean) => void
}) {
  const updateEmail = (idx: 0 | 1 | 2, value: string) => {
    const next: [string, string, string] = [...emails]
    next[idx] = value
    onEmailsChange(next)
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-[24px] leading-[28px] font-medium text-text-primary">
          Unlock extra 25% off on premium pack
        </h1>
        <p className="text-[16px] leading-[22px] text-text-secondary">
          {'Invite 3 colleagues and pay '}
          <span style={{ textDecoration: 'line-through' }} className="text-[#99a0a7]">
            ${STRIKE_USD}
          </span>
          {'  '}
          <span className="text-[#006846]">${DISCOUNT_USD} only</span>
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <input
            key={i}
            type="email"
            placeholder={`Email ${i + 1}`}
            value={emails[i as 0 | 1 | 2]}
            onChange={(e) => updateEmail(i as 0 | 1 | 2, e.target.value)}
            className="h-11 w-full bg-white border border-[#e1e2e5] px-3 text-[16px] leading-[22px] text-text-primary placeholder:text-text-secondary outline-none focus:border-text-primary"
          />
        ))}
      </div>

      <div
        className="px-2 pt-3 pb-0 flex flex-col gap-6"
        style={{ background: 'linear-gradient(to bottom, #f5f5f6 0%, #ffffff 100%)' }}
      >
        <p className="text-[16px] leading-[22px] text-text-secondary">
          They'll get one email with your signup link. No spam, ever.{' '}
          <button type="button" className="text-[#00a36d]">
            Preview Email
          </button>
        </p>

        <div className="relative flex h-11 items-center justify-between pl-[52px] pr-0 py-2">
          {/* tilted avatar preview thumb */}
          <div
            className="absolute left-0 top-[-1px] size-[44px] -rotate-[4deg] bg-[#fafafa] border-[0.5px] border-[#e1e2e5] overflow-hidden"
            style={{ boxShadow: '0 8px 12px rgba(0,0,0,0.16)' }}
          >
            <img
              src="/mock/faces/face-01.jpg"
              alt=""
              className="size-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
          <p className="text-[16px] leading-[22px] text-text-primary">
            Share my headshot in email
          </p>
          <Toggle
            checked={shareHeadshot}
            onChange={onShareHeadshotChange}
            ariaLabel="Share my headshot in email"
          />
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────── */
/* Unlocked view — State 4                                        */
/* ────────────────────────────────────────────────────────────── */
function UnlockedView() {
  const countdown = useCountdown(29 * 60 + 47)

  return (
    <div className="flex flex-col gap-5 relative -mt-6">
      {/* Floating hero discount star — overhangs the top */}
      <div className="flex justify-center -mt-8 mb-1">
        <DiscountStarHero size={110} />
      </div>

      <header className="flex flex-col gap-3">
        <h1 className="text-[24px] leading-[28px] font-medium text-text-primary">
          25% off unlocked
        </h1>
        <p className="text-[16px] leading-[22px] text-text-secondary">
          Use your discount before the timer runs out and get
        </p>
      </header>

      {/* Countdown bar — sits flush above Premium card */}
      <div className="-mb-3" />
      <div className="flex flex-col">
        <div
          className="px-4 py-3 text-center"
          style={{
            background: '#F6E7CB',
            color: '#6B4A1A',
            border: '0.5px solid #E6D5B0',
            borderBottom: 'none',
          }}
        >
          <span className="text-[15px] leading-[20px] font-medium">
            Extra 25% off expires in {countdown} mins
          </span>
        </div>
        <PremiumCard discountOn />
      </div>
    </div>
  )
}

function useCountdown(seconds: number) {
  const [s, setS] = useState(seconds)
  useEffect(() => {
    if (s <= 0) return
    const t = setInterval(() => setS((v) => (v > 0 ? v - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [s])
  return useMemo(() => {
    const mm = Math.floor(s / 60).toString().padStart(2, '0')
    const ss = (s % 60).toString().padStart(2, '0')
    return `${mm}:${ss}`
  }, [s])
}

/* ────────────────────────────────────────────────────────────── */
/* Footer CTA                                                     */
/* ────────────────────────────────────────────────────────────── */
function FooterCTA({
  view,
  discountOn,
  currentPrice,
  allEmailsFilled,
  onClick,
}: {
  view: View
  discountOn: boolean
  currentPrice: number
  allEmailsFilled: boolean
  onClick: () => void
}) {
  let leftLabel = `₹${currentPrice.toLocaleString('en-IN')}`
  let rightLabel = 'Pay to Continue'
  let disabled = false

  if (view === 'select' && discountOn) {
    rightLabel = 'Unlock Discount & Pay'
  }
  if (view === 'invite') {
    leftLabel = `₹${DISCOUNT_PRICE.toLocaleString('en-IN')}`
    rightLabel = 'Unlock Discount & Pay'
    disabled = !allEmailsFilled
  }
  if (view === 'unlocked') {
    leftLabel = ''
    rightLabel = `Pay $${DISCOUNT_USD} & Download`
  }

  return (
    <div
      className="shrink-0 bg-[#fbfaf8] border-t border-[#e1e2e5] px-6 py-2"
      style={{ boxShadow: '0 -8px 12px rgba(0,0,0,0.1)' }}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'flex h-11 w-full items-center justify-center px-6 bg-[#011124] text-white transition-colors',
          'hover:bg-[#000811] active:translate-y-px',
          'disabled:bg-[#b5b8bf] disabled:cursor-not-allowed',
        )}
      >
        {leftLabel && (
          <>
            <span className="text-[16px] leading-[22px]">{leftLabel}</span>
            <span className="text-[16px] leading-[22px] text-white/30 mx-2">|</span>
          </>
        )}
        <span className="text-[16px] leading-[22px]">{rightLabel}</span>
      </button>
    </div>
  )
}
