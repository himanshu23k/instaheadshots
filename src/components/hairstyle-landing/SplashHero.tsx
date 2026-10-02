import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform, type Transition } from 'motion/react'
import { cn } from '@/lib/utils'
import { SPLASH_MOTION, type SplashGender } from './data'
import { Accent, SerifWord } from './ui'
import { C, FONT } from './tokens'

/**
 * The Figma splash (MWEB 157:8467 / 157:11130), ported from the approved
 * motion study at hairstylist-motion.vercel.app: base photo → wheel turns in
 * → first style picked → generating → applied → wheel steps on, swatches turn
 * ash → second style → generating → applied → card shrinks into a stack →
 * reaction bubble → hearts float off the top.
 *
 * Everything is drawn on the 390×735 Figma frame and scaled to the column, so
 * every number below is a Figma coordinate. The stage starts 64px down the
 * frame, just above the photo card (the header and the empty band above the
 * card are not needed in a hero; hearts and glows overflow the top anyway),
 * and ends at frame y 650, below the caption and above "Explore Hairstyles".
 */

const W = 390
const FRAME_H = 735
const TOP = 64
const H = 650 - TOP
const S = '/hairstyle-landing/splash/'

/** Phases, one per Figma state. */
const P = {
  BASE: 0, // base model only
  WHEEL: 1, // wheel fades in, second style centred
  TURN: 2, // wheel turns to the first pick       "landing - splash" 157:8468
  PICK1: 3, // first pick ticked
  LOAD1: 4, // "generating - splash"               157:8491
  DONE1: 5, // "1st hairstyle - splash"            157:11033
  ROTATE: 6, // wheel steps on, swatches turn ash
  PICK2: 7, // second pick ticked
  LOAD2: 8, // "generating - splash"               157:9762
  DONE2: 9, // "2nd hairstyle - splash"            157:11058
  STACK: 10, // wheel out, cards stack
  REACT: 11, // "Screen"                            157:11083
  HEARTS: 12, // "Onboarding Screen"                157:11098
} as const
type Phase = (typeof P)[keyof typeof P]

const TIMELINE: [number, Phase][] = [
  [500, P.WHEEL], [2000, P.TURN], [3100, P.PICK1], [3700, P.LOAD1], [6100, P.DONE1],
  [7300, P.ROTATE], [8500, P.PICK2], [9000, P.LOAD2], [11400, P.DONE2],
  [12600, P.STACK], [13900, P.REACT], [14500, P.HEARTS],
]
/** The last heart (0.68s delay + 3.1s flight) clears before the loop restarts. */
const TIMELINE_END = 19000

type Bezier = [number, number, number, number]
const EASE_OUT: Bezier = [0.22, 1, 0.36, 1]
const EASE_IN_OUT: Bezier = [0.65, 0, 0.35, 1]

/**
 * Only the wheel reaches below the caption, so only the wheel is clipped, at
 * the stage's bottom edge (frame y 650, like the bottom of the Figma phone
 * frame). Everything else, hearts and glows included, is free to spill out of
 * the top and sides.
 *
 * Earlier the whole scaled stage carried `clip-path: inset(-100vh -100vw 0
 * -100vw)`. On iPhone Safari that blew the composited layer up far past the
 * screen (it also holds a backdrop blur, blurred glows and blend modes), and
 * the hero stopped repainting on its first frame. These clips are small, in px,
 * and sit on the wheel's own layers.
 */
const STAGE_BOTTOM = TOP + H // frame y where the stage ends
const WHEEL_CLIP = `inset(-160px -200px ${FRAME_H - STAGE_BOTTOM}px -200px)` // wheel layer spans the whole 735 frame
const BACKDROP_CLIP = `inset(0 0 ${438 + 562 - STAGE_BOTTOM}px 0)` // frosted disc: 562px circle from frame y 438

const tr = (instant: boolean, o: Transition): Transition => (instant ? { duration: 0 } : o)

// ── Glows: blurred gradient ellipses (box → rotated inner → svg) ─────────────

type GlowSpec = { src: string; box: [number, number, number, number]; inner: [number, number]; rot: number; svg: [number, number] }
const GLOW_RIGHT: GlowSpec = { src: S + 'glow-right.svg', box: [233, 18, 330.425, 413.954], inner: [363.925, 248.254], rot: -104.29, svg: [614.525, 498.854] }
const GLOW_LEFT: GlowSpec = { src: S + 'glow-left.svg', box: [-179, 59, 356.027, 446.028], inner: [392.123, 267.489], rot: 75.71, svg: [642.723, 518.089] }
const GLOW_LEFT_STACK: GlowSpec = { src: S + 'glow-left-stack.svg', box: [-191.23, 29.54, 407.413, 510.404], inner: [448.718, 306.096], rot: 75.71, svg: [699.318, 556.696] }

function Glow({ spec, z, opacity, instant }: { spec: GlowSpec; z: number; opacity?: number; instant: boolean }) {
  const [l, t, w, h] = spec.box
  const [iw, ih] = spec.inner
  const [sw, sh] = spec.svg
  return (
    <motion.div
      className="absolute flex items-center justify-center"
      style={{ left: l, top: t, width: w, height: h, zIndex: z }}
      initial={false}
      animate={{ opacity: opacity ?? 1 }}
      transition={tr(instant, { duration: 0.8 })}
    >
      <div className="flex-none" style={{ transform: `rotate(${spec.rot}deg) scaleY(-1)` }}>
        <div className="relative" style={{ width: iw, height: ih }}>
          <img alt="" src={spec.src} className="absolute block max-w-none" style={{ left: -(sw - iw) / 2, top: -(sh - ih) / 2 }} />
        </div>
      </div>
    </motion.div>
  )
}

// ── Wheel: tiles ride an arc; slot positions measured from Figma ─────────────

const PIVOT = { x: 202, y: 719 } // centre of the 562px wheel ellipse
/** slot −3 … 3 → [angle° around the pivot, radius, tile tilt°] */
const SLOTS: [number, number, number][] = [
  [-56.5, 232, -53],
  [-38.37, 230.2, -36.87],
  [-20.45, 233.05, -20.88],
  [-1.86, 233.12, 0],
  [17.3, 234.8, 16.6],
  [34.67, 233.6, 34],
  [52.5, 232, 51],
]
function slotGeom(s: number) {
  const f = Math.max(-3, Math.min(3, s)) + 3
  const i = Math.min(5, Math.floor(f))
  const k = f - i
  const lerp = (j: number) => SLOTS[i][j] + (SLOTS[i + 1][j] - SLOTS[i][j]) * k
  const a = (lerp(0) * Math.PI) / 180
  const r = lerp(1)
  return { x: PIVOT.x + r * Math.sin(a) - 28, y: PIVOT.y - r * Math.cos(a) - 28, rot: lerp(2) }
}

function WheelThumb({
  src,
  slot,
  selected,
  instant,
  enterFrom,
}: {
  src: { blonde: string; ash: string; shade: 'blonde' | 'ash' }
  slot: number
  selected: boolean
  instant: boolean
  enterFrom?: number
}) {
  const mv = useMotionValue(enterFrom ?? slot)
  useEffect(() => {
    const c = animate(mv, slot, instant ? { duration: 0 } : { duration: enterFrom != null ? 1.15 : 0.9, ease: EASE_IN_OUT })
    return c.stop
  }, [mv, slot, instant, enterFrom])
  const x = useTransform(mv, (s) => slotGeom(s).x)
  const y = useTransform(mv, (s) => slotGeom(s).y)
  const rotate = useTransform(mv, (s) => slotGeom(s).rot)
  const opacity = useTransform(mv, (s) => {
    const d = Math.abs(s)
    return d <= 2 ? 1 : Math.max(0, 1 - (d - 2) / 0.7)
  })
  const zIndex = useTransform(mv, (s) => (Math.abs(s) < 0.5 ? 14 : 11 - Math.round(Math.abs(s))))

  return (
    <motion.div className="absolute left-0 top-0" style={{ x, y, rotate, opacity, zIndex }}>
      <motion.div
        className="relative size-[56px] rounded-[8px] border shadow-[0_2px_12px_0_rgba(0,0,0,0.1)]"
        style={{ borderColor: '#fff' }}
        animate={{
          borderColor: selected ? C.text : '#ffffff',
          opacity: Math.abs(slot) < 0.5 ? 1 : 0.95,
          scale: selected ? [null, 0.9, 1.06, 1] : 1,
        }}
        transition={instant ? { duration: 0 } : { duration: 0.45, ease: EASE_OUT }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[8px]">
          <motion.img alt="" src={src.blonde} className="absolute inset-0 size-full object-cover" animate={{ opacity: src.shade === 'blonde' ? 1 : 0 }} transition={{ duration: instant ? 0 : 0.6 }} />
          <motion.img alt="" src={src.ash} className="absolute inset-0 size-full object-cover" initial={false} animate={{ opacity: src.shade === 'ash' ? 1 : 0 }} transition={{ duration: instant ? 0 : 0.6 }} />
        </div>
        <AnimatePresence>
          {selected && (
            <motion.img
              key="badge"
              alt=""
              src={S + 'check-badge.svg'}
              className="absolute block max-w-none"
              style={{ left: 45.55, top: -3, width: 13, height: 13 }}
              initial={instant ? false : { scale: 0, opacity: 0, rotate: -40 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 520, damping: 14, mass: 0.6, delay: instant ? 0 : 0.12 }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

/** Enter / exit shared by the wheel and its frosted backdrop. */
function wheelMotion(phase: Phase, instant: boolean) {
  const visible = phase >= P.WHEEL && phase < P.STACK
  return {
    initial: false as const,
    animate: visible ? { opacity: 1, y: 0 } : { opacity: 0, y: phase >= P.STACK ? 90 : 140 },
    transition: instant
      ? { duration: 0 }
      : phase >= P.STACK
        ? { duration: 0.55, ease: [0.4, 0, 1, 1] as Bezier }
        : { duration: 0.85, ease: EASE_OUT },
  }
}

/** Figma bg blur 100 on the wheel ellipse → CSS blur 50px. Outside the wheel group: a fading parent would cut the backdrop off. */
function WheelBackdrop({ phase, instant }: { phase: Phase; instant: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full"
      style={{
        left: -79,
        top: 438,
        width: 562,
        height: 562,
        zIndex: 8,
        backdropFilter: 'blur(50px)',
        WebkitBackdropFilter: 'blur(50px)',
        clipPath: BACKDROP_CLIP,
        WebkitClipPath: BACKDROP_CLIP,
      }}
      {...wheelMotion(phase, instant)}
    />
  )
}

/** The pointer flap is masked by the wheel circle (centre 202,719 · r 281, in the flap's own coordinates) so it ends at the arc edge. */
const FLAP_MASK = 'radial-gradient(circle 281px at 24px 285px, transparent 281px, #000 281.5px)'

function Wheel({ phase, instant, gender }: { phase: Phase; instant: boolean; gender: SplashGender }) {
  const data = SPLASH_MOTION[gender]
  const rotated = phase >= P.ROTATE
  const shade = rotated ? 'ash' : 'blonde'
  // +1: second style centred on entry · 0: first pick centred · −1: second pick centred
  const offset = rotated ? -1 : phase <= P.WHEEL ? 1 : 0
  const entering = !instant && phase === P.WHEEL

  // The five styles, plus the last wrapping out on the left and the first wrapping in on the right.
  const items = [
    { key: 'wrap-left', style: 4, base: -3 },
    { key: 's0', style: 0, base: -2 },
    { key: 's1', style: 1, base: -1 },
    { key: 's2', style: 2, base: 0 },
    { key: 's3', style: 3, base: 1 },
    { key: 's4', style: 4, base: 2 },
    { key: 'wrap-right', style: 0, base: 3 },
  ]
  const selectedKey = phase >= P.PICK1 && phase < P.ROTATE ? 's2' : phase >= P.PICK2 ? 's3' : null
  const loading = phase === P.LOAD1 || phase === P.LOAD2

  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 9, clipPath: WHEEL_CLIP, WebkitClipPath: WHEEL_CLIP }}
      {...wheelMotion(phase, instant)}
    >
      <img alt="" src={S + 'pointer-shadow.svg'} className="absolute block max-w-none" style={{ left: 178, top: 434, maskImage: FLAP_MASK, WebkitMaskImage: FLAP_MASK }} />
      <img alt="" src={S + 'wheel-arc.svg'} className="absolute block max-w-none" style={{ left: -119, top: 390 }} />
      {/* rainbow glow under the selected slot, pulsing while generating */}
      <motion.img
        alt=""
        src={S + 'wheel-glow.svg'}
        className="absolute block max-w-none"
        style={{ left: 120.83, top: 402.83 }}
        animate={{ opacity: loading ? [1, 0.55, 1] : 1 }}
        transition={loading ? { duration: 1.2, repeat: Infinity } : { duration: 0.3 }}
      />
      {items.map((it) => (
        <WheelThumb
          key={it.key}
          src={{ ...data.thumb(it.style), shade }}
          slot={it.base + offset}
          selected={selectedKey === it.key}
          instant={instant}
          enterFrom={entering ? it.base + offset + 1.6 : undefined}
        />
      ))}
      {/* pointer ▼ — its top edge (y 434) meets the flap, which widens down and tucks under the arc */}
      <motion.img
        alt=""
        src={S + 'pointer.svg'}
        className="absolute block max-w-none"
        style={{ left: 173.54, top: 428, zIndex: 13 }}
        initial={entering ? { y: -18, opacity: 0, scale: 0.6 } : false}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 16, delay: entering ? 0.85 : 0 }}
      />
    </motion.div>
  )
}

// ── Loader: dark veil + 11px gradient border with travelling rays + drifting dot grid ──

/**
 * Drawn on a 372×511 box whose 348×446 card sits at (12,12). `style` places
 * that box; for any card, use left/top −3.448%, width 106.9%, height 114.57%.
 */
export function Loader({ style, className }: { style: React.CSSProperties; className?: string }) {
  const uid = useId().replace(/:/g, '')
  const id = (n: string) => `${n}-${uid}`
  return (
    <motion.div
      className={cn('pointer-events-none absolute', className)}
      style={style}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.55 } }}
      transition={{ duration: 0.4 }}
    >
      <svg width="100%" height="100%" viewBox="0 0 372 511" fill="none" preserveAspectRatio="none" className="block overflow-visible" aria-hidden>
        <defs>
          <filter id={id('blur')} x="0" y="0" width="372" height="470" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id={id('ray')} x="-40" y="-40" width="452" height="550" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <linearGradient id={id('border')} x1="153.321" y1="-96.6324" x2="370.44" y2="9.32317" gradientUnits="userSpaceOnUse">
            <stop stopColor="#14DBDB" />
            <stop offset="0.2" stopColor="#FC81F1" />
            <stop offset="0.804561" stopColor="#FFA755" />
            <stop offset="1" stopColor="#E3F86E" />
          </linearGradient>
          <radialGradient
            id={id('mask-grad')}
            cx="0"
            cy="0"
            r="1"
            gradientTransform="matrix(115.183 -321.904 224.377 165.249 96 445.562)"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#D9D9D9" />
            <stop offset="1" stopColor="#D9D9D9" stopOpacity="0" />
          </radialGradient>
          <mask id={id('mask')} style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="8" y="6" width="352" height="505">
            {/* the radial fade drifts across the grid so the dots shimmer in and out */}
            <motion.g animate={{ x: [0, 150, 60, 0], y: [0, -170, -320, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}>
              <rect x="-400" y="-400" width="1200" height="1300" fill={`url(#${id('mask-grad')})`} />
            </motion.g>
          </mask>
          <pattern id={id('dots')} x="12" y="17.5" width="11" height="11" patternUnits="userSpaceOnUse">
            <circle cx="5.5" cy="5.5" r="1.5" fill="#D9D9D9" />
          </pattern>
        </defs>

        <g filter={`url(#${id('blur')})`}>
          <rect x="12" y="12" width="348" height="446" rx="12" fill="black" fillOpacity="0.32" />
          <rect x="17.5" y="17.5" width="337" height="435" rx="6.5" stroke={`url(#${id('border')})`} strokeOpacity="0.8" strokeWidth="11" />
        </g>

        {/* rays travelling along the border */}
        <g filter={`url(#${id('ray')})`} style={{ mixBlendMode: 'screen' }}>
          {[0, 0.5].map((start) => (
            <motion.rect
              key={start}
              x="17.5"
              y="17.5"
              width="337"
              height="435"
              rx="6.5"
              pathLength="1"
              stroke={`url(#${id('border')})`}
              strokeWidth="13"
              strokeLinecap="round"
              strokeDasharray="0.14 0.86"
              initial={{ strokeDashoffset: -start }}
              animate={{ strokeDashoffset: [-start, -start - 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
            />
          ))}
          {[0, 0.5].map((start) => (
            <motion.rect
              key={'core' + start}
              x="17.5"
              y="17.5"
              width="337"
              height="435"
              rx="6.5"
              pathLength="1"
              stroke="#ffffff"
              strokeOpacity="0.85"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="0.06 0.94"
              initial={{ strokeDashoffset: -start - 0.04 }}
              animate={{ strokeDashoffset: [-start - 0.04, -start - 1.04] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
            />
          ))}
        </g>

        {/* dot grid — 11px pitch, r 1.5, overlay */}
        <g mask={`url(#${id('mask')})`}>
          <g style={{ mixBlendMode: 'overlay' }}>
            <motion.rect
              x="12"
              y="17.5"
              width="352"
              height="407"
              fill={`url(#${id('dots')})`}
              animate={{ opacity: [0.75, 1, 0.75] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            />
          </g>
        </g>
      </svg>
    </motion.div>
  )
}

// ── Photo card: morphs from 348×446 to the 302×386 stacked card ──────────────

function PhotoCard({ phase, instant, gender }: { phase: Phase; instant: boolean; gender: SplashGender }) {
  const models = SPLASH_MOTION[gender].models
  const model = phase < P.DONE1 ? 'base' : phase < P.DONE2 ? 'pick1' : 'pick2'
  const loading = phase === P.LOAD1 || phase === P.LOAD2
  const stacked = phase >= P.STACK
  return (
    <motion.div
      className="absolute left-1/2 overflow-hidden rounded-[12px] border border-white bg-[#E5E6E6] shadow-[0_4px_20px_0_rgba(0,0,0,0.1)]"
      style={{ x: '-50%', zIndex: 6 }}
      initial={false}
      animate={stacked ? { width: 302, height: 386, top: 109 } : { width: 348, height: 446, top: 79 }}
      transition={tr(instant, { duration: 0.85, ease: EASE_IN_OUT })}
    >
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ filter: loading ? 'blur(9px)' : 'blur(0px)' }}
        transition={tr(instant, { duration: loading ? 0.5 : 0.8, ease: EASE_OUT })}
      >
        {(Object.keys(models) as (keyof typeof models)[]).map((k) => (
          <motion.img
            key={k}
            alt=""
            src={models[k]}
            className="absolute inset-0 size-full rounded-[12px] object-cover object-top"
            initial={false}
            animate={{ opacity: model === k ? 1 : 0, scale: model === k ? 1 : 1.04 }}
            transition={tr(instant, { duration: 0.8, ease: EASE_OUT })}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}

// ── Caption ─────────────────────────────────────────────────────────────────

const LEAD = 'm-0 whitespace-nowrap text-[26px] leading-[32px] tracking-[-0.364px]'
const GRAD = 'm-0 whitespace-nowrap text-[32px] leading-[32px] tracking-[-0.384px]'

function Caption({ phase, instant, gender }: { phase: Phase; instant: boolean; gender: SplashGender }) {
  const reel = SPLASH_MOTION[gender].reel
  const stacked = phase >= P.STACK
  const rotated = phase >= P.ROTATE
  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex: 12, ...FONT }}>
      <AnimatePresence initial={false}>
        {!stacked ? (
          <motion.div
            key="give"
            className="absolute flex flex-col items-center gap-1 text-center"
            style={{ left: 'calc(50% + 0.5px)', top: 574, width: 320, x: '-50%' }}
            exit={{ opacity: 0, y: -10, transition: tr(instant, { duration: 0.35 }) }}
          >
            <p className={LEAD} style={{ fontWeight: 350, color: C.text }}>
              Give yourself that
            </p>
            <div className="relative h-[33px] w-[320px] overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 flex w-[320px] flex-col gap-[14px]"
                initial={false}
                animate={{ y: rotated ? -43 : 3 }}
                transition={tr(instant, { duration: 0.7, ease: EASE_IN_OUT })}
              >
                {reel.map((r) => (
                  <p key={r.name} className={GRAD}>
                    <Accent text={r.name} serif={r.serif} />
                  </p>
                ))}
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="react"
            className="absolute flex flex-col items-center gap-1 text-center"
            style={{ left: 'calc(50% + 0.5px)', top: 574, x: '-50%' }}
            initial={instant ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={tr(instant, { duration: 0.5, delay: 0.3, ease: EASE_OUT })}
          >
            <p className={LEAD} style={{ fontWeight: 350, color: C.text }}>
              and get your friends
            </p>
            <p className={GRAD}>
              <Accent text="to react" />
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Reaction bubble + heart flutter ─────────────────────────────────────────

const BUBBLE = { x: 54.5, y: 122 } // centre of the reaction bubble

/** Figma "Onboarding Screen" heart vectors: [x, y, bboxW, bboxH, rotation]. */
const HEARTS = (
  [
    [27.36, 29.73, 34.62, 33.16, -16.73],
    [-17, 93.15, 34.62, 33.16, -16.73],
    [218, 113.73, 34.62, 33.16, -16.73],
    [241, 32.15, 34.62, 33.16, -16.73],
    [10, 200.15, 34.62, 33.16, -16.73],
    [107, 150.1, 26.62, 25.5, -16.73],
    [206.72, 65, 25.11, 23.77, 10.68],
    [156, 101.83, 28.04, 27.19, -23.93],
    [186.88, 10, 39.54, 37.92, 17.41],
    [276, 72.92, 33.41, 31.56, -9.68],
    [381.63, 78, 32.97, 31.34, 12.58],
    [358.63, 10, 32.97, 31.34, 12.58],
    [86.88, 19, 34.04, 31.47, 16.3],
    [328.88, 98, 34.04, 31.47, 16.3],
    [109, 67.2, 32.98, 30.11, -12.66],
    [295.64, 145.2, 32.98, 30.11, -12.66],
  ] as const
).map(([x, y, bw, bh, rot], i) => {
  const th = (Math.abs(rot) * Math.PI) / 180
  const pathW = bw / (Math.cos(th) + (26.12 / 28.3) * Math.sin(th)) // unrotated heart width
  return { i, cx: x + bw / 2, cy: y + bh / 2, rot, scale: pathW / 32.14 } // heart.svg's path is 32.14 wide
})
type HeartSpec = (typeof HEARTS)[number]

/** Launch order: nearest hearts leave first, so the burst ripples outward. */
const HEART_ORDER = [...HEARTS]
  .sort((a, b) => Math.hypot(a.cx - BUBBLE.x, a.cy - BUBBLE.y) - Math.hypot(b.cx - BUBBLE.x, b.cy - BUBBLE.y))
  .map((h) => h.i)
// Nothing clips the stage, so hearts drift up past the frame's top edge and fade out in the open.
const HEART_TOP = -150 // where the flight ends, above the frame
const HEART_FADE = 130 // px before the end over which a heart fades out

function Reaction({ instant, puff }: { instant: boolean; puff: boolean }) {
  return (
    <motion.div
      className="absolute flex items-center justify-center"
      style={{ left: 22.03, top: 86.89, width: 64.944, height: 70.225, zIndex: 16, originX: 0.4, originY: 0.7 }}
      initial={instant ? false : { scale: 0, opacity: 0, rotate: -25 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 13, mass: 0.8 }}
    >
      {/* soft squash-and-release as the hearts burst out */}
      <motion.div
        className="flex-none"
        animate={puff && !instant ? { scale: [1, 1.12, 0.97, 1] } : { scale: 1 }}
        transition={{ duration: 0.6, times: [0, 0.3, 0.65, 1], ease: 'easeOut' }}
      >
        <div style={{ transform: 'rotate(12.76deg)' }}>
          <div className="relative" style={{ width: 53, height: 60 }}>
            <img alt="" src={S + 'reaction.svg'} className="absolute block max-w-none" style={{ left: -23.24, top: -21.23 }} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Heart({ h, instant }: { h: HeartSpec; instant: boolean }) {
  const base = { left: -16.5, top: -15, zIndex: 17 } // centre heart.svg (33×30) on its point
  // one progress value drives the whole flight, so speed never jumps between keyframes
  const t = useMotionValue(0)
  const order = HEART_ORDER.indexOf(h.i)
  const delay = order * 0.045
  const dur = 2.4 + (h.i % 5) * 0.18
  const side = h.cx < BUBBLE.x + 120 ? -1 : 1
  const end = { x: h.cx + side * (10 + (h.i % 3) * 6), y: HEART_TOP }
  // quadratic curve: bubble → (through) design position → top edge
  const ctrl = { x: 2 * h.cx - (BUBBLE.x + end.x) / 2, y: 2 * h.cy - (BUBBLE.y + end.y) / 2 }
  const bez = (p0: number, p1: number, p2: number, u: number) => (1 - u) * (1 - u) * p0 + 2 * (1 - u) * u * p1 + u * u * p2
  const swayAmp = 5 + (h.i % 4) * 1.5
  const swayPhase = h.i * 1.3

  const x = useTransform(t, (u) => bez(BUBBLE.x, ctrl.x, end.x, u) + Math.sin(u * Math.PI * 3 + swayPhase) * swayAmp * u)
  const y = useTransform(t, (u) => bez(BUBBLE.y, ctrl.y, end.y, u))
  const rotate = useTransform(t, (u) => h.rot * Math.min(1, u * 4) + Math.sin(u * Math.PI * 3 + swayPhase + 0.6) * 9 * u)
  const opacity = useTransform([t, y], ([u, yy]: number[]) => Math.min(1, u * 12) * Math.max(0, Math.min(1, (yy - HEART_TOP) / HEART_FADE)))

  useEffect(() => {
    if (instant) return
    // fast launch, then a long gentle float
    const c = animate(t, 1, { duration: dur, delay, ease: [0.2, 0.75, 0.45, 1] })
    return c.stop
  }, [t, dur, delay, instant])

  if (instant) {
    return (
      <img
        alt=""
        src={S + 'heart.svg'}
        className="absolute block max-w-none"
        style={{ ...base, transform: `translate(${h.cx}px, ${h.cy}px) rotate(${h.rot}deg) scale(${h.scale})` }}
      />
    )
  }
  return (
    <motion.img
      alt=""
      src={S + 'heart.svg'}
      className="absolute block max-w-none"
      style={{ ...base, x, y, rotate, opacity }}
      initial={{ scale: 0.15 }}
      animate={{ scale: h.scale }}
      transition={{ type: 'spring', stiffness: 210, damping: 16, mass: 0.7, delay }}
    />
  )
}

// ── Frame ───────────────────────────────────────────────────────────────────

function Frame({ phase, instant, gender }: { phase: Phase; instant: boolean; gender: SplashGender }) {
  const stacked = phase >= P.STACK
  return (
    // Unclipped and transparent: glows, shadows and hearts spill past the frame onto the page.
    <div className="pointer-events-none absolute left-0" style={{ top: -TOP, width: W, height: FRAME_H }}>
      {/* left glow — appears once a style is picked */}
      <Glow spec={GLOW_LEFT} z={1} opacity={phase >= P.PICK1 && !stacked ? 1 : 0} instant={instant} />
      <Glow spec={GLOW_LEFT_STACK} z={1} opacity={stacked ? 1 : 0} instant={instant} />

      {/* back card of the stack */}
      <motion.div
        className="absolute left-1/2 h-[386px] w-[302px] rounded-[12px] border border-white bg-[#E5E6E6] shadow-[0_4px_20px_0_rgba(0,0,0,0.1)]"
        style={{ top: 109, x: '-50%', zIndex: 2 }}
        initial={false}
        animate={stacked ? { opacity: 1, rotate: 6.64 } : { opacity: 0, rotate: 0 }}
        transition={tr(instant, { duration: 0.8, delay: stacked ? 0.3 : 0, ease: EASE_OUT })}
      />

      <Glow spec={GLOW_RIGHT} z={3} instant={instant} />

      <PhotoCard phase={phase} instant={instant} gender={gender} />

      <AnimatePresence>
        {(phase === P.LOAD1 || phase === P.LOAD2) && <Loader key={'loader' + phase} style={{ left: 9, top: 67, width: 372, height: 511, zIndex: 7 }} />}
      </AnimatePresence>

      <WheelBackdrop phase={phase} instant={instant} />
      <Wheel phase={phase} instant={instant} gender={gender} />
      <Caption phase={phase} instant={instant} gender={gender} />

      <AnimatePresence>{phase >= P.REACT && <Reaction key="reaction" instant={instant} puff={phase >= P.HEARTS} />}</AnimatePresence>
      {phase >= P.HEARTS && HEARTS.map((h) => <Heart key={h.i} h={h} instant={instant} />)}
    </div>
  )
}

/** One pass of the timeline. Remounted (keyed) for each loop, so it always starts from the base photo. */
function Run({ gender, onDone }: { gender: SplashGender; onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>(P.BASE)
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  }, [onDone])
  useEffect(() => {
    const timers = TIMELINE.map(([ms, p]) => setTimeout(() => setPhase(p), ms))
    timers.push(setTimeout(() => done.current(), TIMELINE_END))
    return () => timers.forEach(clearTimeout)
  }, [])
  return <Frame phase={phase} instant={false} gender={gender} />
}

function useStageScale(max: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setScale(Math.min(max, entry.contentRect.width / W)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [max])
  return { ref, scale }
}

export function SplashHero({ gender, maxScale = 1.15, className }: { gender: SplashGender; maxScale?: number; className?: string }) {
  const reduce = useReducedMotion()
  const { ref, scale } = useStageScale(maxScale)
  const [run, setRun] = useState(0)
  const looks = SPLASH_MOTION[gender].reel

  return (
    <div ref={ref} className={cn('relative w-full', className)} style={{ height: H * scale }}>
      <div
        className="absolute left-1/2 top-0"
        style={{ width: W, height: H, transform: `translateX(-50%) scale(${scale})`, transformOrigin: 'top center' }}
        aria-hidden
      >
        {/* Reduced motion: hold the first finished style instead of looping. */}
        {reduce ? <Frame phase={P.DONE1} instant gender={gender} /> : <Run key={run} gender={gender} onDone={() => setRun((n) => n + 1)} />}
      </div>

      {/* Screen readers get the gist instead of the animation. */}
      <p className="sr-only">
        A photo of someone, then the same person with a <SerifWord text={looks[0].name} /> and with {looks[1].name}, generated from that one photo.
      </p>
    </div>
  )
}

/** Figma filter chip: #F7F7F8 pill, 1.4px black ring when on. */
export function GenderChips({ value, onChange }: { value: SplashGender; onChange: (g: SplashGender) => void }) {
  return (
    <div role="radiogroup" aria-label="Show styles for" className="flex items-center gap-2">
      {(['women', 'men'] as const).map((g) => {
        const on = value === g
        return (
          <button
            key={g}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(g)}
            className="rounded-full px-4 py-2 text-[14px] leading-[16px] drop-shadow-[0px_4px_8px_rgba(165,165,165,0.08)] transition-[border-color] duration-150 hover:border-[#000409]"
            style={{ ...FONT, fontWeight: 450, background: C.grey03, border: `1.4px solid ${on ? C.text : '#fff'}`, color: C.text }}
          >
            {g === 'women' ? 'Women' : 'Men'}
          </button>
        )
      })}
    </div>
  )
}
