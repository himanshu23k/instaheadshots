/**
 * Mobile style picker card (Figma 6588:5247 selected / 6588:5238 unselected).
 *
 * Every option shows its own strip of example photos. The selected card's strip
 * runs as a marquee, so the choice you have made is the one that is visibly
 * alive. Unselected strips hold still.
 *
 * The marquee is driven by motion in whole pixels rather than a CSS keyframe
 * translating -50%: Safari's compositor is unreliable about a percentage
 * transform on a `max-content` flex box promoted with `will-change` inside a
 * rounded `overflow:hidden` ancestor, and the whole strip would sit frozen.
 * The period is known exactly, so there is nothing to resolve at runtime.
 */
import { motion, useReducedMotion } from 'motion/react'
import { AnimatePresence } from 'motion/react'
import { photosFor, type GenderChoice, type StyleOption } from './create-profile-data'

const TILE = 70
const GAP = 4
/** Enough tiles that the loop never shows its seam on a 342px card. */
const STRIP_LENGTH = 8
/** One full loop: the strip is rendered twice, so this is exactly half of it. */
const PERIOD = STRIP_LENGTH * (TILE + GAP)
const PX_PER_SECOND = 34

function StripTile({ src }: { src: string }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-[12px] border border-white bg-[var(--color-shapes-grey)]"
      style={{ width: TILE, height: TILE, marginRight: GAP }}
    >
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
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="absolute inset-0 size-full select-none object-cover"
          style={{ objectPosition: 'center 25%' }}
        />
      </AnimatePresence>
    </div>
  )
}

export function MobileStyleCard({
  option,
  gender,
  selected,
  onSelect,
}: {
  option: StyleOption
  gender: GenderChoice
  selected: boolean
  onSelect: () => void
}) {
  const reduceMotion = useReducedMotion()
  const photos = photosFor(gender, option.id, STRIP_LENGTH)
  // Always doubled, running or not, so selecting a card starts the loop without
  // remounting half the strip underneath it.
  const tiles = [...photos, ...photos]
  const running = selected && !reduceMotion

  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          onSelect()
        }
      }}
      className="flex w-full cursor-pointer flex-col items-start gap-3 overflow-hidden rounded-[16px] p-3 text-left transition-[border-color] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-neon-green)]"
      style={{
        border: selected
          ? '1px solid var(--color-border-secondary)'
          : '1px solid var(--color-border-primary)',
        backgroundImage: selected
          ? 'linear-gradient(-70.707deg, rgb(255,255,255) 20.909%, rgb(225,255,248) 61.945%, rgb(242,255,193) 102.98%)'
          : 'none',
        backgroundColor: selected ? undefined : 'var(--color-bg-section)',
      }}
    >
      <span className="body-l" style={{ color: 'var(--color-text-primary)' }}>
        {option.cardLabel}
      </span>

      <div className="w-full overflow-hidden rounded-[12px]">
        <motion.div
          className="flex"
          // An explicit width, not `max-content` — one less thing for the
          // engine to resolve before the transform means anything.
          style={{ width: PERIOD * 2, backfaceVisibility: 'hidden' }}
          animate={running ? { x: [0, -PERIOD] } : { x: 0 }}
          transition={
            running
              ? {
                  duration: PERIOD / PX_PER_SECOND,
                  ease: 'linear',
                  repeat: Infinity,
                  repeatType: 'loop',
                }
              : // Picking a different card stops this one — glide the strip
                // home rather than snapping it back mid-scroll.
                { duration: 0.4, ease: 'easeOut' }
          }
        >
          {tiles.map((src, i) => (
            <StripTile key={`${i}-${src}`} src={src} />
          ))}
        </motion.div>
      </div>
    </div>
  )
}
