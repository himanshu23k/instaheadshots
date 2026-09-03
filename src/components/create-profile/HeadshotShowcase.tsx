/**
 * Desktop-only photo showcase for /create-profile (Figma 6453:4750 / 6453:4873).
 *
 * Two states, one set of DOM nodes so the change is a transform rather than a
 * swap:
 *   - no style picked  -> three large cards fanned like a deck, shuffling on a
 *                         timer and pulling fresh faces in from the back
 *   - style picked     -> the deck flies apart into the 3x2 grid of examples
 *                         for that style, and three more tiles fade in with it
 *
 * Both states re-photograph themselves when the gender changes.
 *
 * Every card is one fixed 429x453 box moved purely by transform. The three fan
 * boxes and the grid tile share an aspect ratio to within 0.2%, so a uniform
 * scale reproduces all four sizes and nothing ever animates a layout property —
 * the image rasterises once and the GPU does the rest.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { heroPhotosFor, photosFor, type GenderChoice, type StyleId } from './create-profile-data'

/** The showcase is laid out at Figma's exact pixel geometry, then scaled to fit. */
const DESIGN_W = 596
const DESIGN_H = 642

/** Every card is this box; scale takes it to the size each slot needs. */
const BASE_W = 429
const BASE_H = 453

type Placement = { x: number; y: number; scale: number; rotate: number }

/** Figma's left/top/width/height for a slot -> a centre-origin transform. */
function place(left: number, top: number, w: number, h: number, rotate = 0): Placement {
  return {
    x: left + w / 2 - BASE_W / 2,
    y: top + h / 2 - BASE_H / 2,
    scale: w / BASE_W,
    rotate,
  }
}

/** Deck positions, back to front (Figma 6453:4813 / 4814 / 4753). */
const FAN: Placement[] = [
  place(157.8, 161.87, 387.39, 409.26, 1.79),
  place(47.76, 162.65, 387.39, 409.26, -3.09),
  place(86.38, 140, 429, 453),
]

/** 3x2 grid at left 54 / top 100, 488x340 with a 10px gutter (Figma 6453:4916). */
const TILE_W = 156
const TILE_H = 165
const GRID: Placement[] = Array.from({ length: 6 }, (_, i) =>
  place(54 + (i % 3) * (TILE_W + 10), 100 + Math.floor(i / 3) * (TILE_H + 10), TILE_W, TILE_H),
)

const SHUFFLE_MS = 3000
/** How long a card takes to travel between slots. */
const TRAVEL_S = 0.9
/** Cards behind the one being dealt follow a beat later, so it reads as a deal. */
const FOLLOW_S = 0.09

/**
 * Breathing room above the design box. The box already carries 20px above its
 * title, which lines the title up with the form heading opposite (24px inside
 * the card), so this only needs to keep it off the very top of the section.
 */
const TOP_INSET = 8

/** Scale the fixed design box down when the section is shorter than it. */
function useFitScale(designW: number, designH: number, inset: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const { width, height } = el.getBoundingClientRect()
      if (!width || !height) return
      setScale(Math.min(1, width / designW, (height - inset) / designH))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [designW, designH, inset])

  return { ref, scale }
}

/** One photo that cross-fades whenever its source changes. */
function PhotoTile({ src }: { src: string }) {
  return (
    <AnimatePresence initial={false} mode="sync">
      <motion.img
        key={src}
        src={src}
        alt=""
        aria-hidden
        draggable={false}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
        className="absolute inset-0 size-full select-none object-cover"
        // Figma crops from the bottom, which suits its one full-length source.
        // Our library is head-and-shoulders portraits, so bias to the upper
        // third instead — otherwise a tall card crops the face off entirely.
        style={{ objectPosition: 'center 25%' }}
      />
    </AnimatePresence>
  )
}

type Card = {
  id: number
  photo: string
  slot: number
  /** Set on the card being dealt to the back; swapped in once it lands. */
  pending?: string
}

export function HeadshotShowcase({
  gender,
  style,
}: {
  gender: GenderChoice
  style: StyleId | null
}) {
  const reduceMotion = useReducedMotion()
  const { ref, scale } = useFitScale(DESIGN_W, DESIGN_H, TOP_INSET)

  const gridPhotos = style ? photosFor(gender, style, 6) : null

  // The three deck cards keep their identity across the shuffle and across the
  // flight into the grid, so motion animates movement instead of a remount.
  const [cards, setCards] = useState<Card[]>(() =>
    heroPhotosFor(gender).map((photo, i) => ({ id: i, photo, slot: i })),
  )
  const poolCursor = useRef(0)

  // Gender changed: re-deal the deck with that gender's faces, keeping each
  // card in its slot so the swap reads as a re-photograph, not a reshuffle.
  // Adjusted during render rather than in an effect — it is derived from a
  // prop change, so an effect would cost an extra render with stale faces.
  const [dealtFor, setDealtFor] = useState<GenderChoice>(gender)
  if (dealtFor !== gender) {
    setDealtFor(gender)
    const fresh = heroPhotosFor(gender)
    setCards((prev) => prev.map((c) => ({ ...c, photo: fresh[c.slot] ?? c.photo, pending: undefined })))
  }

  // Idle shuffle — only while nothing is selected.
  useEffect(() => {
    // The deck was just re-dealt from the top of this gender's pool.
    poolCursor.current = 0
    if (style || reduceMotion) return
    const pool = photosFor(gender, 'mix', 6)
    const id = setInterval(() => {
      setCards((prev) => {
        // A card cycling back to the rear of the deck brings in a new face —
        // the next one in the pool that neither of the other two is showing,
        // so the deck never displays the same person twice. It is staged as
        // `pending` and only swapped in once the card has landed at the back,
        // so the cross-fade never happens in full view.
        const staying = prev.filter((c) => (c.slot + 1) % 3 !== 0).map((c) => c.photo)
        let incoming: string | undefined
        for (let i = 0; i < pool.length; i++) {
          poolCursor.current += 1
          const candidate = pool[poolCursor.current % pool.length]
          if (!staying.includes(candidate)) {
            incoming = candidate
            break
          }
        }
        return prev.map((c) => {
          const slot = (c.slot + 1) % 3
          return slot === 0 ? { ...c, slot, pending: incoming } : { ...c, slot }
        })
      })
    }, SHUFFLE_MS)
    return () => clearInterval(id)
  }, [style, gender, reduceMotion])

  /** Commit a staged face once its card has finished travelling to the back. */
  const land = (id: number) =>
    setCards((prev) =>
      prev.map((c) => (c.id === id && c.pending ? { ...c, photo: c.pending, pending: undefined } : c)),
    )

  return (
    <div ref={ref} className="flex size-full items-start justify-center overflow-hidden">
      <div
        className="relative shrink-0"
        style={{
          width: DESIGN_W,
          height: DESIGN_H,
          marginTop: TOP_INSET,
          transform: `scale(${scale})`,
          // Top-left-ish origin, so a section taller than the design box leaves
          // its slack at the bottom and the title stays level with the form
          // heading. Centring it made the whole showcase drift down the taller
          // the window got.
          transformOrigin: 'top center',
          // Real depth, not paint order. `z-index` is a discrete property —
          // motion snaps it, so re-stacking the deck made the front card jump
          // behind the others while it was still visibly in front. Inside a
          // preserve-3d context the browser sorts siblings by their actual Z,
          // so the crossover happens continuously as the cards travel. With no
          // `perspective` anywhere the projection stays orthographic, so
          // translateZ costs nothing geometrically — it only sorts.
          transformStyle: 'preserve-3d',
        }}
      >
        <p
          className="absolute top-5 left-1/2 w-[277.7px] -translate-x-1/2 text-center text-[22px] leading-6 tracking-[-0.22px]"
          style={{
            fontFamily: 'var(--font-greed)',
            fontWeight: 450,
            color: 'transparent',
            backgroundImage:
              'linear-gradient(107.899deg, rgb(1, 49, 47) 44.315%, rgb(149, 183, 181) 94.102%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            fontFeatureSettings: "'ss06' 1, 'ss02' 1, 'ss01' 1",
          }}
        >
          A set of
          <br />
          {' Stunning headshots'}
        </p>

        {/* The three deck cards — they fly into grid slots 0-2 on selection. */}
        {cards.map((card) => {
          const to = gridPhotos ? GRID[card.slot] : FAN[card.slot]
          const photo = gridPhotos ? gridPhotos[card.slot] : card.photo
          // The card is scaled, so anything measured in px scales with it.
          // Divide through to keep the stroke, corner and shadow at design size.
          const k = 1 / to.scale
          return (
            <motion.div
              key={card.id}
              className="absolute top-0 left-0 overflow-hidden border-white bg-[var(--color-shapes-grey)]"
              style={{
                width: BASE_W,
                height: BASE_H,
                borderStyle: 'solid',
                transformOrigin: 'center',
                willChange: 'transform',
                boxShadow: `0px ${2 * k}px ${32 * k}px 0px rgba(0,0,0,0.1)`,
              }}
              initial={false}
              animate={{
                x: to.x,
                y: to.y,
                scale: to.scale,
                rotate: to.rotate,
                // Depth, interpolated alongside the travel — the card being
                // dealt sinks behind the other two over the course of its
                // move rather than snapping behind them on the first frame.
                z: card.slot * 40,
                borderWidth: k,
                borderRadius: 12 * k,
              }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : gridPhotos
                    ? { type: 'spring', stiffness: 150, damping: 22, mass: 0.9 }
                    : {
                        duration: TRAVEL_S,
                        ease: [0.4, 0, 0.16, 1],
                        delay: card.slot === 0 ? 0 : FOLLOW_S,
                      }
              }
              onAnimationComplete={() => land(card.id)}
            >
              <PhotoTile src={photo} />
            </motion.div>
          )
        })}

        {/* Grid slots 3-5 — they only exist once a style is chosen. */}
        <AnimatePresence>
          {gridPhotos &&
            GRID.slice(3).map((slot, i) => {
              // Built exactly like the deck cards — same base box, same scale,
              // same compensation. The browser quantises border-width to whole
              // pixels, so a tile drawn at its true 156x165 would end up with a
              // visibly heavier hairline than its scaled neighbours.
              const k = 1 / slot.scale
              return (
                <motion.div
                  key={`extra-${i}`}
                  className="absolute top-0 left-0 overflow-hidden border-white bg-[var(--color-shapes-grey)]"
                  style={{
                    width: BASE_W,
                    height: BASE_H,
                    borderStyle: 'solid',
                    borderWidth: k,
                    borderRadius: 12 * k,
                    transformOrigin: 'center',
                    willChange: 'transform',
                    boxShadow: `0px ${2 * k}px ${32 * k}px 0px rgba(0,0,0,0.1)`,
                    x: slot.x,
                    y: slot.y,
                  }}
                  initial={{ opacity: 0, scale: slot.scale * 0.86 }}
                  animate={{ opacity: 1, scale: slot.scale }}
                  exit={{ opacity: 0, scale: slot.scale * 0.86 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.45, delay: 0.12 + i * 0.06, ease: [0.32, 0.72, 0, 1] }
                  }
                >
                  <PhotoTile src={gridPhotos[3 + i]} />
                </motion.div>
              )
            })}
        </AnimatePresence>
      </div>
    </div>
  )
}
