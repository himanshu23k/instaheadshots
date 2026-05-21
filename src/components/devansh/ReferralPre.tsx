import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Heart, ArrowDownToLine } from 'lucide-react'
import { motion } from 'motion/react'
import { useReferralStore, useReferralStatus, formatCountdown } from '@/store/referral-store'
import { PREMIUM_DISCOUNT_PRICE } from '@/components/payment-plans/PaymentPlansSheet'

const GALLERY_IMAGES = [
  { id: 'face-01', src: '/mock/faces/face-01.jpg', isTopPick: true },
  { id: 'face-02', src: '/mock/faces/face-02.jpg', isTopPick: false },
  { id: 'face-03', src: '/mock/faces/face-03.jpg', isTopPick: false },
  { id: 'face-04', src: '/mock/faces/face-04.jpg', isTopPick: false },
  { id: 'face-05', src: '/mock/faces/face-05.jpg', isTopPick: false },
  { id: 'face-06', src: '/mock/faces/face-06.jpg', isTopPick: false },
]

export function ReferralPre() {
  const navigate = useNavigate()
  const location = useLocation()
  const clearExpired = useReferralStore((s) => s.clearExpired)
  const discountOn = useReferralStore((s) => s.discountOn)
  const emails = useReferralStore((s) => s.emails)
  const { packsViewed, discountUnlocked, secondsRemaining, gracePeriodActive } = useReferralStatus()
  const hasEmail = emails.some((e) => e.trim().length > 0)

  // Pre-unlock toast label + landing view, in priority order
  let preToastLabel = 'Get an extra 25% off Premium'
  let preToastInitialView: 'select' | 'invite' = 'select'
  if (hasEmail) {
    preToastLabel = 'Complete Invitation & get 25% off'
    preToastInitialView = 'invite'
  } else if (discountOn) {
    preToastLabel = 'Invite & get 25% off on Premium'
    preToastInitialView = 'invite'
  }
  const formattedDiscountPrice = `₹${PREMIUM_DISCOUNT_PRICE.toLocaleString('en-IN')}`
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [, setTick] = useState(0)

  useEffect(() => {
    clearExpired()
  }, [clearExpired])

  // Tick every second so the countdown stays live
  useEffect(() => {
    if (!discountUnlocked) return
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [discountUnlocked])

  const toggleLike = (id: string) =>
    setLikedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const openPlans = (initialView: 'select' | 'invite' | 'payment') =>
    navigate('/payment-plans', { state: { backgroundLocation: location, initialView } })

  // Shared toast renderers — used in both the fixed bottom strip (mobile)
  // and the top in-flow band (desktop)
  const renderPreToast = () =>
    packsViewed && !discountUnlocked && (
      <div
        role="button"
        tabIndex={0}
        onClick={() => openPlans(preToastInitialView)}
        className="relative flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden px-4 py-2"
        style={{
          borderRadius: 0,
          background: 'linear-gradient(90deg, #90FBD6 0%, #BCF1C2 42.35%, #C8F9E8 100%)',
          backdropFilter: 'blur(3px)',
        }}
      >
        {/* Shimmer sweep every 3 s */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.5) 50%, transparent 65%)' }}
          animate={{ x: ['-100%', '150%'] }}
          transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2 }}
        />
        <img src="/discount.svg" alt="" className="size-[22px] shrink-0" />
        <span
          style={{
            color: '#0B6E4B',
            fontFeatureSettings: "'ss01' on, 'ss02' on, 'ss06' on",
            fontFamily: '"Greed Standard VF", sans-serif',
            fontSize: '16px',
            fontWeight: 500,
            lineHeight: '18px',
          }}
        >
          {preToastLabel}
        </span>
      </div>
    )

  const renderUnlockedToast = () =>
    discountUnlocked && (
      <div
        role="button"
        tabIndex={0}
        onClick={() => openPlans('payment')}
        className="flex w-full cursor-pointer items-center justify-center bg-[#fee2e2] px-4 py-2"
      >
        <span style={{ color: '#DB4848', fontFeatureSettings: "'ss01' on, 'ss02' on, 'ss06' on", fontFamily: '"Greed Standard VF", sans-serif', fontSize: '16px', fontStyle: 'normal', fontWeight: 500, lineHeight: '18px' }}>
          {gracePeriodActive
            ? 'Last chance! Get Premium at ₹3,999'
            : `Get Premium at ${formattedDiscountPrice} for ${formatCountdown(secondsRemaining)}`}
        </span>
      </div>
    )

  return (
    <div className="relative flex h-full flex-col overflow-y-auto bg-white">
      {/* ── Header (sticky on both layouts) ── */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-3 md:px-8 md:py-3 md:border-b md:border-[#f3f0e9]">
        <span className="text-[15px] md:text-[20px] font-medium text-[#011124]">Noor Merchant</span>
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 md:h-9 items-center gap-1 rounded-full md:rounded-none md:border md:border-[#e1e2e5] px-2 md:px-3"
            style={{ background: 'linear-gradient(to right, #d3f4e9, #baf2de)' }}
          >
            {/* Gem icon */}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="md:size-4">
              <path d="M12 2L22 9L18 22H6L2 9Z" fill="#00a36d" />
              <path d="M12 2L6 9H18Z" fill="#00c47e" opacity="0.6" />
            </svg>
            <span className="text-[12px] md:text-[14px] font-semibold text-[#0b6e4b]">
              5<span className="hidden md:inline"> Credits</span>
            </span>
          </div>
          <div className="size-7 md:size-9 overflow-hidden rounded-full md:rounded-none md:border md:border-[#e1e2e5] bg-[#c8b5a0]">
            <img
              src="/mock/faces/face-01.jpg"
              alt=""
              className="size-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        </div>
      </header>

      {/* ── Desktop-only top toast band (in-flow, below header) ──
          Mirrors the mobile bottom strip but pinned to the top of the gallery. */}
      <div className="hidden md:block">
        {renderPreToast()}
        {renderUnlockedToast()}
      </div>

      {/* ── Heading row — title on left, Pay-to-download CTA on right (desktop) ── */}
      <div className="flex items-center justify-between px-4 pb-2 md:px-8 md:pt-6 md:pb-4">
        <h1 className="text-[22px] md:text-[24px] font-medium text-[#011124]">Gallery</h1>
        <button
          type="button"
          className="hidden md:flex h-11 items-center justify-center gap-1 bg-[#011124] text-[16px] text-white px-5"
          onClick={() => openPlans('select')}
        >
          <ArrowDownToLine className="size-5 mr-1" strokeWidth={1.5} />
          Pay to download
        </button>
      </div>

      {/* ── Image grid — vertical column on mobile, 4-col grid on desktop ── */}
      <div className="flex flex-col gap-3 px-4 pb-36 md:grid md:grid-cols-4 md:gap-6 md:px-8 md:pb-12">
        {GALLERY_IMAGES.map((img) => (
          <div
            key={img.id}
            className="relative w-full aspect-square overflow-hidden bg-[#e5ddd5]"
          >
            <img
              src={img.src}
              alt=""
              className="size-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            {img.isTopPick && (
              <div className="absolute left-3 top-3 flex items-center gap-0.5 bg-[#011124] px-2 py-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#f5c542]">
                  TOP
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white">
                  {' '}PICK
                </span>
              </div>
            )}
            <button
              type="button"
              className="absolute right-3 top-3"
              onClick={() => toggleLike(img.id)}
              aria-label="Like"
            >
              <Heart
                className="size-6 drop-shadow-sm"
                fill={likedIds.has(img.id) ? '#ef4444' : 'none'}
                stroke={likedIds.has(img.id) ? '#ef4444' : 'white'}
                strokeWidth={1.5}
              />
            </button>
          </div>
        ))}
      </div>

      {/* ── Mobile-only fixed footer: toast + CTA bar ── */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-20 flex flex-col">
        {renderPreToast()}
        {renderUnlockedToast()}
        {/* CTA bar — immediately below toast, no gap */}
        <div
          className="bg-white px-4 py-3"
          style={{ boxShadow: '0 -8px 24px 0 rgba(0, 0, 0, 0.10)' }}
        >
          <button
            type="button"
            className="flex h-11 w-full items-center justify-center gap-0.5 bg-[#011124] text-[16px] text-white"
            onClick={() => openPlans('select')}
          >
            <ArrowDownToLine className="size-4 mr-1" strokeWidth={1.5} />
            Pay to download
          </button>
        </div>
      </div>
    </div>
  )
}
