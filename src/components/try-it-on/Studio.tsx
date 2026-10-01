import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Heart, RotateCcw, Share } from 'lucide-react'
import { cn } from '@/lib/utils'
import { currentLook, useTryItOnStore, type Look } from '@/store/try-it-on-store'
import { GENERATING_STEPS, SLOT_LABEL, type Slot } from './try-it-on-data'
import { CreditsIcon, Credits, EditIcon, Notice, PrimaryButton, Spinner } from './ui'
import { C, FONT } from './tokens'

const EASE = [0.32, 0.72, 0, 1] as const

/** Room the floating CTA takes at the bottom (16 + 45 + 16). Cards stop above it; the trials grid runs under it. */
const CTA_SPACE = 'pb-[77px]'

// ── Card chrome ──────────────────────────────────────────────────────────────

function GlassButton({
  label,
  onClick,
  children,
  className,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'absolute flex items-center justify-center rounded-full border border-white p-1 backdrop-blur-[6px] transition-transform active:scale-90',
        className,
      )}
      style={{
        background: 'rgba(255,255,255,0.8)',
        boxShadow: 'inset 0 2px 12px rgba(255,255,255,0.3)',
        color: C.text,
      }}
    >
      <span className="p-0.5">{children}</span>
    </button>
  )
}

/** Blurred photo with Figma's dot grid — the base of every "working" state. */
function BlurredPhoto({ src }: { src: string }) {
  return (
    <>
      <img src={src} alt="" className="absolute inset-0 size-full scale-110 object-cover blur-[14px]" />
      <div className="absolute inset-0 bg-white/10" />
      <div
        className="absolute inset-0 animate-pulse"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.75) 1.2px, transparent 1.6px)',
          backgroundSize: '15px 15px',
          maskImage: 'linear-gradient(90deg, #000 0%, rgba(0,0,0,0.85) 45%, transparent 85%)',
          WebkitMaskImage: 'linear-gradient(90deg, #000 0%, rgba(0,0,0,0.85) 45%, transparent 85%)',
        }}
      />
    </>
  )
}

function Hotspot({ slot, x, y, onClick }: { slot: Slot; x: number; y: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Swap ${SLOT_LABEL[slot].toLowerCase()}`}
      className="group absolute -translate-x-1/2 -translate-y-1/2 p-2"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span className="absolute inset-2 animate-ping rounded-full bg-white/60" aria-hidden />
      <span
        className="relative block size-3.5 rounded-full bg-white transition-transform group-hover:scale-125"
        style={{
          boxShadow: '0 0 0 2px rgba(0,4,9,0.25), 0 2px 8px rgba(0,0,0,0.25)',
        }}
      />
    </button>
  )
}

// ── Cards ────────────────────────────────────────────────────────────────────

function LookCard({ look, isBase, active }: { look: Look; isBase: boolean; active: boolean }) {
  const phase = useTryItOnStore((s) => s.phase)
  const openSheet = useTryItOnStore((s) => s.openSheet)
  const tryOn = useTryItOnStore((s) => s.tryOn)
  const toggleFavorite = useTryItOnStore((s) => s.toggleFavorite)
  const showBanner = useTryItOnStore((s) => s.showBanner)
  const refreshing = isBase && phase === 'refreshing-base'
  const full = look.render.framing === 'full'
  const hotspots = Object.entries(look.render.hotspots ?? {}).filter(([slot]) =>
    look.pieces.some((p) => p.slot === slot),
  ) as [Slot, { x: number; y: number }][]

  const share = async () => {
    const url = `${window.location.origin}${look.render.image}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Magicstudio Try It On', url })
        return
      }
      await navigator.clipboard.writeText(url)
      showBanner({ kind: 'success', text: 'Link copied' })
    } catch {
      // The user closed the share sheet.
    }
  }

  return (
    <div
      className="relative min-h-0 flex-1 overflow-hidden rounded-[12px] border border-white bg-[#E7E8EA]"
      style={{ boxShadow: '0 2px 24px rgba(0,0,0,0.08)' }}
    >
      {refreshing ? (
        <>
          <BlurredPhoto src={look.render.image} />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-[40px] text-center">
            <span className="flex size-8 items-center justify-center rounded-full bg-white/80">
              <Spinner size={18} className="text-[#000409]/60" />
            </span>
            <p
              className="text-[14px] leading-[16px] text-white"
              style={{
                fontWeight: 450,
                textShadow: '0 1px 8px rgba(0,0,0,0.25)',
              }}
            >
              We are refreshing your base hang in there while we get it right for you to continue your spree
            </p>
          </div>
        </>
      ) : (
        <motion.img
          key={look.render.image}
          src={look.render.image}
          alt={isBase ? 'Your base photo' : `You wearing ${look.pieces.map((p) => p.name).join(', ')}`}
          draggable={false}
          initial={{ opacity: 0, filter: 'blur(12px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, ease: EASE }}
          className={cn('absolute inset-0 size-full object-cover', full ? 'object-[50%_20%]' : 'object-top')}
        />
      )}

      {!refreshing && (
        <>
          <GlassButton
            label="Fix your base photo"
            onClick={() => openSheet({ name: 'redo' })}
            className="left-[9px] top-[9px]"
          >
            <EditIcon />
          </GlassButton>

          {!isBase && (
            <button
              type="button"
              onClick={toggleFavorite}
              aria-label={look.favorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={look.favorite}
              className="absolute right-2.5 top-2.5 p-1 transition-transform active:scale-90"
            >
              <motion.span
                key={String(look.favorite)}
                initial={{ scale: look.favorite ? 0.6 : 1 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className="block"
              >
                <Heart
                  size={22}
                  strokeWidth={1.5}
                  color={look.favorite ? '#FF356F' : '#FFFFFF'}
                  fill={look.favorite ? '#FF356F' : 'transparent'}
                  style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.25))' }}
                />
              </motion.span>
            </button>
          )}

          {!isBase && full && active && hotspots.length > 0 && (
            <>
              <span
                className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-[rgba(0,4,9,0.45)] px-3 py-1.5 text-[12px] leading-[14px] text-white backdrop-blur"
                style={{ fontWeight: 450 }}
              >
                Tap a piece to swap it
              </span>
              {hotspots.map(([slot, p]) => (
                <Hotspot key={slot} slot={slot} x={p.x} y={p.y} onClick={() => openSheet({ name: 'swap', slot })} />
              ))}
            </>
          )}

          {!isBase && (
            <>
              <button
                type="button"
                onClick={() => tryOn(look.pieces)}
                className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/70 px-3 py-1.5 text-[12px] leading-[14px] backdrop-blur-[6px] transition-transform active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  color: C.text,
                  fontWeight: 450,
                }}
              >
                {full && <RotateCcw size={13} strokeWidth={1.8} />}
                {full ? 'Wear the same outfit' : 'Try the same outfit'}
                <span className="h-3 w-px bg-black/20" aria-hidden />
                <span className="flex items-center gap-1">
                  <CreditsIcon size={13} />1
                </span>
              </button>
              <button
                type="button"
                onClick={share}
                aria-label="Share"
                className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-[6px] backdrop-blur-[6px] transition-transform active:scale-90"
                style={{ background: 'rgba(0,4,9,0.3)' }}
              >
                <Share size={16} strokeWidth={1.6} color="#fff" />
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}

/** A render in progress or one that failed — Figma 370:45210 → 370:47723, 370:51592. */
function PendingCard({ source }: { source: string }) {
  const phase = useTryItOnStore((s) => s.phase)
  const step = useTryItOnStore((s) => s.genStep)
  const pieces = useTryItOnStore((s) => s.genPieces)
  const retry = useTryItOnStore((s) => s.retry)
  const styling = pieces.filter((p) => p.source !== 'base')
  const failed = phase === 'failed'

  return (
    <div
      className="relative min-h-0 flex-1 overflow-hidden rounded-[12px] border border-white"
      style={{ boxShadow: '0 2px 24px rgba(0,0,0,0.08)' }}
    >
      <BlurredPhoto src={source} />
      <AnimatePresence>
        {failed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center text-white"
            style={{ background: 'rgba(110,28,28,0.62)' }}
          >
            <p className="text-[16px] leading-[18px]" style={{ fontWeight: 450 }}>
              Image wasn't created
            </p>
            <p className="text-[14px] leading-[16px] text-white/80">No credits used</p>
            <button
              type="button"
              onClick={retry}
              className="mt-3 flex items-center gap-1.5 rounded-[6px] px-3 py-2 text-[14px] leading-[16px] transition-transform active:scale-95"
              style={{ background: '#E04848', fontWeight: 450 }}
            >
              <RotateCcw size={14} strokeWidth={2} /> Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {!failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div
            className="flex items-center gap-2 rounded-[8px] px-3 py-2 text-[14px] leading-[16px] text-white backdrop-blur-md"
            style={{ background: 'rgba(0,4,9,0.32)', fontWeight: 420 }}
          >
            <Spinner size={14} />
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={step}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {GENERATING_STEPS[step]}
              </motion.span>
            </AnimatePresence>
          </div>
          {styling.length > 1 && (
            <div className="flex flex-wrap justify-center gap-1.5 px-6">
              {styling.map((p) => (
                <span
                  key={p.id}
                  className="rounded-full bg-white/85 px-2.5 py-1 text-[12px] leading-[14px]"
                  style={{ color: C.text, fontWeight: 450 }}
                >
                  {p.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** Figma "Base Look Container": grey strip tucked under the card. */
function Caption({ isBase }: { isBase: boolean }) {
  const createNewLook = useTryItOnStore((s) => s.createNewLook)
  return (
    <div
      className="-mt-5 flex shrink-0 items-end justify-center gap-2.5 rounded-b-[12px] px-3 pb-3 pt-8 text-[14px] leading-[16px]"
      style={{ background: C.grey03, color: C.secondary, fontWeight: 450 }}
    >
      {isBase ? (
        'Anything you try goes on top of your base'
      ) : (
        <>
          <span className="truncate" style={{ fontWeight: 420 }}>
            Try something new on your base again
          </span>
          <span className="h-3.5 w-px shrink-0 bg-black/15" aria-hidden />
          <button
            type="button"
            onClick={createNewLook}
            className="shrink-0 underline underline-offset-2 hover:opacity-70"
            style={{ color: C.text }}
          >
            Create new look
          </button>
        </>
      )}
    </div>
  )
}

// ── Home: base | past trials — Claude Design 4b ─────────────────────────────

/**
 * The grid of past generations; tapping one opens it on its own. The heading
 * sits above the grid and condenses once the grid scrolls: the title steps
 * down a size and the subtitle folds away.
 */
function PastTrials({ active }: { active: boolean }) {
  const looks = useTryItOnStore((s) => s.looks)
  const setView = useTryItOnStore((s) => s.setView)
  const [condensed, setCondensed] = useState(false)
  return (
    // Let the edge that peeks in from the base stay inert — it only signals there's more.
    <div className="relative flex h-full flex-col" inert={!active}>
      {/* Soft edge where the grid meets the bottom of the screen. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-white to-transparent"
        aria-hidden
      />
      {/* Hidden while the panel only peeks in from the base, so its tiles line up
          with the top of the base photo; it comes down once the panel is swiped in. */}
      {/* The heading block is white and, once the grid has scrolled, carries a
          fade below it so tiles soften as they pass under it rather than cut off. */}
      <div className="relative z-10 shrink-0 bg-white">
        <motion.div
          initial={false}
          animate={{
            height: active ? 'auto' : 0,
            opacity: active ? 1 : 0,
            y: active ? 0 : -12,
          }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="overflow-hidden"
          aria-hidden={!active}
        >
          <div className="px-1 pb-4">
            <motion.h2
              animate={{
                fontSize: condensed ? '20px' : '24px',
                lineHeight: condensed ? '22px' : '26px',
              }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="tracking-[-0.288px]"
              style={{ fontWeight: 450, color: C.text }}
            >
              Past Trials
            </motion.h2>
            <motion.p
              initial={false}
              animate={{
                height: condensed ? 0 : 'auto',
                opacity: condensed ? 0 : 1,
                marginTop: condensed ? 0 : 8,
              }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden text-[16px] leading-[18px]"
              style={{ fontWeight: 420, color: C.secondary }}
            >
              Pick any trial to complete or modify the look
            </motion.p>
          </div>
        </motion.div>
        <div
          className="pointer-events-none absolute inset-x-0 top-full h-6 bg-gradient-to-b from-white to-transparent transition-opacity duration-200"
          style={{ opacity: active && condensed ? 1 : 0 }}
          aria-hidden
        />
      </div>
      <div
        className="scrollbar-hide min-h-0 flex-1 overflow-y-auto pb-6"
        onScroll={(e) => setCondensed(e.currentTarget.scrollTop > 8)}
      >
        <div className="grid grid-cols-2 gap-2">
          {looks.map((look) => (
            <button
              key={look.id}
              type="button"
              onClick={() => setView({ name: 'look', id: look.id })}
              aria-label={`Open look: ${look.pieces
                .filter((p) => p.source !== 'base')
                .map((p) => p.name)
                .join(', ')}`}
              className="relative aspect-[3/4] overflow-hidden rounded-[12px] border border-white bg-[#E7E8EA] transition-transform duration-150 active:scale-[0.97]"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
            >
              <img
                src={look.render.image}
                alt=""
                draggable={false}
                className={cn(
                  'absolute inset-0 size-full object-cover',
                  look.render.framing === 'full' ? 'object-[50%_20%]' : 'object-top',
                )}
              />
              {look.favorite && (
                <Heart
                  size={16}
                  className="absolute right-2 top-2"
                  color="#FF356F"
                  fill="#FF356F"
                  style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Two panels side by side. On the base, the past-trials panel's edge peeks in
 * from the right with no label or icon; swipe left and the base's edge peeks in
 * from the left. With no past trials yet, the base fills the width.
 */
function HomePanels() {
  const base = useTryItOnStore((s) => s.base)
  const hasTrials = useTryItOnStore((s) => s.looks.length > 0)
  const view = useTryItOnStore((s) => s.view)
  const setView = useTryItOnStore((s) => s.setView)
  const panel = view.name === 'home' ? view.panel : 0
  const track = useRef<HTMLDivElement>(null)
  const programmatic = useRef(false)

  const scrollToPanel = (p: 0 | 1, behavior: ScrollBehavior) => {
    const el = track.current
    if (!el) return
    const left = p === 0 ? 0 : el.scrollWidth - el.clientWidth
    if (Math.abs(el.scrollLeft - left) < 2) return
    programmatic.current = true
    el.scrollTo({ left, behavior })
    window.setTimeout(() => (programmatic.current = false), behavior === 'smooth' ? 450 : 0)
  }

  // Land on the right panel without animating (e.g. coming back from a look).
  useLayoutEffect(() => {
    scrollToPanel(panel, 'instant')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    scrollToPanel(panel, 'smooth')
  }, [panel])

  const onScroll = () => {
    const el = track.current
    if (!el || programmatic.current) return
    const next: 0 | 1 = el.scrollLeft > (el.scrollWidth - el.clientWidth) / 2 ? 1 : 0
    if (next !== panel) setView({ name: 'home', panel: next })
  }

  return (
    <div
      ref={track}
      onScroll={onScroll}
      className={cn(
        'scrollbar-hide flex h-full snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain px-2',
        !hasTrials && 'overflow-x-hidden',
      )}
      style={{ scrollPaddingInline: 8 }}
    >
      <div
        className={cn(
          'flex h-full shrink-0 snap-start flex-col',
          CTA_SPACE,
          hasTrials ? 'w-[calc(100%-32px)]' : 'w-full',
        )}
        onClickCapture={(e) => {
          // Tapping the base's peeking edge swipes back to it.
          if (panel === 1) {
            e.stopPropagation()
            e.preventDefault()
            setView({ name: 'home', panel: 0 })
          }
        }}
      >
        <LookCard look={base} isBase active={panel === 0} />
        <Caption isBase />
      </div>
      {hasTrials && (
        <div
          className="h-full w-[calc(100%-32px)] shrink-0 snap-end"
          onClick={() => panel === 0 && setView({ name: 'home', panel: 1 })}
        >
          <PastTrials active={panel === 1} />
        </div>
      )}
    </div>
  )
}

// ── Banner above the CTA ─────────────────────────────────────────────────────

function BannerSlot() {
  const banner = useTryItOnStore((s) => s.banner)
  const key = useTryItOnStore((s) => s.bannerKey)
  const dismiss = useTryItOnStore((s) => s.dismissBanner)
  return (
    <div className="pointer-events-none absolute inset-x-2 bottom-[calc(100%+8px)] z-10">
      <AnimatePresence mode="popLayout">
        {banner && (
          <div key={key} className="pointer-events-auto">
            {banner.kind === 'favorite' ? (
              <Notice tone="success" duration={3500} onClose={dismiss}>
                <span className="-my-1 flex items-center gap-2.5">
                  <img src={banner.image} alt="" className="h-8 w-6 rounded-[3px] object-cover" />
                  Added to Favorites
                </span>
              </Notice>
            ) : banner.kind === 'success' ? (
              <Notice tone="success" duration={3000} onClose={dismiss}>
                {banner.text}
              </Notice>
            ) : (
              <Notice tone={banner.kind === 'error' ? 'error' : 'info'} duration={4000} onClose={dismiss}>
                {banner.text}
              </Notice>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Screen ───────────────────────────────────────────────────────────────────

/**
 * The try-on studio. Home is the base (CTA "Pick an Outfit", the simple
 * one-piece flow) with past trials a swipe away. A finished render, or a past
 * trial tapped in the grid, opens on its own with "Complete the Look", which
 * opens the slot builder.
 */
export function Studio({ onBack }: { onBack: () => void }) {
  const credits = useTryItOnStore((s) => s.credits)
  const view = useTryItOnStore((s) => s.view)
  const phase = useTryItOnStore((s) => s.phase)
  const genFrom = useTryItOnStore((s) => s.genFrom)
  const genSource = useTryItOnStore((s) => s.genSource)
  const hasTrials = useTryItOnStore((s) => s.looks.length > 0)
  const look = useTryItOnStore((s) => (s.view.name === 'look' ? currentLook(s) : null))
  const sheetOpen = useTryItOnStore((s) => s.sheets.length > 0)
  const setView = useTryItOnStore((s) => s.setView)
  const openSheet = useTryItOnStore((s) => s.openSheet)
  const openBuilder = useTryItOnStore((s) => s.openBuilder)

  const goBack = () => (view.name === 'home' ? onBack() : setView({ name: 'home', panel: hasTrials ? 1 : 0 }))

  let cta: {
    label: string
    disabled: boolean
    hidden?: boolean
    onClick: () => void
  }
  if (view.name === 'look') {
    cta = { label: 'Complete the Look', disabled: false, onClick: openBuilder }
  } else if (view.name === 'pending') {
    cta = {
      label: genFrom === 'base' ? 'Pick an Outfit' : 'Complete the Look',
      disabled: true,
      onClick: () => {},
    }
  } else {
    cta = {
      label: 'Pick an Outfit',
      disabled: phase === 'refreshing-base',
      hidden: view.panel === 1,
      onClick: () => openSheet({ name: 'pick' }),
    }
  }

  // Swap screens with a short slide: deeper (a look) comes in from the right.
  const screenKey = view.name === 'look' ? `look-${view.id}` : view.name
  const deeper = view.name !== 'home'

  return (
    <motion.div
      className="absolute inset-0 flex flex-col overflow-hidden bg-white"
      style={{ ...FONT, transformOrigin: 'top center' }}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        scale: sheetOpen ? 0.94 : 1,
        y: sheetOpen ? 10 : 0,
        borderRadius: sheetOpen ? 12 : 0,
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.42, ease: EASE }}
    >
      <header className="flex h-[60px] shrink-0 items-center justify-between px-6">
        <button
          type="button"
          onClick={goBack}
          aria-label="Go back"
          className="-ml-2 p-2 transition-opacity hover:opacity-70"
        >
          <ArrowLeft size={24} strokeWidth={1.5} color={C.text} />
        </button>
        <div className="-mr-1.5">
          <Credits value={credits} />
        </div>
      </header>

      <main className="relative min-h-0 flex-1 pt-4">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={screenKey}
            className="h-full"
            initial={{ opacity: 0, x: deeper ? 28 : -28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: deeper ? -28 : 28 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
          >
            {view.name === 'home' && <HomePanels />}
            {view.name === 'pending' && (
              <div className={cn('flex h-full flex-col px-2', CTA_SPACE)}>
                <PendingCard source={genSource} />
                <Caption isBase />
              </div>
            )}
            {view.name === 'look' && look && (
              <div className={cn('flex h-full flex-col px-2', CTA_SPACE)}>
                <LookCard look={look} isBase={false} active />
                <Caption isBase={false} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-6 pb-4 pt-4">
        <BannerSlot />
        <div
          className="transition-opacity duration-200"
          style={{
            opacity: cta.hidden ? 0 : 1,
            pointerEvents: cta.hidden ? 'none' : 'auto',
          }}
          aria-hidden={cta.hidden}
        >
          <PrimaryButton disabled={cta.disabled} onClick={cta.onClick}>
            {cta.label}
          </PrimaryButton>
        </div>
      </div>
    </motion.div>
  )
}
