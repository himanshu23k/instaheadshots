import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { X, Loader2, CreditCard, ChevronDown, ArrowRight, BadgeCheck } from 'lucide-react'
import { Drawer } from 'vaul'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { Toggle } from './Toggle'
import {
  useReferralStore,
  useReferralStatus,
  formatCountdown,
  type PackId,
  type EmailValidity,
} from '@/store/referral-store'
import {
  DiscountStarHero,
  Icon50,
  Icon4K,
  Icon100,
  Icon03,
  Icon03Light,
  IconSD,
  IconSDLight,
  IconNoCredits,
  IconNoCreditsLight,
  Sparkle,
  CheckIcon,
  CrossIcon,
} from './icons'

/* ─────────────────────────────────────────────────────────────── */
/* Constants                                                         */
/* ─────────────────────────────────────────────────────────────── */

const STANDARD_STRIKE_PRICE = 7500
const PREMIUM_PRICE = 4500
export const PREMIUM_DISCOUNT_PRICE = 3999
const PREMIUM_STRIKE_PRICE = 7500
const STANDARD_PRICE = 3499
const STARTER_PRICE = 2999

const PACK_DATA: Record<PackId, { name: string; price: number; features: { label: string; granted: boolean }[] }> = {
  premium: {
    name: 'Premium',
    price: PREMIUM_PRICE,
    features: [
      { label: '50 headshots', granted: true },
      { label: 'High Resolution', granted: true },
      { label: '100 credits', granted: true },
    ],
  },
  standard: {
    name: 'Standard',
    price: STANDARD_PRICE,
    features: [
      { label: '50 headshots', granted: true },
      { label: 'Standard Resolution', granted: true },
      { label: 'No credits', granted: false },
    ],
  },
  starter: {
    name: 'Starter',
    price: STARTER_PRICE,
    features: [
      { label: '03 headshots', granted: true },
      { label: 'Standard Resolution', granted: true },
      { label: 'No credits', granted: false },
    ],
  },
}

type View = 'select' | 'invite' | 'unlocked' | 'payment'
type SendPhase = 'idle' | 'sending' | 'done-with-error'

const staggerContainer = {
  hidden: {},
  show: { transition: { delayChildren: 0.35, staggerChildren: 0.07 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

// Tracks the `(min-width: 768px)` media query so the sheet can swap its shell
// (bottom drawer on mobile, centered modal on desktop) without remounting
// the body content or losing state.
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches,
  )
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

/* ─────────────────────────────────────────────────────────────── */
/* Root                                                              */
/* ─────────────────────────────────────────────────────────────── */

export function PaymentPlansSheet() {
  const navigate = useNavigate()
  const location = useLocation()
  const isDesktop = useIsDesktop()
  // Callers can navigate with { state: { initialView: 'select' | 'invite' | 'payment' } }
  // to land directly on a specific view (e.g. ReferralPre's contextual CTAs).
  const requestedInitialView = (location.state as { initialView?: View } | null)?.initialView
  const markPacksViewed = useReferralStore((s) => s.markPacksViewed)
  const unlockDiscount = useReferralStore((s) => s.unlockDiscount)
  const markPaid = useReferralStore((s) => s.markPaid)
  const resetDiscount = useReferralStore((s) => s.resetDiscount)
  const setPartialInviteCount = useReferralStore((s) => s.setPartialInviteCount)
  const partialInviteCount = useReferralStore((s) => s.partialInviteCount)
  // Email + invite state lives in the persisted store so it survives sheet unmount/remount.
  // It clears on payment (markPaid) or on the discount-TTL expiry (resetDiscount).
  const emails = useReferralStore((s) => s.emails)
  const emailValidity = useReferralStore((s) => s.emailValidity)
  const setEmailsStore = useReferralStore((s) => s.setEmails)
  const setEmailValidityStore = useReferralStore((s) => s.setEmailValidity)
  const setHasInvitedOnceStore = useReferralStore((s) => s.setHasInvitedOnce)
  // Discount-toggle state persists too — survives sheet close and round-trips
  // through the invite bottom sheet. Clears only on markPaid / resetDiscount.
  const discountOn = useReferralStore((s) => s.discountOn)
  const setDiscountOn = useReferralStore((s) => s.setDiscountOn)
  const { discountUnlocked, secondsRemaining, gracePeriodActive } = useReferralStatus()

  // Initial view priority: explicit `initialView` from navigation state (e.g. ReferralPre
  // CTA → 'invite' / 'payment'), then the returning-user default ('payment' when the
  // discount is already unlocked), otherwise 'select'.
  const computedInitialView: View = requestedInitialView ?? (discountUnlocked ? 'payment' : 'select')
  const [view, setView] = useState<View>(() => computedInitialView)
  const [visibleView, setVisibleView] = useState<View>(() => computedInitialView)
  const [fadeOut, setFadeOut] = useState(false)
  const [transitionActive, setTransitionActive] = useState(false)
  const [animHeight, setAnimHeight] = useState<number | 'auto'>('auto')
  const bodyInnerRef = useRef<HTMLDivElement>(null)
  const transitionLock = useRef(false)
  const [selectedPackId, setSelectedPackId] = useState<PackId>('premium')
  const setEmails = setEmailsStore
  const setEmailValidity = useCallback(
    (
      updater:
        | [EmailValidity, EmailValidity, EmailValidity]
        | ((prev: [EmailValidity, EmailValidity, EmailValidity]) => [EmailValidity, EmailValidity, EmailValidity]),
    ) => {
      const next =
        typeof updater === 'function'
          ? updater(useReferralStore.getState().emailValidity)
          : updater
      setEmailValidityStore(next)
    },
    [setEmailValidityStore],
  )
  const [sendPhase, setSendPhase] = useState<SendPhase>('idle')
  const debounceTimers = useRef<[ReturnType<typeof setTimeout> | null, ReturnType<typeof setTimeout> | null, ReturnType<typeof setTimeout> | null]>([null, null, null])
  const [shareHeadshot, setShareHeadshot] = useState(true)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastKey, setToastKey] = useState(0)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [, setTick] = useState(0)
  // Start closed so vaul plays its slide-up entrance animation
  const [drawerOpen, setDrawerOpen] = useState(false)
  const isClosingRef = useRef(false)

  useEffect(() => {
    requestAnimationFrame(() => setDrawerOpen(true))
  }, [])

  useEffect(() => {
    markPacksViewed()
  }, [markPacksViewed])

  // Keep countdown alive
  useEffect(() => {
    if (view !== 'payment' && !discountUnlocked) return
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [view, discountUnlocked])

  // Auto-advance from unlock animation → payment after 2 s
  useEffect(() => {
    if (view !== 'unlocked') return
    const t = setTimeout(() => setView('payment'), 2000)
    return () => clearTimeout(t)
  }, [view])

  // Reset entire flow when the 2-minute discount timer expires
  const wasDiscountUnlocked = useRef(discountUnlocked)
  useEffect(() => {
    if (wasDiscountUnlocked.current && !discountUnlocked) {
      resetDiscount()
      // Snap immediately — no transition animation for an expiry reset
      transitionLock.current = false
      setTransitionActive(false)
      setFadeOut(false)
      setView('select')
      setVisibleView('select')
      setDiscountOn(false)
      setSendPhase('idle')
      // emails / validity / hasInvitedOnce are already cleared by resetDiscount() above
      setToastVisible(false)
    }
    wasDiscountUnlocked.current = discountUnlocked
  }, [discountUnlocked, resetDiscount])

  // Track body height so outer shell can animate between view heights
  useEffect(() => {
    const el = bodyInnerRef.current
    if (!el) return
    setAnimHeight(el.offsetHeight)
    const ro = new ResizeObserver(() => setAnimHeight(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // 3-phase transition: fade-out (180ms) → height-resize (350ms) → children stagger in
  useEffect(() => {
    if (view === visibleView || transitionLock.current) return
    transitionLock.current = true
    setTransitionActive(true)
    setFadeOut(true)
    let t1: ReturnType<typeof setTimeout>
    let t2: ReturnType<typeof setTimeout>
    t1 = setTimeout(() => {
      setVisibleView(view)
      setFadeOut(false) // reveal instantly — children own their own stagger-in
      t2 = setTimeout(() => {
        setTransitionActive(false)
        transitionLock.current = false
      }, 350)
    }, 180)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      transitionLock.current = false
      setTransitionActive(false)
    }
  }, [view]) // eslint-disable-line react-hooks/exhaustive-deps

  const triggerClose = useCallback(() => {
    if (isClosingRef.current) return
    isClosingRef.current = true
    setDrawerOpen(false)
    // Wait for vaul's slide-down animation before navigating (App.tsx then scales bg back up)
    setTimeout(() => navigate(-1), 500)
  }, [navigate])

  const currentPackPrice =
    selectedPackId === 'premium'
      ? discountOn
        ? PREMIUM_DISCOUNT_PRICE
        : PREMIUM_PRICE
      : PACK_DATA[selectedPackId].price

  const showToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToastVisible(true)
    setToastKey((k) => k + 1)
    toastTimer.current = setTimeout(() => setToastVisible(false), 4000)
  }, [])

  const handleEmailChange = (idx: 0 | 1 | 2, value: string) => {
    const next: [string, string, string] = [...emails] as any
    next[idx] = value
    setEmails(next)

    // Cancel any in-flight validation from a previous blur on this field — the user
    // is editing again so the prior result is stale.
    if (debounceTimers.current[idx]) {
      clearTimeout(debounceTimers.current[idx]!)
      debounceTimers.current[idx] = null
    }

    // Reset validated state immediately when user edits
    setEmailValidity((prev) => {
      if (prev[idx] === 'valid-editable' || prev[idx] === 'invalid' || prev[idx] === 'loading') {
        const n = [...prev] as typeof prev
        n[idx] = 'idle'
        return n
      }
      return prev
    })
  }

  // Run regex validation only when the user leaves the field. Empty fields stay idle.
  const handleEmailBlur = (idx: 0 | 1 | 2) => {
    const value = useReferralStore.getState().emails[idx]
    const currentValidity = useReferralStore.getState().emailValidity[idx]
    // Don't revalidate locked rows or empty fields.
    if (currentValidity === 'valid-locked') return
    if (!value.trim()) {
      setEmailValidity((prev) => { const n = [...prev] as typeof prev; n[idx] = 'idle'; return n })
      return
    }

    setEmailValidity((prev) => { const n = [...prev] as typeof prev; n[idx] = 'loading'; return n })
    if (debounceTimers.current[idx]) clearTimeout(debounceTimers.current[idx]!)
    debounceTimers.current[idx] = setTimeout(() => {
      const valid = isValidEmail(value)
      setEmailValidity((prev) => { const n = [...prev] as typeof prev; n[idx] = valid ? 'valid-editable' : 'invalid'; return n })
      if (!valid) showToast()
    }, 400)
  }

  const handleCTA = () => {
    if (view === 'select') {
      // If the discount is already unlocked (all 3 invites sent), skip the invite step
      // and pay directly at the discounted price.
      if (selectedPackId === 'premium' && discountOn && !discountUnlocked) {
        setView('invite')
      } else {
        setView('payment')
      }
    } else if (view === 'invite') {
      setSendPhase('sending')
      setTimeout(() => {
        if (!useReferralStore.getState().hasInvitedOnce) {
          setHasInvitedOnceStore(true)
          const failIdx = Math.floor(Math.random() * 3) as 0 | 1 | 2
          setEmailValidity((prev) => {
            const n = [...prev] as typeof prev
            for (let i = 0; i < 3; i++) n[i as 0 | 1 | 2] = i === failIdx ? 'invalid' : 'valid-locked'
            return n
          })
          setSendPhase('done-with-error')
          showToast()
        } else {
          setEmailValidity(['valid-locked', 'valid-locked', 'valid-locked'])
          setSendPhase('idle')
          unlockDiscount()
          // Skip the intermediate 'offer applied' celebration — land on payment directly.
          setView('payment')
        }
      }, 1500)
    }
  }

  // ── Shared inner content used by both shells (mobile drawer + desktop modal) ──
  const topChrome =
    visibleView === 'payment' && discountUnlocked ? (
      <div className="shrink-0 bg-[#fee2e2] px-4 py-3 text-center">
        <motion.span
          style={{ color: '#DB4848', fontFeatureSettings: "'ss01' on, 'ss02' on, 'ss06' on", fontFamily: '"Greed Standard VF", sans-serif', fontSize: '16px', fontStyle: 'normal', fontWeight: 500, lineHeight: '18px', display: 'inline-block', transformOrigin: 'center' }}
          animate={gracePeriodActive ? { scale: [1, 1.09, 1, 1.05, 1] } : { scale: 1 }}
          transition={gracePeriodActive ? { duration: 4, ease: 'easeInOut', repeat: Infinity, times: [0, 0.0625, 0.125, 0.1875, 1] } : { duration: 0 }}
        >
          {gracePeriodActive
            ? 'Last chance! Get Premium at ₹3,999'
            : `Extra 25% off expires in ${formatCountdown(secondsRemaining)} mins`}
        </motion.span>
      </div>
    ) : visibleView !== 'unlocked' && !isDesktop ? (
      <div className="shrink-0 flex justify-center pt-4 pb-1">
        <div className="h-1 w-12 rounded-full bg-[#eeeef0]" />
      </div>
    ) : null

  const heightAnimatedBody = (
    <motion.div
      animate={{ height: transitionActive ? animHeight : 'auto' }}
      transition={transitionActive ? { duration: 0.35, ease: [0.32, 0.72, 0, 1] } : { duration: 0 }}
      style={{ overflow: 'hidden' }}
      className="shrink-0"
    >
      <motion.div
        ref={bodyInnerRef}
        animate={{ opacity: fadeOut ? 0 : 1 }}
        transition={fadeOut ? { duration: 0.18, ease: 'easeOut' } : { duration: 0 }}
        className={cn(
          visibleView === 'invite' && 'px-6 md:px-8 pb-[174px] md:pb-[150px]',
          visibleView !== 'invite' && visibleView !== 'unlocked' && 'px-6 md:px-8 pb-6 md:pb-8',
        )}
      >
        {visibleView !== 'unlocked' && (
          <div className={cn('flex items-center mb-4 md:pt-6', visibleView === 'invite' ? 'justify-start' : 'justify-end')}>
            {visibleView === 'invite' ? (
              <button
                type="button"
                onClick={() => {
                  if (sendPhase === 'done-with-error') {
                    const count = emailValidity.filter((v) => v === 'valid-locked').length
                    setPartialInviteCount(count > 0 ? count : null)
                  }
                  setView('select')
                }}
                className="inline-flex size-5 items-center justify-center text-text-primary"
                aria-label="Back"
              >
                <img src="/arrow-left.svg" alt="" className="size-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={triggerClose}
                className="inline-flex size-5 items-center justify-center text-text-primary"
                aria-label="Close"
              >
                <X className="size-5" strokeWidth={1.5} />
              </button>
            )}
          </div>
        )}

        {visibleView === 'select' && (
          <SelectView
            selectedPackId={selectedPackId}
            onSelectPack={setSelectedPackId}
            discountOn={discountOn}
            onToggleDiscount={setDiscountOn}
            partialInviteCount={partialInviteCount}
            discountUnlocked={discountUnlocked}
            secondsRemaining={secondsRemaining}
            gracePeriodActive={gracePeriodActive}
          />
        )}
        {visibleView === 'invite' && (
          <InviteView
            emails={emails}
            onEmailChange={handleEmailChange}
            onEmailBlur={handleEmailBlur}
            emailValidity={emailValidity}
            shareHeadshot={shareHeadshot}
            onShareHeadshotChange={setShareHeadshot}
          />
        )}
        {visibleView === 'unlocked' && <UnlockedView />}
        {visibleView === 'payment' && (
          <PaymentView
            price={discountUnlocked ? PREMIUM_DISCOUNT_PRICE : currentPackPrice}
            onPay={() => {
              markPaid()
              triggerClose()
            }}
          />
        )}
      </motion.div>
    </motion.div>
  )

  const errorToast = (
    <AnimatePresence>
      {visibleView === 'invite' && toastVisible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-x-6 md:inset-x-8 z-10 overflow-hidden"
          style={{ bottom: isDesktop ? 150 : 174 }}
        >
          <InviteToast toastKey={toastKey} onDismiss={() => setToastVisible(false)} />
        </motion.div>
      )}
    </AnimatePresence>
  )

  const footerCTA = visibleView !== 'unlocked' && visibleView !== 'payment' && (
    <FooterCTA
      view={visibleView}
      selectedPackId={selectedPackId}
      discountOn={discountOn}
      discountUnlocked={discountUnlocked}
      currentPackPrice={currentPackPrice}
      sendPhase={sendPhase}
      emailsReady={
        sendPhase !== 'sending' &&
        emailValidity.every((v) => v === 'valid-editable' || v === 'valid-locked') &&
        emailValidity.some((v) => v === 'valid-editable')
      }
      onClick={handleCTA}
    />
  )

  // ── Desktop: centered modal ──
  if (isDesktop) {
    return (
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={triggerClose}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
              <motion.div
                className="pointer-events-auto relative flex flex-col bg-white text-text-primary shadow-[0_24px_64px_0_rgba(0,0,0,0.24)] w-[1180px] max-w-full max-h-[calc(100vh-32px)] overflow-hidden"
                style={{ fontFamily: 'var(--font-greed)' }}
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              >
                {topChrome}
                {heightAnimatedBody}
                {errorToast}
                {footerCTA}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    )
  }

  // ── Mobile: vaul bottom drawer (unchanged) ──
  return (
    <>
      <Drawer.Root
        open={drawerOpen}
        onOpenChange={(open) => !open && triggerClose()}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60" />
          <Drawer.Content
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white text-text-primary shadow-[0_-8px_24px_0_rgba(0,0,0,0.08)] max-h-[calc(100dvh-40px)]"
            style={{ fontFamily: 'var(--font-greed)' }}
          >
            {topChrome}
            {heightAnimatedBody}
            {errorToast}
            {footerCTA}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────── */
/* Select view — State 2                                            */
/* ─────────────────────────────────────────────────────────────── */

function SelectView({
  selectedPackId,
  onSelectPack,
  discountOn,
  onToggleDiscount,
  partialInviteCount,
  discountUnlocked,
  secondsRemaining,
  gracePeriodActive,
}: {
  selectedPackId: PackId
  onSelectPack: (id: PackId) => void
  discountOn: boolean
  onToggleDiscount: (v: boolean) => void
  partialInviteCount: number | null
  discountUnlocked: boolean
  secondsRemaining: number
  gracePeriodActive: boolean
}) {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-8 h-[calc(100dvh-124px)] overflow-y-auto md:h-auto md:overflow-visible">
      <motion.header variants={staggerItem} className="flex flex-col gap-3">
        <h1 className="text-[24px] leading-[28px] font-medium text-text-primary">
          Select a pack
        </h1>
        <p className="text-[16px] leading-[22px] text-text-secondary">
          Get print ready headshots and unlock credits with premium pack.
        </p>
      </motion.header>

      <motion.div
        variants={staggerItem}
        className="flex flex-col gap-4 pb-[84px] md:grid md:grid-cols-3 md:gap-x-3 md:gap-y-0 md:pb-[100px]"
      >
          {/* Toggle / timer slot — sits above the Premium column only on desktop (row 1, col 1).
              When the discount is already unlocked (all 3 invites complete) the toggle is
              replaced by the red countdown banner. */}
          <div className="md:col-start-1 md:row-start-1">
            {discountUnlocked ? (
              <div className="flex w-full items-center justify-center bg-[#fee2e2] px-4 py-2 h-[62px]">
                <motion.span
                  style={{ color: '#DB4848', fontFeatureSettings: "'ss01' on, 'ss02' on, 'ss06' on", fontFamily: '"Greed Standard VF", sans-serif', fontSize: '16px', fontStyle: 'normal', fontWeight: 500, lineHeight: '18px', display: 'inline-block', transformOrigin: 'center' }}
                  animate={gracePeriodActive ? { scale: [1, 1.09, 1, 1.05, 1] } : { scale: 1 }}
                  transition={gracePeriodActive ? { duration: 4, ease: 'easeInOut', repeat: Infinity, times: [0, 0.0625, 0.125, 0.1875, 1] } : { duration: 0 }}
                >
                  {gracePeriodActive
                    ? 'Last chance! Get Premium at ₹3,999'
                    : `Extra 25% off expires in ${formatCountdown(secondsRemaining)} mins`}
                </motion.span>
              </div>
            ) : (
              <DiscountToggleCard checked={discountOn} onChange={onToggleDiscount} partialInviteCount={partialInviteCount} />
            )}
          </div>
          {/* Premium section — both expanded and collapsed always mounted, height animates */}
          <div onClick={() => onSelectPack('premium')} className="flex flex-col -mt-4 md:mt-0 md:cursor-pointer md:col-start-1 md:row-start-2">
            <motion.div
              initial={false}
              animate={{
                height: selectedPackId === 'premium' ? 'auto' : 0,
                opacity: selectedPackId === 'premium' ? 1 : 0,
              }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              style={{ overflow: 'hidden', pointerEvents: selectedPackId === 'premium' ? 'auto' : 'none' }}
              className="md:!h-full md:!opacity-100 md:!pointer-events-auto"
            >
              <PremiumCard discountOn={discountOn} selected={selectedPackId === 'premium'} />
            </motion.div>
            <motion.div
              initial={false}
              animate={{
                height: selectedPackId !== 'premium' ? 'auto' : 0,
                opacity: selectedPackId !== 'premium' ? 1 : 0,
              }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              style={{ overflow: 'hidden', pointerEvents: selectedPackId !== 'premium' ? 'auto' : 'none' }}
              className="md:hidden"
            >
              <PremiumCardCollapsed discountOn={discountOn} onClick={() => onSelectPack('premium')} />
            </motion.div>
          </div>

          {/* Standard */}
          <div onClick={() => onSelectPack('standard')} className="md:cursor-pointer md:col-start-2 md:row-start-2">
            <motion.div
              initial={false}
              animate={{
                height: selectedPackId === 'standard' ? 'auto' : 0,
                opacity: selectedPackId === 'standard' ? 1 : 0,
              }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              style={{ overflow: 'hidden', pointerEvents: selectedPackId === 'standard' ? 'auto' : 'none' }}
              className="md:!h-full md:!opacity-100 md:!pointer-events-auto"
            >
              <NonPremiumCardExpanded id="standard" selected={selectedPackId === 'standard'} />
            </motion.div>
            <motion.div
              initial={false}
              animate={{
                height: selectedPackId !== 'standard' ? 'auto' : 0,
                opacity: selectedPackId !== 'standard' ? 1 : 0,
              }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              style={{ overflow: 'hidden', pointerEvents: selectedPackId !== 'standard' ? 'auto' : 'none' }}
              className="md:hidden"
            >
              <PackageCard {...PACK_DATA.standard} onClick={() => onSelectPack('standard')} />
            </motion.div>
          </div>

          {/* Starter */}
          <div onClick={() => onSelectPack('starter')} className="md:cursor-pointer md:col-start-3 md:row-start-2">
            <motion.div
              initial={false}
              animate={{
                height: selectedPackId === 'starter' ? 'auto' : 0,
                opacity: selectedPackId === 'starter' ? 1 : 0,
              }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              style={{ overflow: 'hidden', pointerEvents: selectedPackId === 'starter' ? 'auto' : 'none' }}
              className="md:!h-full md:!opacity-100 md:!pointer-events-auto"
            >
              <NonPremiumCardExpanded id="starter" selected={selectedPackId === 'starter'} />
            </motion.div>
            <motion.div
              initial={false}
              animate={{
                height: selectedPackId !== 'starter' ? 'auto' : 0,
                opacity: selectedPackId !== 'starter' ? 1 : 0,
              }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              style={{ overflow: 'hidden', pointerEvents: selectedPackId !== 'starter' ? 'auto' : 'none' }}
              className="md:hidden"
            >
              <PackageCard {...PACK_DATA.starter} onClick={() => onSelectPack('starter')} />
            </motion.div>
          </div>
        </motion.div>
    </motion.div>
  )
}

// All particles travel upward (negative dy) so the burst emerges from the
// top edge of the card. dx spreads them left/right for a fan shape.
const CONFETTI_PARTICLES = [
  { id: 0,  dx: -110, dy:  -90, color: '#00EA9C', w: 6, h: 3, rot: 45 },
  { id: 1,  dx:  -40, dy: -120, color: '#FFFFFF', w: 3, h: 5, rot: -30 },
  { id: 2,  dx: -150, dy:  -60, color: '#90FBD6', w: 5, h: 4, rot: 20 },
  { id: 3,  dx:   30, dy: -110, color: '#00A36D', w: 4, h: 4, rot: 60 },
  { id: 4,  dx: -180, dy:  -40, color: '#BCF1C2', w: 6, h: 3, rot: -45 },
  { id: 5,  dx:   90, dy:  -80, color: '#FFFFFF', w: 3, h: 5, rot: 15 },
  { id: 6,  dx:  -75, dy: -140, color: '#00EA9C', w: 5, h: 3, rot: -60 },
  { id: 7,  dx:  140, dy:  -50, color: '#90FBD6', w: 4, h: 6, rot: 30 },
  { id: 8,  dx: -200, dy:  -85, color: '#00EA9C', w: 4, h: 4, rot: -20 },
  { id: 9,  dx:   60, dy: -130, color: '#FFFFFF', w: 5, h: 3, rot: 45 },
  { id: 10, dx: -125, dy: -160, color: '#BCF1C2', w: 6, h: 4, rot: -15 },
  { id: 11, dx:  170, dy:  -95, color: '#00A36D', w: 3, h: 5, rot: 70 },
]

/* Discount toggle banner */
function DiscountToggleCard({
  checked,
  onChange,
  partialInviteCount,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  partialInviteCount: number | null
}) {
  const [confettiActive, setConfettiActive] = useState(false)
  const hasConfettiedRef = useRef(false)

  const handleChange = (v: boolean) => {
    if (v && !hasConfettiedRef.current) {
      hasConfettiedRef.current = true
      setConfettiActive(true)
      setTimeout(() => setConfettiActive(false), 700)
    }
    onChange(v)
  }

  return (
    <div className="relative">
      {/* Confetti burst — emerges upward from the top edge of the card.
          Origin is at the horizontal center of the top edge; particles fan up and outward. */}
      <AnimatePresence>
        {confettiActive && CONFETTI_PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="pointer-events-none absolute"
            style={{ left: '50%', top: 0, width: p.w, height: p.h, backgroundColor: p.color, borderRadius: 1, zIndex: 20 }}
            initial={{ x: 0, y: 0, opacity: 0, rotate: 0, scale: 0.5 }}
            animate={{ x: p.dx, y: p.dy, opacity: [0, 1, 1, 0], rotate: p.rot, scale: 1 }}
            exit={{}}
            transition={{ duration: 1.0, ease: [0.18, 0.7, 0.3, 1], delay: p.id * 0.02, times: [0, 0.15, 0.65, 1] }}
          />
        ))}
      </AnimatePresence>
      <div
        className="relative flex items-center justify-between overflow-hidden px-4 py-[10px]"
        style={{
          borderRadius: 0,
          background: 'linear-gradient(90deg, #90FBD6 0%, #BCF1C2 42.35%, #C8F9E8 100%)',
          backdropFilter: 'blur(3px)',
          borderTop: '2px solid #a9f2cc',
          borderLeft: '2px solid #a9f2cc',
          borderRight: '2px solid #a9f2cc',
        }}
      >
        {/* Diagonal hatch pattern fading in from top-right corner */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-32"
          style={{
            backgroundImage: 'repeating-linear-gradient(-45deg, rgba(11,110,75,0.18) 0px, rgba(11,110,75,0.18) 1.5px, transparent 1.5px, transparent 9px)',
            maskImage: 'linear-gradient(to left, black 10%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to left, black 10%, transparent 100%)',
          }}
        />
        {/* Shimmer sweep every 3 s — stops once the discount toggle is on */}
        {!checked && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.5) 50%, transparent 65%)' }}
            animate={{ x: ['-100%', '150%'] }}
            transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2 }}
          />
        )}
        <div className="flex min-w-0 flex-col gap-1">
          <p
            style={{
              color: '#003000',
              fontSize: '16px',
              fontWeight: 500,
              lineHeight: '18px',
              fontFeatureSettings: "'ss01' on, 'ss02' on, 'ss06' on",
            }}
          >
            Get an extra 25% off Premium
          </p>
          <motion.p
            className="text-[14px] leading-[18px] text-[rgba(0,48,0,0.8)]"
            style={{ transformOrigin: 'left center' }}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.18, 1] }}
            transition={{ duration: 1.7, times: [0, 0.45, 1], ease: [0.22, 1, 0.36, 1], delay: 0.45 }}
          >
            {partialInviteCount != null ? `${partialInviteCount}/3 invited` : 'Invite 3 coworkers to unlock'}
          </motion.p>
        </div>
        <Toggle
          checked={checked}
          onChange={handleChange}
          ariaLabel="Toggle extra 25% off discount"
        />
      </div>

    </div>
  )
}

/* Premium card — expanded state.
   `selected = true` (default): dark theme, original look.
   `selected = false` (desktop only, when another pack is chosen): light theme with the
   same BEST VALUE ribbon retained. */
function PremiumCard({ discountOn, selected = true }: { discountOn: boolean; selected?: boolean }) {
  return (
    <div
      className={cn(
        'relative p-4 h-full',
        selected ? 'bg-[#011124] text-white' : 'bg-white text-text-primary',
      )}
      style={{ border: selected ? '2px solid #c2f5e3' : '1px solid #e1e2e5' }}
    >
      <BestValueRibbon />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <p className={cn('text-[16px] leading-[22px]', selected ? 'text-white' : 'text-text-primary')}>Premium</p>
          <div className="flex flex-col gap-2 items-start">
            <div className="flex items-end gap-1">
              <span className="text-[20px] leading-[22px] text-[#99a0a7] line-through">
                ₹{PREMIUM_STRIKE_PRICE.toLocaleString('en-IN')}
              </span>
              {/* ₹4,500 with animated green strike-through line */}
              <div className="relative inline-block">
                <span className={cn('text-[20px] leading-[22px]', selected ? 'text-white' : 'text-text-primary')}>
                  ₹{PREMIUM_PRICE.toLocaleString('en-IN')}
                </span>
                <AnimatePresence>
                  {discountOn && (
                    <motion.div
                      className="pointer-events-none absolute left-0 right-0 bg-[#00EA9C]"
                      style={{ top: '50%', height: '2px', originX: 0 }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      exit={{ scaleX: 0 }}
                      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                    />
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {discountOn && (
                  <motion.span
                    key="premium-discount-price"
                    className={cn('text-[20px] leading-[22px] inline-block', selected ? 'text-white' : 'text-text-primary')}
                    style={{ transformOrigin: 'left center' }}
                    initial={{ opacity: 0, x: -6, scale: 1 }}
                    animate={{ opacity: 1, x: 0, scale: [1, 1.4, 1] }}
                    exit={{ opacity: 0, x: -6, scale: 1 }}
                    transition={{
                      duration: 0.25,
                      scale: { duration: 0.55, times: [0, 0.4, 1], ease: [0.34, 1.56, 0.64, 1], delay: 0.08 },
                    }}
                  >
                    ₹{PREMIUM_DISCOUNT_PRICE.toLocaleString('en-IN')}
                  </motion.span>
                )}
              </AnimatePresence>
              <span className={cn('text-[11px] leading-[16px] tracking-[0.88px] uppercase ml-0.5', selected ? 'text-white' : 'text-text-primary')}>
                INR
              </span>
            </div>
            <div className={cn('flex items-center px-2 py-0.5', selected ? 'bg-white' : 'bg-[#011124]')}>
              <span className={cn('shrink-0 text-[11px] leading-[16px] tracking-[0.88px] uppercase whitespace-nowrap', selected ? 'text-[#003000]' : 'text-white')}>
                47% OFF
              </span>
              <motion.span
                className={cn('text-[11px] leading-[16px] tracking-[0.88px] uppercase whitespace-nowrap inline-block overflow-hidden', selected ? 'text-[#003000]' : 'text-white')}
                initial={false}
                animate={{
                  maxWidth: discountOn ? 200 : 0,
                  opacity: discountOn ? 1 : 0,
                  filter: discountOn ? 'blur(0px)' : 'blur(4px)',
                }}
                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              >
                &nbsp;&nbsp;+ 25% EXTRA
              </motion.span>
            </div>
          </div>
        </div>

        <div className={cn('h-px -mx-4', selected ? 'bg-white/10' : 'bg-[#e1e2e5]')} />

        <div className="flex flex-col gap-3">
          <BenefitRow
            icon={<Icon50 size={64} />}
            title="All 50 headshots"
            subtitle="You keep everything"
            light={!selected}
          />
          <BenefitRow
            icon={<Icon4K size={64} />}
            title="High resolution Print ready"
            subtitle="Send it directly to your printer"
            light={!selected}
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
            light={!selected}
          />
        </div>
      </div>
    </div>
  )
}

/* Premium card — collapsed state (when another pack is selected) */
function PremiumCardCollapsed({
  discountOn,
  onClick,
}: {
  discountOn: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white border border-[#e1e2e5]"
    >
      {/* Title + BEST VALUE */}
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-[16px] leading-[22px] text-text-primary">Premium</p>
        <div className="flex items-center gap-1">
          <Sparkle size={10} color="#00EA9C" />
          <span className="text-[11px] tracking-[0.88px] uppercase text-[#00EA9C]">Best Value</span>
        </div>
      </div>

      {/* Price row */}
      <div className="px-4 pb-3 flex flex-wrap items-center gap-1.5">
        <span className="text-[16px] text-[#99a0a7] line-through">
          ₹{PREMIUM_STRIKE_PRICE.toLocaleString('en-IN')}
        </span>
        {/* ₹4,500 with animated green strike-through */}
        <div className="relative inline-block">
          <span className="text-[16px] text-text-primary">
            ₹{PREMIUM_PRICE.toLocaleString('en-IN')}
          </span>
          <AnimatePresence>
            {discountOn && (
              <motion.div
                className="pointer-events-none absolute left-0 right-0 bg-[#00EA9C]"
                style={{ top: '50%', height: '2px', originX: 0 }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0 }}
                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              />
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {discountOn && (
            <motion.span
              className="text-[16px] text-text-primary"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.25 }}
            >
              ₹{PREMIUM_DISCOUNT_PRICE.toLocaleString('en-IN')}
            </motion.span>
          )}
        </AnimatePresence>
        <span className="text-[10px] tracking-[0.88px] uppercase text-text-primary">INR</span>
        {/* Same sliding badge as expanded card */}
        <div className="flex items-center bg-[#011124] px-1.5 py-0.5">
          <span className="shrink-0 text-[10px] tracking-[0.7px] uppercase text-white whitespace-nowrap">
            47% OFF
          </span>
          <motion.span
            className="text-[10px] tracking-[0.7px] uppercase text-white whitespace-nowrap inline-block overflow-hidden"
            initial={false}
            animate={{
              maxWidth: discountOn ? 200 : 0,
              opacity: discountOn ? 1 : 0,
              filter: discountOn ? 'blur(0px)' : 'blur(4px)',
            }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          >
            &nbsp;+ 10% EXTRA
          </motion.span>
        </div>
      </div>

      {/* Feature chips */}
      <div
        className="px-4 py-2 flex items-center gap-2 border-t border-[rgba(44,44,44,0.08)]"
        style={{ background: 'linear-gradient(to right, #f6f5f3 30%, rgba(255,255,255,0) 100%)' }}
      >
        {PACK_DATA.premium.features.map((f, i) => (
          <span key={f.label} className="flex items-center gap-1 shrink-0">
            <CheckIcon size={12} color="#011124" />
            <span className="text-[12px] leading-[14px] text-text-primary">{f.label}</span>
            {i < PACK_DATA.premium.features.length - 1 && (
              <span className="ml-1 size-1 rounded-full bg-[rgba(44,44,44,0.18)]" />
            )}
          </span>
        ))}
      </div>
    </button>
  )
}

/* Non-premium pack — expanded card.
   `selected = true` (default): dark theme, matches mobile single-selection behaviour.
   `selected = false`: light theme for desktop's side-by-side 3-up grid, where only the
   chosen pack is dark and the others are light. Mobile never renders this with
   selected=false. */
function NonPremiumCardExpanded({
  id,
  selected = true,
}: {
  id: 'standard' | 'starter'
  selected?: boolean
}) {
  const pack = PACK_DATA[id]
  return (
    <div
      className={cn(
        'p-4 flex flex-col gap-4 h-full',
        selected
          ? 'bg-[#011124] text-white'
          : 'bg-white text-text-primary border border-[#e1e2e5]',
      )}
    >
      <div className="flex flex-col gap-3">
        <p className={cn('text-[16px] leading-[22px]', selected ? 'text-white' : 'text-text-primary')}>{pack.name}</p>
        {/* Wrap price + a desktop-only invisible spacer so the divider below sits at the same
            vertical position as the Premium card's divider (which has a 47% OFF badge here). */}
        <div className="flex flex-col gap-2 items-start">
          <div className="flex items-end gap-1">
            {id === 'standard' && (
              <span
                className={cn(
                  'text-[20px] leading-[22px] line-through',
                  selected ? 'text-[#99a0a7]' : 'text-[#99a0a7]',
                )}
              >
                ₹{STANDARD_STRIKE_PRICE.toLocaleString('en-IN')}
              </span>
            )}
            <span className={cn('text-[20px] leading-[22px]', selected ? 'text-white' : 'text-text-primary')}>
              ₹{pack.price.toLocaleString('en-IN')}
            </span>
            <span className={cn('text-[11px] leading-[16px] tracking-[0.88px] uppercase ml-0.5', selected ? 'text-white' : 'text-text-primary')}>
              INR
            </span>
          </div>
          <div aria-hidden="true" className="hidden md:block h-5 w-px" />
        </div>
      </div>

      <div className={cn('h-px -mx-4', selected ? 'bg-white/10' : 'bg-[#e1e2e5]')} />

      <div className="flex flex-col gap-3">
        <BenefitRow
          icon={id === 'standard' ? <Icon50 size={64} /> : selected ? <Icon03 size={64} /> : <Icon03Light size={64} />}
          title={id === 'standard' ? 'All 50 headshots' : 'Select 3 Headshots'}
          subtitle="For the ones you love"
          light={!selected}
        />
        <BenefitRow
          icon={selected ? <IconSD size={64} /> : <IconSDLight size={64} />}
          title="Standard resolution"
          subtitle={<>Good for general purpose.<br />Can convert high res with credits.</>}
          light={!selected}
        />
        <BenefitRow
          icon={selected ? <IconNoCredits size={64} /> : <IconNoCreditsLight size={64} />}
          title="No credits"
          subtitle="You would have to buy credits to edit and create new headshots"
          light={!selected}
        />
      </div>
    </div>
  )
}

/* Package card — non-selected light card for Standard / Starter */
function PackageCard({
  name,
  price,
  features,
  onClick,
}: {
  name: string
  price: number
  features: { label: string; granted: boolean }[]
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white border border-[#e1e2e5] flex flex-col gap-4"
    >
      <div className="px-4 pt-4 flex flex-col gap-3">
        <p className="text-[16px] leading-[20px] text-text-primary">{name}</p>
        <div className="flex items-baseline gap-1 text-text-primary">
          <span className="text-[20px] leading-[22px]">₹{price.toLocaleString('en-IN')}</span>
          <span className="text-[11px] leading-[16px] tracking-[0.88px] uppercase">INR</span>
        </div>
      </div>
      <div
        className="px-4 py-2 flex items-center gap-2 border-t border-[rgba(44,44,44,0.08)]"
        style={{ background: 'linear-gradient(to right, #f6f5f3 30%, rgba(255,255,255,0) 100%)' }}
      >
        {features.map((f, i) => (
          <span key={f.label} className="flex items-center gap-1 shrink-0">
            {f.granted ? (
              <CheckIcon size={14} color="#011124" />
            ) : (
              <CrossIcon size={14} color="#011124" />
            )}
            <span className="text-[12px] leading-[14px] text-text-primary">{f.label}</span>
            {i < features.length - 1 && (
              <span className="ml-1 size-1 rounded-full bg-[rgba(44,44,44,0.18)]" />
            )}
          </span>
        ))}
      </div>
    </button>
  )
}

function BestValueRibbon() {
  return (
    <div className="absolute top-3 right-[-2px] pointer-events-none select-none">
      <div className="relative">
        <div
          className="flex h-6 items-center gap-1.5 pl-6 pr-3"
          style={{ background: 'linear-gradient(to left, #005438 4.6%, rgba(0,84,56,0) 97%)' }}
        >
          <Sparkle size={11} color="#00EA9C" />
          <span className="text-[11px] leading-[16px] tracking-[0.88px] uppercase text-[#00EA9C]">
            BEST VALUE
          </span>
        </div>
        <div
          className="absolute right-0 top-6 w-[5px] h-[5px]"
          style={{ background: '#003000', clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
        />
      </div>
    </div>
  )
}

function BenefitRow({
  icon,
  title,
  subtitle,
  light = false,
}: {
  icon: React.ReactNode
  title: string
  subtitle: React.ReactNode
  /** Swap typography colors for a light-themed card. Default false = dark card. */
  light?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0 size-16 flex items-center justify-center">{icon}</div>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <p className={cn('text-[16px] leading-[20px]', light ? 'text-text-primary' : 'text-white')}>{title}</p>
        <div className={cn('text-[14px] leading-[18px]', light ? 'text-text-secondary' : 'text-[#99a0a7]')}>{subtitle}</div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────── */
/* Invite error toast                                                */
/* ─────────────────────────────────────────────────────────────── */

const TOAST_DURATION = 4000

function InviteToast({ toastKey, onDismiss }: { toastKey: number; onDismiss: () => void }) {
  return (
    <div className="relative flex items-center justify-between bg-[#011124] pl-2 pr-3 py-2 overflow-hidden">
      {/* Icon + text */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex size-[40px] shrink-0 items-center justify-center">
          <img src="/error-icon.png" alt="" className="size-6" />
        </div>
        <p
          className="text-white"
          style={{
            fontFamily: '"Greed Standard VF", sans-serif',
            fontSize: '16px',
            lineHeight: '20px',
            fontFeatureSettings: "'ss01' 1, 'ss02' 1, 'ss06' 1",
          }}
        >
          Please enter a valid email
        </p>
      </div>
      {/* Divider + dismiss */}
      <div className="flex shrink-0 items-center gap-4 ml-3">
        <div className="h-6 w-px bg-white/20" />
        <button type="button" onClick={onDismiss} className="text-white/60 hover:text-white transition-colors">
          <X className="size-5" strokeWidth={1.5} />
        </button>
      </div>
      {/* Neon progress bar — drains over TOAST_DURATION */}
      <motion.div
        key={toastKey}
        className="absolute bottom-0 left-0 h-[2px] bg-[#00ea9c]"
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: TOAST_DURATION / 1000, ease: 'linear' }}
        style={{ transformOrigin: 'left', width: '100%' }}
      />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────── */
/* Invite view — State 3                                            */
/* ─────────────────────────────────────────────────────────────── */

function InviteView({
  emails,
  onEmailChange,
  onEmailBlur,
  emailValidity,
  shareHeadshot,
  onShareHeadshotChange,
}: {
  emails: [string, string, string]
  onEmailChange: (idx: 0 | 1 | 2, value: string) => void
  onEmailBlur: (idx: 0 | 1 | 2) => void
  emailValidity: [EmailValidity, EmailValidity, EmailValidity]
  shareHeadshot: boolean
  onShareHeadshotChange: (v: boolean) => void
}) {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-8">
      <motion.header variants={staggerItem} className="flex flex-col gap-3">
        <h1 className="text-[24px] leading-[28px] font-medium text-text-primary">
          Invite 3 coworkers to get an extra 25% off
        </h1>
        <p className="text-[16px] leading-[22px] text-text-secondary">
          We will only invite them to try InstaHeadshots. No other marketing or spam.
        </p>
      </motion.header>

      {/* Email inputs */}
      <motion.div variants={staggerItem} className="flex flex-col gap-3">
        {([0, 1, 2] as const).map((i) => {
          const v = emailValidity[i]
          const locked = v === 'valid-locked'
          return (
            <div key={i} className="relative">
              <input
                type="email"
                placeholder={`Email ${i + 1}`}
                value={emails[i]}
                readOnly={locked}
                onChange={(e) => !locked && onEmailChange(i, e.target.value)}
                onBlur={() => !locked && onEmailBlur(i)}
                // Suppress browser/password-manager autofill — these inputs are for inviting
                // coworkers, not the user's own email, so saved-email suggestions are misleading.
                name={`invite-coworker-${i}`}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-1p-ignore
                data-lpignore="true"
                data-form-type="other"
                className={cn(
                  'h-[40px] w-full border px-3 text-[16px] leading-[22px] outline-none transition-colors duration-150',
                  (v === 'loading' || v === 'invalid' || v === 'valid-locked') && 'pr-10',
                  'placeholder:text-[#99a0a7]',
                  locked
                    ? 'bg-[#f5f5f6] border-transparent text-[#011124] cursor-default'
                    : v === 'valid-editable'
                      ? 'bg-white border-[#011124] text-[#011124]'
                      : v === 'invalid'
                        ? 'bg-white border-[#db4848] text-[#011124]'
                        : v === 'loading'
                          ? 'bg-white border-[#e1e2e5] text-[#99a0a7]'
                          : 'bg-white border-[#e1e2e5] text-[#011124] focus:border-[#011124]',
                )}
              />
              {v === 'loading' && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-[#99a0a7]" />
              )}
              {v === 'invalid' && (
                <img src="/error-icon.png" alt="" className="absolute right-3 top-1/2 -translate-y-1/2 size-4" />
              )}
              {v === 'valid-locked' && (
                <img src="/check.svg" alt="" className="absolute right-3 top-1/2 -translate-y-1/2 size-4" />
              )}
            </div>
          )
        })}
      </motion.div>

      {/* Headshot share toggle — Figma 265:1303 */}
      <motion.div variants={staggerItem} className="flex flex-col gap-2">
        <div style={{ height: '1px', backgroundImage: 'repeating-linear-gradient(to right, #E1E2E5 0, #E1E2E5 4px, transparent 4px, transparent 12px)' }} />
        <div className="flex items-center justify-between gap-2 py-1">
          {/* Photo area — 44×43px, dashed placeholder + rotated thumbnail */}
          <div className="relative h-[43px] w-[44px] shrink-0">
            {/* Dashed background placeholder */}
            <div className="absolute left-[4px] top-1/2 -translate-y-1/2 size-[40px] rounded-[2px] bg-[#efeff1] border-[0.5px] border-dashed border-[#c8cad0]" />
            {/* Animated photo thumbnail */}
            <div className="absolute left-0 top-0 flex size-[43px] items-center justify-center">
              <motion.div
                initial={false}
                animate={{
                  x: shareHeadshot ? 0 : 2.5,
                  y: shareHeadshot ? 0 : 0,
                  rotate: shareHeadshot ? -4 : 0,
                  filter: shareHeadshot
                    ? 'grayscale(0) drop-shadow(0px 4px 8px rgba(0,0,0,0.16))'
                    : 'grayscale(1) drop-shadow(0px 0px 0px rgba(0,0,0,0))',
                }}
                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              >
                <div className="size-[40px] overflow-hidden rounded-[2px] border-[0.5px] border-[#e1e2e5]">
                  <img
                    src="/user-image.png"
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </div>
          <p
            className="flex-1 text-text-primary"
            style={{
              fontFeatureSettings: "'ss01' 1, 'ss02' 1, 'ss06' 1",
              fontSize: '16px',
              lineHeight: '22px',
            }}
          >
            Include your headshot in the invite
          </p>
          <Toggle
            checked={shareHeadshot}
            onChange={onShareHeadshotChange}
            ariaLabel="Include headshot in invite"
          />
        </div>
        <div style={{ height: '1px', backgroundImage: 'repeating-linear-gradient(to right, #E1E2E5 0, #E1E2E5 4px, transparent 4px, transparent 12px)' }} />
      </motion.div>

    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────── */
/* Offer-unlock animation — auto-advances after 2 s                */
/* ─────────────────────────────────────────────────────────────── */

function UnlockedView() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-6 py-12">
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 14, stiffness: 180 }}
      >
        <DiscountStarHero size={110} />
      </motion.div>
      <motion.div
        className="flex flex-col items-center gap-2 px-6 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <h2 className="text-[24px] font-semibold leading-[28px] text-[#011124]">
          25% off unlocked!
        </h2>
        <p className="text-[15px] leading-[20px] text-[#99a0a7]">
          Your discount is locked in for 30 minutes
        </p>
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────── */
/* Payment view — State 4                                           */
/* ─────────────────────────────────────────────────────────────── */

function PaymentView({ price, onPay }: { price: number; onPay: () => void }) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [name, setName] = useState('')

  const formatCardNumber = (v: string) =>
    v
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(.{4})/g, '$1 ')
      .trim()

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col pb-8">
      {/* Item 1 — header + action buttons */}
      <motion.div variants={staggerItem}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[12px] leading-[16px] text-text-secondary mb-1">
              InstaHeadshots - Packs
            </p>
            <p className="text-[30px] font-semibold leading-none text-[#011124]">
              ₹{price.toLocaleString('en-IN')}.00
            </p>
          </div>
          <div className="bg-[#f5c542] px-2 py-1 rounded-[2px]">
            <span className="text-[10px] font-bold tracking-wider text-[#7a6000]">TEST MODE</span>
          </div>
        </div>

        <div className="flex gap-3 mb-5">
          <button
            type="button"
            className="flex items-center gap-1 border border-[#e1e2e5] px-3 py-1.5 text-[13px] text-text-primary"
          >
            Add code <ChevronDown className="size-3" />
          </button>
          <button
            type="button"
            className="flex items-center gap-1 border border-[#e1e2e5] px-3 py-1.5 text-[13px] text-text-primary"
          >
            View details <ChevronDown className="size-3" />
          </button>
        </div>
      </motion.div>

      {/* Item 2 — divider + email row */}
      <motion.div variants={staggerItem}>
        <div className="h-px bg-[#e1e2e5] mb-5" />
        <div className="flex items-center justify-between border border-[#e1e2e5] px-3 py-2.5 mb-5">
          <span className="text-[14px] text-text-secondary">Email</span>
          <span className="text-[14px] text-text-primary">devansh@magicstudio.com</span>
        </div>
      </motion.div>

      {/* Item 3 — payment method */}
      <motion.div variants={staggerItem}>
        <h3 className="text-[16px] font-medium leading-[22px] text-text-primary mb-3">
          Payment method
        </h3>

        <div className="border border-[#e1e2e5] mb-6">
          <div className="flex items-center gap-2 border-b border-[#e1e2e5] px-3 py-3">
            <CreditCard className="size-4 text-text-primary" />
            <span className="text-[14px] text-text-primary">Card</span>
          </div>

          <div className="border-b border-[#e1e2e5] px-3 py-3">
            <p className="text-[12px] text-text-secondary mb-2">Card information</p>
            <div className="flex items-center border border-[#e1e2e5] px-3 py-2">
              <input
                type="text"
                inputMode="numeric"
                placeholder="1234 1234 1234 1234"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                className="flex-1 text-[14px] outline-none placeholder:text-[#c0c4cc] bg-transparent"
              />
              <div className="flex items-center gap-0.5 shrink-0">
                <div className="w-7 h-[18px] rounded-[2px] bg-[#1a1f71] flex items-center justify-center">
                  <span className="text-[6px] font-extrabold text-white tracking-wider">VISA</span>
                </div>
                <div className="w-7 h-[18px] rounded-[2px] border border-[#e1e2e5] bg-white flex items-center justify-center overflow-hidden">
                  <div className="flex">
                    <div className="w-3 h-3 rounded-full bg-[#EB001B] opacity-90" />
                    <div className="-ml-1.5 w-3 h-3 rounded-full bg-[#F79E1B] opacity-90" />
                  </div>
                </div>
                <div className="w-7 h-[18px] rounded-[2px] border border-[#e1e2e5] bg-[#2E77BC] flex items-center justify-center">
                  <span className="text-[5px] font-bold text-white tracking-tight">AMEX</span>
                </div>
              </div>
            </div>
            <div className="flex border border-t-0 border-[#e1e2e5]">
              <input
                type="text"
                placeholder="MM / YY"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                className="flex-1 border-r border-[#e1e2e5] px-3 py-2 text-[14px] outline-none placeholder:text-[#c0c4cc] bg-transparent"
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder="CVC"
                maxLength={4}
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="flex-1 px-3 py-2 text-[14px] outline-none placeholder:text-[#c0c4cc] bg-transparent"
              />
            </div>
          </div>

          <div className="border-b border-[#e1e2e5] px-3 py-3">
            <p className="text-[12px] text-text-secondary mb-1.5">Cardholder name</p>
            <input
              type="text"
              placeholder="Full name on card"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-[14px] outline-none placeholder:text-[#c0c4cc] bg-transparent"
            />
          </div>

          <div className="px-3 py-3">
            <p className="text-[12px] text-text-secondary mb-1.5">Country or region</p>
            <select className="w-full text-[14px] text-text-primary outline-none bg-transparent">
              <option>India</option>
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Canada</option>
              <option>Australia</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Item 4 — pay button + legal */}
      <motion.div variants={staggerItem}>
        <button
          type="button"
          onClick={onPay}
          className="w-full h-12 bg-[#011124] text-white text-[16px] flex items-center justify-center hover:bg-[#000811] active:translate-y-px transition-colors"
        >
          Pay
        </button>

        <p className="mt-4 text-[12px] text-center leading-[18px] text-text-secondary">
          By placing your order, you agree to our{' '}
          <a href="#" className="underline text-text-primary">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="underline text-text-primary">
            Privacy Policy
          </a>
          .
        </p>
        <div className="mt-3 flex items-center justify-center gap-3">
          <span className="text-[12px] text-text-secondary">Powered by stripe</span>
          <span className="text-[12px] text-text-secondary">|</span>
          <a href="#" className="text-[12px] text-text-secondary underline">
            Legal
          </a>
          <span className="text-[12px] text-text-secondary">|</span>
          <a href="#" className="text-[12px] text-text-secondary underline">
            Returns
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────── */
/* Footer CTA                                                        */
/* ─────────────────────────────────────────────────────────────── */

function FooterCTA({
  view,
  selectedPackId,
  discountOn,
  discountUnlocked,
  currentPackPrice,
  sendPhase,
  emailsReady,
  onClick,
}: {
  view: View
  selectedPackId: PackId
  discountOn: boolean
  discountUnlocked: boolean
  currentPackPrice: number
  sendPhase: SendPhase
  emailsReady: boolean
  onClick: () => void
}) {
  // When the discount is already unlocked, the Premium price is always the discounted one
  // regardless of the toggle state — and we never route back through invites.
  const premiumDiscountActive = selectedPackId === 'premium' && (discountUnlocked || discountOn)
  let leftLabel = `₹${(premiumDiscountActive ? PREMIUM_DISCOUNT_PRICE : currentPackPrice).toLocaleString('en-IN')}`
  let rightLabel = 'Pay to Continue'
  let disabled = false

  if (view === 'select') {
    if (selectedPackId === 'premium' && discountOn && !discountUnlocked) {
      rightLabel = 'Invite & Unlock'
    }
  } else if (view === 'invite') {
    leftLabel = `₹${PREMIUM_DISCOUNT_PRICE.toLocaleString('en-IN')}`
    rightLabel = 'Invite & Pay'
    disabled = !emailsReady || sendPhase === 'sending'
  }

  const isSending = view === 'invite' && sendPhase === 'sending'

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col px-6 py-3 bg-white md:px-8 md:py-4">
      {view === 'invite' && (
        <p className="mb-4 text-[16px] leading-[22px] text-[#67707C]" style={{ fontFeatureSettings: "'ss01' on, 'ss02' on, 'ss06' on" }}>
          Discount will be applicable for the next 30 minutes.
        </p>
      )}
      <div
        className={cn(
          'flex flex-col gap-2',
          view === 'invite' && 'md:flex-row-reverse md:gap-3',
          view === 'select' && 'md:flex-row md:items-stretch md:justify-end md:gap-0',
        )}
      >
      {/* Desktop-only "One time payment" assurance ribbon — select view only */}
      {view === 'select' && (
        <div
          className="hidden md:flex h-11 items-center gap-2 bg-[#C8F9E8] pl-7 pr-5 text-[16px] leading-[22px] text-[#011124]"
          style={{ clipPath: 'polygon(14px 0, 100% 0, 100% 100%, 14px 100%, 0 50%)' }}
        >
          <BadgeCheck className="size-5 text-[#003000]" strokeWidth={2} fill="#00EA9C" />
          <span style={{ fontFeatureSettings: "'ss01' on, 'ss02' on, 'ss06' on" }}>
            One time payment, no subscription!
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'flex h-11 items-center justify-center px-6 bg-[#011124] text-white transition-colors',
          'hover:bg-[#000811] active:translate-y-px',
          'disabled:bg-[#99a0a7] disabled:cursor-not-allowed',
          view === 'invite' ? 'w-full md:flex-1' : 'w-full md:w-auto',
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isSending ? (
            <motion.div
              key="sending"
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {([0, 1, 2] as const).map((dot) => (
                <motion.div
                  key={dot}
                  className="size-2 bg-[rgba(217,217,217,0.8)]"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity, delay: dot * 0.2, ease: 'easeInOut' }}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={`${leftLabel}|${rightLabel}`}
              className="flex items-center"
              initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
            >
              {leftLabel && (
                <>
                  <span className="text-[16px] leading-[22px]">{leftLabel}</span>
                  <span className="text-[16px] leading-[22px] text-white/30 mx-2">|</span>
                </>
              )}
              <span className="text-[16px] leading-[22px]">{rightLabel}</span>
              {view === 'select' && (
                <ArrowRight className="hidden md:block size-5 ml-3" strokeWidth={1.5} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      </div>
    </div>
  )
}
