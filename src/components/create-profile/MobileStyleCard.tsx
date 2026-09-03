/**
 * Mobile style picker card (Figma 6588:5247 selected / 6588:5238 unselected).
 *
 * Every option shows its own strip of example photos. The selected card's strip
 * runs as a marquee — reusing the `marquee-left` keyframe and the doubled-array
 * trick already used by DriftingFaces — so the choice you have made is the one
 * that is visibly alive. Unselected strips hold still.
 */
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { photosFor, type GenderId, type StyleOption } from './create-profile-data'

const TILE = 70
const GAP = 4
/** Enough tiles that the loop never shows its seam on a 342px card. */
const STRIP_LENGTH = 8

function StripTile({ src }: { src: string }) {
  return (
    <span
      className="relative block shrink-0 overflow-hidden rounded-[12px] border border-white bg-[var(--color-shapes-grey)]"
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
    </span>
  )
}

export function MobileStyleCard({
  option,
  gender,
  selected,
  onSelect,
}: {
  option: StyleOption
  gender: GenderId
  selected: boolean
  onSelect: () => void
}) {
  const reduceMotion = useReducedMotion()
  const photos = photosFor(gender, option.id, STRIP_LENGTH)
  // Doubled so translating -50% loops seamlessly; the gap lives on each tile as
  // a margin so one period is exactly STRIP_LENGTH * (TILE + GAP).
  const tiles = [...photos, ...photos]
  const duration = `${STRIP_LENGTH * 2.4}s`

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className="flex w-full flex-col items-start gap-3 overflow-hidden rounded-[16px] p-3 text-left transition-[border-color] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-neon-green)]"
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
      <span
        className="body-l"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {option.cardLabel}
      </span>

      <span className="block w-full overflow-hidden rounded-[12px]">
        <span
          className="flex w-max will-change-transform"
          style={
            selected && !reduceMotion
              ? { animation: `marquee-left ${duration} linear infinite` }
              : undefined
          }
        >
          {(selected && !reduceMotion ? tiles : photos).map((src, i) => (
            <StripTile key={`${i}-${src}`} src={src} />
          ))}
        </span>
      </span>
    </button>
  )
}
