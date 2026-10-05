import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue } from 'motion/react'
import { ArrowLeft, Heart, RotateCcw, Share } from 'lucide-react'
import { cn } from '@/lib/utils'
import { VERSION, currentLook, useTryItOnStore, type Look } from '@/store/try-it-on-store'
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

/** Shared-element id that ties a Past Trials tile to its opened card. */
const trialLayoutId = (id: string) => `trial-${id}`

/** How far the caption reaches below its card (it tucks 20px under it). */
const CAPTION_H = 40

/**
 * Width of a 3:4 portrait card that fits its size container (`containerType:
 * size`), leaving room for a caption under it and `gutter` px beside it. Narrow
 * screens are limited by width, short ones by height.
 */
const portraitWidth = (caption: boolean, gutter = 0) =>
  `min(calc(100cqw - ${gutter}px), calc((100cqh - ${caption ? CAPTION_H : 0}px) * 3 / 4))`

/** Every generated image — base, render in progress, finished look — is a 3:4 portrait. */
function Portrait({ width, children }: { width: string; children: React.ReactNode }) {
  return (
    <div className="flex shrink-0 flex-col" style={{ width, aspectRatio: '3 / 4' }}>
      {children}
    </div>
  )
}

/** How much of the previous and next look shows at each edge while browsing trials. */
const PEEK = 20
/** Space between neighbouring looks in that row. */
const GAP = 16
const GROW = { type: 'spring', stiffness: 380, damping: 36, mass: 0.9 } as const

export function LookCard({
  look,
  isBase,
  active,
  layoutId,
  startFresh = false,
}: {
  look: Look
  isBase: boolean
  active: boolean
  /** Set when the card opened from a Past Trials tile — it grows out of it. */
  layoutId?: string
  /** v4 (Figma 3391:14790): the pill under a look starts afresh on the base instead of re-wearing it. */
  startFresh?: boolean
}) {
  const phase = useTryItOnStore((s) => s.phase)
  const openSheet = useTryItOnStore((s) => s.openSheet)
  const tryOn = useTryItOnStore((s) => s.tryOn)
  const toggleFavorite = useTryItOnStore((s) => s.toggleFavorite)
  const showBanner = useTryItOnStore((s) => s.showBanner)
  const openBuilder = useTryItOnStore((s) => s.openBuilder)
  const createNewLook = useTryItOnStore((s) => s.createNewLook)
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
    <motion.div
      layoutId={layoutId}
      transition={GROW}
      className="relative min-h-0 flex-1 overflow-hidden border border-white bg-[#E7E8EA]"
      // borderRadius as a style so the shared transition keeps the corners round while it scales.
      style={{ borderRadius: 12, boxShadow: '0 2px 24px rgba(0,0,0,0.08)' }}
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
          // Growing out of a tile, the photo is already there — only fresh renders blur in.
          // `layout` keeps it from stretching while the card changes shape around it.
          layout={layoutId ? true : undefined}
          initial={layoutId ? false : { opacity: 0, filter: 'blur(12px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={layoutId ? GROW : { duration: 0.6, ease: EASE }}
          className={cn('absolute inset-0 size-full object-cover', full ? 'object-[50%_20%]' : 'object-top')}
        />
      )}

      {!refreshing && (
        <motion.div
          className="absolute inset-0 [&>*]:pointer-events-auto"
          style={{ pointerEvents: 'none' }}
          initial={layoutId ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: layoutId ? 0.25 : 0 }}
        >
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
              onClick={() => toggleFavorite(look.id)}
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
                <Hotspot
                  key={slot}
                  slot={slot}
                  x={p.x}
                  y={p.y}
                  // v3/v4 swap in the same outfit sheet, opened on that slot.
                  onClick={() => (VERSION >= 3 ? openBuilder(slot) : openSheet({ name: 'swap', slot }))}
                />
              ))}
            </>
          )}

          {!isBase && startFresh && (
            <button
              type="button"
              onClick={createNewLook}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white px-4 py-2 text-[12px] leading-[14px] backdrop-blur-[6px] transition-transform active:scale-95"
              style={{ background: 'rgba(255,255,255,0.8)', color: C.text, fontWeight: 450, boxShadow: 'inset 0 2px 12px rgba(255,255,255,0.3)' }}
            >
              Start A Fresh
            </button>
          )}

          {!isBase && (
            <>
              {!startFresh && (
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
              )}
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
        </motion.div>
      )}
    </motion.div>
  )
}

/** A render in progress or one that failed — Figma 370:45210 → 370:47723, 370:51592. */
export function PendingCard({ source }: { source: string }) {
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
export function Caption({ isBase }: { isBase: boolean }) {
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

/** One trial in the grid: tap to open it (it grows into the full card), heart to like it. */
function TrialTile({ look, onOpen }: { look: Look; onOpen: () => void }) {
  const toggleFavorite = useTryItOnStore((s) => s.toggleFavorite)
  const names = look.pieces
    .filter((p) => p.source !== 'base')
    .map((p) => p.name)
    .join(', ')
  return (
    <motion.div
      layoutId={trialLayoutId(look.id)}
      transition={GROW}
      className="relative aspect-[3/4] overflow-hidden border border-white bg-[#E7E8EA]"
      style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open look: ${names}`}
        className="absolute inset-0 transition-transform duration-150 active:scale-[0.97]"
      >
        <motion.img
          layout
          transition={GROW}
          src={look.render.image}
          alt=""
          draggable={false}
          className={cn(
            'absolute inset-0 size-full object-cover',
            look.render.framing === 'full' ? 'object-[50%_20%]' : 'object-top',
          )}
        />
      </button>
      <button
        type="button"
        onClick={() => toggleFavorite(look.id)}
        aria-label={look.favorite ? `Unlike ${names}` : `Like ${names}`}
        aria-pressed={look.favorite}
        className="absolute right-1 top-1 p-1.5 transition-transform active:scale-90"
      >
        <motion.span
          key={String(look.favorite)}
          initial={{ scale: look.favorite ? 0.6 : 1 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          className="block"
        >
          <Heart
            size={18}
            strokeWidth={1.6}
            color={look.favorite ? '#FF356F' : '#FFFFFF'}
            fill={look.favorite ? '#FF356F' : 'transparent'}
            style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))' }}
          />
        </motion.span>
      </button>
    </motion.div>
  )
}

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
            <TrialTile key={look.id} look={look} onOpen={() => setView({ name: 'look', id: look.id, fromGrid: true })} />
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
        style={{ containerType: 'size' }}
        onClickCapture={(e) => {
          // Tapping the base's peeking edge swipes back to it.
          if (panel === 1) {
            e.stopPropagation()
            e.preventDefault()
            setView({ name: 'home', panel: 0 })
          }
        }}
      >
        <div className="mx-auto flex flex-col">
          <Portrait width={portraitWidth(true)}>
            <LookCard look={base} isBase active={panel === 0} />
          </Portrait>
          <Caption isBase />
        </div>
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

export function BannerSlot() {
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

/** A neighbouring look in the browsing carousel: just its photo; tapping it moves there. */
function NeighborCard({ image, label, onClick }: { image: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative min-h-0 flex-1 overflow-hidden border border-white bg-[#E7E8EA]"
      style={{ borderRadius: 12, boxShadow: '0 2px 24px rgba(0,0,0,0.08)' }}
    >
      <img src={image} alt="" draggable={false} className="absolute inset-0 size-full object-cover object-top" />
    </button>
  )
}

/**
 * A trial opened from the Past Trials grid, between its neighbours: the trial
 * before (the base, before the first) and the one after sit right beside it,
 * their edges peeking in at the screen sides. The whole row follows the finger,
 * so the next image slides in as you swipe; past a third of a card (or a flick)
 * it settles there. Left for the next trial, right for the one before.
 */
function BrowseCarousel({ look, startFresh }: { look: Look; startFresh: boolean }) {
  const looks = useTryItOnStore((s) => s.looks)
  const base = useTryItOnStore((s) => s.base)
  const setView = useTryItOnStore((s) => s.setView)
  const createNewLook = useTryItOnStore((s) => s.createNewLook)
  const x = useMotionValue(0)
  const slot = useRef<HTMLDivElement>(null)
  const dragged = useRef(false)
  const busy = useRef(false)

  const index = looks.findIndex((l) => l.id === look.id)
  const prev = looks[index - 1]
  const next = looks[index + 1]
  const caption = !startFresh
  // Each side keeps PEEK px of the neighbour plus the GAP before it.
  const cardWidth = portraitWidth(caption, (PEEK + GAP) * 2)

  // The row has moved one card over; once the new look is the current one, re-centre before paint.
  useLayoutEffect(() => {
    x.set(0)
    busy.current = false
  }, [look.id, x])

  const commit = (dir: 1 | -1) => {
    if (dir === 1 && next) return setView({ name: 'look', id: next.id, fromGrid: true })
    if (dir === -1 && prev) return setView({ name: 'look', id: prev.id, fromGrid: true })
    // Before the first trial is the base. v4's base is a fresh outfit; elsewhere it sits
    // under whatever the builder holds.
    if (VERSION === 4) createNewLook()
    else setView({ name: 'home', panel: 0 })
  }

  const settle = (dir: 0 | 1 | -1) => {
    if (busy.current) return
    if (dir === 0 || (dir === 1 && !next)) {
      animate(x, 0, { type: 'spring', stiffness: 420, damping: 40 })
      return
    }
    busy.current = true
    const w = (slot.current?.offsetWidth ?? 0) + GAP
    animate(x, -dir * w, { duration: 0.3, ease: [0.23, 1, 0.32, 1] }).then(() => commit(dir))
  }

  const neighbour = (image: string | undefined, dir: 1 | -1, label: string) => (
    <div className="flex shrink-0 flex-col" style={{ width: cardWidth }}>
      {image && (
        <Portrait width={cardWidth}>
          <NeighborCard image={image} label={label} onClick={() => settle(dir)} />
        </Portrait>
      )}
    </div>
  )

  return (
    <div className={cn('relative h-full overflow-hidden', CTA_SPACE)} style={{ containerType: 'size' }}>
      <motion.div
        className="flex items-start"
        // The first slot is the previous look; start the row so only PEEK px of it shows.
        style={{ x, gap: GAP, marginLeft: `calc(${PEEK}px - ${cardWidth})`, touchAction: 'pan-y' }}
        drag="x"
        dragDirectionLock
        dragMomentum={false}
        // Nothing after the last trial: that side only gives a little.
        dragConstraints={next ? undefined : { left: 0 }}
        dragElastic={next ? undefined : 0.15}
        onDragStart={() => (dragged.current = true)}
        onDragEnd={(_, info) => {
          const w = slot.current?.offsetWidth ?? 1
          const dx = info.offset.x
          const vx = info.velocity.x
          settle(dx < -w / 3 || vx < -500 ? 1 : dx > w / 3 || vx > 500 ? -1 : 0)
          // Let the click that ends a drag land first, then accept taps again.
          window.setTimeout(() => (dragged.current = false), 0)
        }}
        // A drag that ends over a button (heart, hotspot, share) mustn't also press it.
        onClickCapture={(e) => {
          if (dragged.current) {
            e.stopPropagation()
            e.preventDefault()
          }
        }}
      >
        {neighbour(prev ? prev.render.image : base.render.image, -1, prev ? 'Previous look' : 'Your base photo')}
        <div ref={slot} className="flex shrink-0 flex-col" style={{ width: cardWidth }}>
          <Portrait width={cardWidth}>
            <LookCard key={look.id} look={look} isBase={false} active layoutId={trialLayoutId(look.id)} startFresh={startFresh} />
          </Portrait>
          {caption && <Caption isBase={false} />}
        </div>
        {neighbour(next?.render.image, 1, 'Next look')}
      </motion.div>
    </div>
  )
}

/**
 * What the studio shows for the current view: home (base | past trials),
 * the render in progress, or one look. Shared with v4 on the phone, which
 * puts "Start A Fresh" on a look in place of its caption.
 */
export function StudioScreens({ startFresh = false }: { startFresh?: boolean }) {
  const view = useTryItOnStore((s) => s.view)
  const genSource = useTryItOnStore((s) => s.genSource)
  const look = useTryItOnStore((s) => (s.view.name === 'look' ? currentLook(s) : null))
  // Trials opened from the grid share one screen, so moving between them is the carousel's
  // own slide rather than a screen change.
  const browsing = view.name === 'look' && !!view.fromGrid
  const screenKey = view.name === 'look' ? (browsing ? 'browse' : `look-${view.id}`) : view.name
  // A trial opening (or closing) grows out of its tile, so those screens only cross-fade
  // around it; the pending render slides in like a deeper step.
  const kind: 'grow' | 'deeper' = view.name === 'pending' ? 'deeper' : 'grow'

  return (
    <AnimatePresence mode="popLayout" initial={false} custom={kind}>
      <motion.div
        key={screenKey}
        className="h-full"
        custom={kind}
        variants={{
          enter: (k: typeof kind) => (k === 'grow' ? { opacity: 1 } : { opacity: 0, x: 28 }),
          center: { opacity: 1, x: 0 },
          exit: (k: typeof kind) => (k === 'grow' ? { opacity: 0 } : { opacity: 0, x: -28 }),
        }}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
      >
        {view.name === 'home' && <HomePanels />}
        {view.name === 'pending' && (
          <div className={cn('flex h-full flex-col px-2', CTA_SPACE)} style={{ containerType: 'size' }}>
            <div className="mx-auto flex flex-col">
              <Portrait width={portraitWidth(true)}>
                <PendingCard source={genSource} />
              </Portrait>
              <Caption isBase />
            </div>
          </div>
        )}
        {view.name === 'look' && look && browsing && <BrowseCarousel look={look} startFresh={startFresh} />}
        {view.name === 'look' && look && !browsing && (
          <div className={cn('flex h-full flex-col px-2', CTA_SPACE)} style={{ containerType: 'size' }}>
            <div className="mx-auto flex flex-col">
              <Portrait width={portraitWidth(!startFresh)}>
                <LookCard look={look} isBase={false} active startFresh={startFresh} />
              </Portrait>
              {!startFresh && <Caption isBase={false} />}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
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
  const hasTrials = useTryItOnStore((s) => s.looks.length > 0)
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
    cta = { label: 'Complete the Look', disabled: false, onClick: () => openBuilder() }
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
      // v3 starts in the same outfit sheet that later completes the look.
      onClick: () => (VERSION === 3 ? openBuilder('for-you') : openSheet({ name: 'pick' })),
    }
  }

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
        <StudioScreens />
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
