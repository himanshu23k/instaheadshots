import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Heart, ArrowDownToLine } from 'lucide-react'
import { motion } from 'motion/react'
import { useReferralStore, useReferralStatus, formatCountdown } from '@/store/referral-store'

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
  const { packsViewed, discountUnlocked, secondsRemaining } = useReferralStatus()
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

  return (
    // Outer wrapper — desktop can swap this for a centred phone frame later
    <div className="relative flex h-full flex-col overflow-y-auto bg-white">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-3">
        <span className="text-[15px] font-medium text-[#011124]">Noor Merchant</span>
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 items-center gap-1 rounded-full px-2"
            style={{ background: 'linear-gradient(to right, #d3f4e9, #baf2de)' }}
          >
            {/* Gem icon */}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L22 9L18 22H6L2 9Z" fill="#00a36d" />
              <path d="M12 2L6 9H18Z" fill="#00c47e" opacity="0.6" />
            </svg>
            <span className="text-[12px] font-semibold text-[#0b6e4b]">5</span>
          </div>
          <div className="size-7 overflow-hidden rounded-full bg-[#c8b5a0]">
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

      {/* ── Gallery heading ── */}
      <div className="px-4 pb-2">
        <h1 className="text-[22px] font-semibold text-[#011124]">Gallery</h1>
      </div>

      {/* ── Image list — pb clears the fixed footer ── */}
      <div className="flex flex-col gap-3 px-4 pb-36">
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

      {/* ── Fixed footer — toast (if visible) + CTA bar, stacked flush with no gap ── */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex flex-col">
        {/* Toast: referral promo (after packs viewed, discount not yet unlocked) */}
        {packsViewed && !discountUnlocked && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate('/payment-plans', { state: { backgroundLocation: location } })}
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
              Get an extra 25% off Premium
            </span>
          </div>
        )}

        {/* Toast: countdown timer (after discount unlocked, before paid) */}
        {discountUnlocked && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate('/payment-plans', { state: { backgroundLocation: location } })}
            className="flex w-full cursor-pointer items-center justify-center bg-[#fee2e2] px-4 py-2"
          >
            <span style={{ color: '#DB4848', fontFeatureSettings: "'ss01' on, 'ss02' on, 'ss06' on", fontFamily: '"Greed Standard VF", sans-serif', fontSize: '16px', fontStyle: 'normal', fontWeight: 500, lineHeight: '18px' }}>
              Extra 25% off expires in {formatCountdown(secondsRemaining)} mins
            </span>
          </div>
        )}

        {/* CTA bar — immediately below toast, no gap */}
        <div
          className="bg-white px-4 py-3"
          style={{ boxShadow: '0 -8px 24px 0 rgba(0, 0, 0, 0.10)' }}
        >
          <button
            type="button"
            className="flex h-11 w-full items-center justify-center gap-0.5 bg-[#011124] text-[16px] text-white"
            onClick={() => navigate('/payment-plans', { state: { backgroundLocation: location } })}
          >
            <ArrowDownToLine className="size-4 mr-1" strokeWidth={1.5} />
            Pay to download
          </button>
        </div>
      </div>
    </div>
  )
}
