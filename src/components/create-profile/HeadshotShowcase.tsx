/**
 * Desktop-only photo showcase for /create-profile (Figma 6453:4750 / 6453:4873).
 *
 * Two presentations of the idle state, chosen by ?version=:
 *   - v1: three large cards fanned like a deck, shuffling on a timer and
 *         pulling fresh faces in from the back, under a gradient heading.
 *   - v2: one square frame the full width of the showcase, dissolving slowly
 *         from photo to photo, and no heading — a quieter panel that competes
 *         less with the form beside it.
 *
 * Choosing a style resolves either one into a grid of examples: 3x2 for v1,
 * 3x3 for v2. A card already showing a photo of the chosen style keeps that
 * image and travels to the photo's own cell; the rest dissolve into whatever
 * belongs where they land, and unclaimed cells fade in.
 *
 * Both re-photograph themselves when the gender changes.
 *
 * Every card is one fixed box moved purely by transform. Each version's hero
 * box and grid cell share an aspect ratio, so a uniform scale reproduces every
 * size and nothing ever animates a layout property — the image rasterises once
 * and the GPU does the rest.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { photosFor, type GenderChoice, type StyleId } from './create-profile-data'

export type ShowcaseVersion = 'v1' | 'v2'

type Placement = { x: number; y: number; scale: number; rotate: number }

/** Turn a left/top/width/height rectangle into a centre-origin transform. */
function placer(baseW: number, baseH: number) {
  return (left: number, top: number, w: number, h: number, rotate = 0): Placement => ({
    x: left + w / 2 - baseW / 2,
    y: top + h / 2 - baseH / 2,
    scale: w / baseW,
    rotate,
  })
}

const WIDTH = 596

// ── v1 ────────────────────────────────────────────────────────────────────
// Figma's own geometry: a 429x453 card, a fan of three, a 3x2 grid of 156x165
// cells at left 54 / top 100 with a 10px gutter (6453:4813/4814/4753, 4916).
const V1 = (() => {
  const w = 429
  const h = 453
  const at = placer(w, h)
  return {
    base: { w, h },
    design: { w: WIDTH, h: 642 },
    heroes: [
      at(157.8, 161.87, 387.39, 409.26, 1.79),
      at(47.76, 162.65, 387.39, 409.26, -3.09),
      at(86.38, 140, 429, 453),
    ],
    grid: Array.from({ length: 6 }, (_, i) =>
      at(54 + (i % 3) * 166, 100 + Math.floor(i / 3) * 175, 156, 165),
    ),
    heading: true,
  }
})()

// ── v2 ────────────────────────────────────────────────────────────────────
// A square hero the full width of the showcase, and a 3x3 grid of square cells
// concentric with it, so the hero scales straight down into whichever cell its
// photo belongs to.
const V2 = (() => {
  const w = WIDTH
  const at = placer(w, w)
  const cell = 156
  const pitch = cell + 10
  const inset = (w - (3 * cell + 2 * 10)) / 2 // 54, centring the grid in the hero
  return {
    base: { w, h: w },
    design: { w: WIDTH, h: w },
    heroes: [at(0, 0, w, w)],
    grid: Array.from({ length: 9 }, (_, i) =>
      at(inset + (i % 3) * pitch, inset + Math.floor(i / 3) * pitch, cell, cell),
    ),
    heading: false,
  }
})()

const LAYOUT = { v1: V1, v2: V2 } as const

/** How long a photo stays before the next one takes over, in either version. */
const PHOTO_MS = 5000
/** How long a card takes to travel between slots. */
const TRAVEL_S = 0.9
/** Cards behind the one being dealt follow a beat later, so it reads as a deal. */
const FOLLOW_S = 0.09

/**
 * Breathing room above the design box. v1's box already carries 20px above its
 * heading, which lines that heading up with the form heading opposite; v2 has
 * no heading, so this is all the clearance it gets.
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

/**
 * One photo that cross-fades whenever its source changes.
 *
 * `fade` and `emerge` let the v2 hero dissolve far more slowly than a grid
 * tile, and let the incoming frame settle in from a hair larger — enough to
 * read as one picture giving way to the next, not enough to pull the eye off
 * the form beside it.
 */
function PhotoTile({ src, fade = 0.45, emerge = 1 }: { src: string; fade?: number; emerge?: number }) {
  return (
    <AnimatePresence initial={false} mode="sync">
      <motion.img
        key={src}
        src={src}
        alt=""
        aria-hidden
        draggable={false}
        initial={{ opacity: 0, scale: emerge }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1 }}
        transition={{ duration: fade, ease: 'easeInOut' }}
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
  /** Always the photo this card is currently showing, in either state. */
  photo: string
  /** Position in the fan, 0 = back of the deck. */
  slot: number
  /** Grid cell it occupies once a style is chosen; undefined while fanned. */
  cell?: number
  /** Set on the card being dealt to the back; swapped in once it lands. */
  pending?: string
}

/**
 * Decide which grid cell each deck card flies to when a style is chosen.
 *
 * A card already showing a photo that belongs to the chosen category keeps it,
 * and travels to that photo's own cell — the picture you were looking at simply
 * takes its place in the grid. Every other card takes the lowest free cell and
 * dissolves into whatever belongs there. Cells no card claims are filled by the
 * tiles that fade in alongside.
 *
 * A photo in the category but ranked outside the visible six has no cell to go
 * to, so it dissolves like any other. With the current pools that cannot arise:
 * the deck only ever draws from the first few of each category.
 */
function planGrid(cards: Card[], gridPhotos: string[]): Map<number, number> {
  const claimed = new Set<number>()
  const cellOf = new Map<number, number>()

  for (const c of cards) {
    const i = gridPhotos.indexOf(c.photo)
    if (i >= 0 && !claimed.has(i)) {
      claimed.add(i)
      cellOf.set(c.id, i)
    }
  }
  for (const c of cards) {
    if (cellOf.has(c.id)) continue
    for (let i = 0; i < gridPhotos.length; i++) {
      if (!claimed.has(i)) {
        claimed.add(i)
        cellOf.set(c.id, i)
        break
      }
    }
  }
  return cellOf
}

export function HeadshotShowcase({
  gender,
  style,
  version = 'v1',
}: {
  gender: GenderChoice
  style: StyleId | null
  version?: ShowcaseVersion
}) {
  const reduceMotion = useReducedMotion()
  const L = LAYOUT[version]
  const { ref, scale } = useFitScale(L.design.w, L.design.h, TOP_INSET)
  const isSolo = L.heroes.length === 1

  const gridPhotos = style ? photosFor(gender, style, L.grid.length) : null

  // The hero cards keep their identity across the shuffle and across the
  // flight into the grid, so motion animates movement instead of a remount.
  const [cards, setCards] = useState<Card[]>(() =>
    photosFor(gender, 'mix', L.heroes.length).map((photo, i) => ({ id: i, photo, slot: i })),
  )
  const poolCursor = useRef(0)

  // Re-photograph the deck whenever gender or style changes. Done during
  // render rather than in an effect because it is derived from a prop change —
  // an effect would cost an extra render showing the previous photos.
  //
  // `card.photo` is kept equal to what the card actually displays in both
  // states. Planning the flight into the grid depends on it: matching against a
  // card's stale fan photo would dissolve away an image that is on screen and
  // belongs to the chosen category, then fade the same face back in elsewhere.
  const [applied, setApplied] = useState<{ gender: GenderChoice; style: StyleId | null }>({
    gender,
    style,
  })
  if (applied.gender !== gender || applied.style !== style) {
    const styleChanged = applied.style !== style
    setApplied({ gender, style })
    setCards((prev) => {
      if (!style) {
        // Back to the fan.
        const fresh = photosFor(gender, 'mix', L.heroes.length)
        return prev.map((c) => ({
          ...c,
          cell: undefined,
          photo: fresh[c.slot] ?? c.photo,
          pending: undefined,
        }))
      }
      const grid = photosFor(gender, style, L.grid.length)
      if (!styleChanged) {
        // Gender changed under a chosen style: same cells, every face dissolves.
        return prev.map((c) => ({ ...c, photo: grid[c.cell ?? 0], pending: undefined }))
      }
      const cellOf = planGrid(prev, grid)
      return prev.map((c) => {
        const cell = cellOf.get(c.id) ?? c.slot
        return { ...c, cell, photo: grid[cell], pending: undefined }
      })
    })
  }

  // What the cards show right now, readable from inside the interval without
  // making it depend on `cards` and tear the timer down on every tick.
  const cardsRef = useRef(cards)
  useEffect(() => {
    cardsRef.current = cards
  }, [cards])

  // Idle shuffle — only while nothing is selected.
  useEffect(() => {
    // The deck was just re-dealt from the top of this gender's pool.
    poolCursor.current = 0
    if (style || reduceMotion) return
    const pool = photosFor(gender, 'mix', Math.max(6, L.heroes.length * 2))
    const id = setInterval(() => {
      // Pick the next face here rather than inside the state updater. Advancing
      // the cursor is a side effect, and React invokes updaters twice in
      // development to surface exactly that — which skipped every other photo
      // in dev while production showed them all.
      const onScreen = cardsRef.current.map((c) => c.photo)
      let incoming: string | undefined
      for (let i = 0; i < pool.length; i++) {
        poolCursor.current += 1
        const candidate = pool[poolCursor.current % pool.length]
        // The next photo no card is showing, its own included — excluding only
        // the others let a card be handed back the picture it already had, so
        // that beat rotated the deck without actually changing a photo.
        if (!onScreen.includes(candidate)) {
          incoming = candidate
          break
        }
      }

      setCards((prev) => {
        if (prev.length === 1) {
          // v2: nothing to rotate, and with no movement there is no animation
          // to land on, so the next face is committed outright and dissolves.
          return prev.map((c) => ({ ...c, photo: incoming ?? c.photo }))
        }
        // v1: the deck rotates and the card reaching the back takes the new
        // face, staged as `pending` and swapped in once it has landed there so
        // the cross-fade never happens in full view.
        return prev.map((c) => {
          const slot = (c.slot + 1) % prev.length
          return slot === 0 ? { ...c, slot, pending: incoming } : { ...c, slot }
        })
      })
    }, PHOTO_MS)
    return () => clearInterval(id)
  }, [L, style, gender, reduceMotion])

  // Cells no hero card holds — the tiles that fade in to complete the grid.
  const held = new Set(cards.map((c) => c.cell))
  const spare = gridPhotos ? L.grid.map((_, i) => i).filter((i) => !held.has(i)) : []

  /** Commit a staged face once its card has finished travelling to the back. */
  const land = (id: number) => {
    // Only while fanned; the grid holds its faces still.
    if (style) return
    setCards((prev) =>
      prev.map((c) => (c.id === id && c.pending ? { ...c, photo: c.pending, pending: undefined } : c)),
    )
  }

  return (
    <div ref={ref} className="flex size-full items-start justify-center overflow-hidden">
      <div
        className="relative shrink-0"
        style={{
          width: L.design.w,
          height: L.design.h,
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
        {L.heading && (
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
        )}

        {/* Hero cards — three fanned in v1, one square frame in v2. They
            fly into their grid cells when a style is chosen. */}
        {cards.map((card) => {
          const to = gridPhotos ? L.grid[card.cell ?? card.slot] : L.heroes[card.slot]
          // card.photo is already what this card shows. If the plan let it keep
          // its picture there is no src change and nothing cross-fades — the
          // image simply travels to its cell. Otherwise PhotoTile dissolves.
          const photo = card.photo
          // The card is scaled, so anything measured in px scales with it.
          // Divide through to keep the stroke, corner and shadow at design size.
          const k = 1 / to.scale
          return (
            <motion.div
              key={card.id}
              className="absolute top-0 left-0 overflow-hidden border-white bg-[var(--color-shapes-grey)]"
              style={{
                width: L.base.w,
                height: L.base.h,
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
                z: isSolo ? 40 : card.slot * 40,
                borderWidth: k,
                borderRadius: 12 * k,
              }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : gridPhotos
                    ? isSolo
                      // v2 settles into its cell rather than springing, to keep
                      // the panel calm.
                      ? { duration: 0.75, ease: [0.32, 0.72, 0, 1] }
                      : { type: 'spring', stiffness: 150, damping: 22, mass: 0.9 }
                    : {
                        duration: TRAVEL_S,
                        ease: [0.4, 0, 0.16, 1],
                        delay: card.slot === 0 ? 0 : FOLLOW_S,
                      }
              }
              onAnimationComplete={() => land(card.id)}
            >
              <PhotoTile
                src={photo}
                // v2's idle frame is the one thing on this panel that moves on
                // its own, so it dissolves slowly and settles in from a hair
                // larger. Everything else uses the brisker default.
                fade={isSolo && !gridPhotos ? 1.2 : 0.45}
                emerge={isSolo && !gridPhotos ? 1.03 : 1}
              />
            </motion.div>
          )
        })}

        {/* The cells no deck card claimed — they fade in alongside. */}
        <AnimatePresence>
          {gridPhotos &&
            spare.map((cell, i) => {
              // Built exactly like the deck cards — same base box, same scale,
              // same compensation. The browser quantises border-width to whole
              // pixels, so a tile drawn at its true 156x165 would end up with a
              // visibly heavier hairline than its scaled neighbours.
              const slot = L.grid[cell]
              const k = 1 / slot.scale
              return (
                <motion.div
                  key={`spare-${cell}`}
                  className="absolute top-0 left-0 overflow-hidden border-white bg-[var(--color-shapes-grey)]"
                  style={{
                    width: L.base.w,
                    height: L.base.h,
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
                  <PhotoTile src={gridPhotos[cell]} />
                </motion.div>
              )
            })}
        </AnimatePresence>
      </div>
    </div>
  )
}
