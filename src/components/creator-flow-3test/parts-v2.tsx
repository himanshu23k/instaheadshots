import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowRight, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilledSlot, ProgressCaption } from './parts'
import { K, K2, progressMix } from './tokens'
import { MIN_PHOTOS, VARIETY_PHOTOS, type Photo } from './use-photos'

const MILESTONES: Record<number, string> = {
  [MIN_PHOTOS - 1]: `${MIN_PHOTOS} • Minimum`,
  [VARIETY_PHOTOS - 1]: `${VARIETY_PHOTOS} • Recommended`,
}

/**
 * Ten segments, one per photo, filling yellow and turning mint by 10. The 3rd
 * and the 10th are milestones: pills that carry their own label.
 */
export function SegmentMeter({ count }: { count: number }) {
  // Same yellow → mint as the caption above it.
  const mix = progressMix(count)
  const fill = mix(K2.segStart.fill, K2.segDone.fill)
  const strong = mix(K2.segStart.strong, K2.segDone.strong)
  const strongText = mix(K2.bubbleStart.text, K2.bubbleDone.text)
  return (
    <div
      className="flex h-5 w-full items-center gap-1"
      role="meter"
      aria-label="Photos added"
      aria-valuemin={0}
      aria-valuemax={VARIETY_PHOTOS}
      aria-valuenow={Math.min(count, VARIETY_PHOTOS)}
    >
      {Array.from({ length: VARIETY_PHOTOS }, (_, i) => {
        const label = MILESTONES[i]
        const filled = i < count
        const delay = filled ? `${i * 40}ms` : '0ms'
        return label ? (
          <span
            key={i}
            data-seg
            className="flex h-5 flex-none items-center rounded-full px-2 text-[11px] leading-none whitespace-nowrap transition-colors duration-300"
            style={{ background: filled ? strong : K2.trackMilestone, color: filled ? strongText : '#45474A', fontWeight: 450, transitionDelay: delay }}
          >
            {label}
          </span>
        ) : (
          <span
            key={i}
            data-seg
            className="h-[5px] min-w-2 flex-1 rounded-full transition-colors duration-300"
            style={{ background: filled ? fill : K2.track, transitionDelay: delay }}
          />
        )
      })}
    </div>
  )
}

/**
 * The caption above the meter. The milestone pills make the segments uneven,
 * so the arrow's spot is measured: it points at the latest filled segment
 * (the first one before any photos).
 */
export function ProgressBlock({ photos, caption, compact = false }: { photos: Photo[]; caption: string; compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [arrowLeft, setArrowLeft] = useState<string>()
  const n = photos.length

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const measure = () => {
      const segs = root.querySelectorAll<HTMLElement>('[data-seg]')
      const seg = segs[Math.max(0, Math.min(n, VARIETY_PHOTOS) - 1)]
      if (!seg) return
      const a = root.getBoundingClientRect()
      const b = seg.getBoundingClientRect()
      setArrowLeft(`${b.left - a.left + b.width / 2}px`)
    }
    // Fires once on observe, then on every resize.
    const ro = new ResizeObserver(measure)
    ro.observe(root)
    return () => ro.disconnect()
  }, [n])

  return (
    <div ref={ref} className="flex w-full flex-col gap-3">
      <ProgressCaption photos={photos} compact={compact} caption={caption} tone="progress" arrow="bottom" arrowLeft={arrowLeft} maxAvatars={4} avatarSize={20} textSize={compact ? 13 : 15} />
      <SegmentMeter count={n} />
    </div>
  )
}

const tileClass = 'flex items-center justify-center rounded-xl border-[1.5px] border-dashed transition-transform active:scale-[0.98]'
const tileStyle = { background: K2.tile, borderColor: K2.tileStroke, color: K.text }

/**
 * No photos yet: one wide dashed tile (mobile; desktop has its upload button
 * beside it and passes `emptyTile={false}`). Once there are some, a square add
 * tile leads the grid and the photos follow, until `max` are in; below 3,
 * blank slots after them show how many the minimum still needs.
 */
export function PhotoPicker({
  photos,
  max,
  onAdd,
  onRemove,
  emptyTile = true,
  className = '',
}: {
  photos: Photo[]
  max: number
  onAdd: () => void
  onRemove: (id: string) => void
  emptyTile?: boolean
  className?: string
}) {
  if (!photos.length) {
    if (!emptyTile) return null
    return (
      <button type="button" onClick={onAdd} className={cn(tileClass, 'h-[136px] w-full flex-col gap-2')} style={tileStyle}>
        <Plus size={20} strokeWidth={1.5} />
        <span className="text-[16px] leading-[18px]" style={{ fontWeight: 450 }}>
          Click to Upload Photos
        </span>
      </button>
    )
  }
  return (
    <div className={cn('grid w-full', className)}>
      {photos.length < max && (
        <button type="button" onClick={onAdd} aria-label="Add photos" className={cn(tileClass, 'aspect-square')} style={tileStyle}>
          <Plus size={28} strokeWidth={1.5} />
        </button>
      )}
      {photos.map((p, i) => (
        <FilledSlot key={p.id} photo={p} index={i} onRemove={() => onRemove(p.id)} />
      ))}
      {/* Blank grey slots up to the 3 minimum, a shade darker than the desktop page; they still open the picker. */}
      {Array.from({ length: Math.max(0, MIN_PHOTOS - photos.length) }, (_, i) => (
        <button
          key={`blank-${i}`}
          type="button"
          onClick={onAdd}
          aria-label="Add a photo"
          className="aspect-square rounded-lg border bg-[#EFF0F2]"
          style={{ borderColor: K.stroke }}
        />
      ))}
    </div>
  )
}

// ── What 3 vs 10+ photos get you ──────────────────────────────────────────────

const EX = '/creator-flow-3test/examples'
/** Twelve, so the 4-column grid of the 10+ card fills evenly. */
const INPUTS = [4, 6, 7, 1, 2, 3, 5, 4, 6, 7, 1, 2].map((i) => `${EX}/in-${i}.jpg`)
/** Two near-identical studio looks: what 3 photos tend to give. */
const FEW_LOOKS = [1, 2].map((i) => `${EX}/out-${i}.jpg`)
/** Office, brick, park, street and studio: what 10+ photos open up. */
const MANY_LOOKS = [3, 4, 5, 6, 1, 2].map((i) => `${EX}/out-${i}.jpg`)

/** The tiles of the 10+ grid swap in this order, so the change never sweeps across. */
const SWAP_ORDER = [0, 3, 1, 2]

/**
 * `tiles` looks from `pool`, one tile changing every `everyMs` to a look not
 * already showing. Holds still for reduced motion.
 */
function useRotatingLooks(pool: string[], tiles: number, everyMs: number) {
  const reduce = useReducedMotion()
  const [s, setS] = useState({ shown: pool.slice(0, tiles), next: tiles % pool.length, step: 0 })
  useEffect(() => {
    if (reduce || pool.length <= tiles) return
    const t = window.setInterval(
      () =>
        setS(({ shown, next, step }) => {
          let i = next
          while (shown.includes(pool[i])) i = (i + 1) % pool.length
          const copy = shown.slice()
          copy[tiles === SWAP_ORDER.length ? SWAP_ORDER[step % tiles] : step % tiles] = pool[i]
          return { shown: copy, next: (i + 1) % pool.length, step: step + 1 }
        }),
      everyMs,
    )
    return () => clearInterval(t)
  }, [reduce, pool, tiles, everyMs])
  return s.shown
}

/** A slow crossfade between looks: opacity only, so it sits still in the corner of the eye. */
function Look({ src, className = '' }: { src: string; className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-md bg-[#EEF0F2]', className)}>
      <AnimatePresence initial={false}>
        <motion.img
          key={src}
          src={src}
          alt=""
          className="absolute inset-0 size-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        />
      </AnimatePresence>
    </div>
  )
}

/**
 * Results are a fixed square: 128 on phones, 140 on desktop. Inputs are a
 * fixed 168 / 176 box at the same height with the fan or grid centred in it,
 * so both rows line up at any width: phones and tablets centre the group,
 * desktop keeps ~170px beside it for the label. The 12-photo grid gets ~38px and ~41px thumbs.
 */
const RESULTS = 'size-[128px] web:size-[140px]'
const INPUTS_BOX = 'h-[128px] w-[168px] min-w-0 shrink web:h-[140px] web:w-[176px]'

/** A plain row, no border or fill: it's an illustration, not something to tap. */
/**
 * A plain row, no border or fill: it's an illustration, not something to tap.
 * Phones and tablets centre it under the centred heading, label above; desktop
 * puts the label beside it.
 */
function ExampleRow({ title, note, inputs, results }: { title: string; note: string; inputs: React.ReactNode; results: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-4 web:flex-row web:items-center web:justify-between web:gap-4 web:py-5">
      <div className="flex min-w-0 flex-col items-center gap-1 text-center web:items-start web:text-left">
        <span className="text-[14px] leading-4 web:text-[16px] web:leading-[18px]" style={{ fontWeight: 450, color: K.text }}>
          {title}
        </span>
        <span className="text-[12px] leading-[14px] web:text-[14px] web:leading-4" style={{ color: K.secondary }}>
          {note}
        </span>
      </div>
      <div className="flex w-full items-center justify-center gap-3 web:w-auto" aria-hidden>
        {inputs}
        <ArrowRight size={16} strokeWidth={1.5} className="shrink-0" style={{ color: K.muted }} />
        {results}
      </div>
    </div>
  )
}

/** Old flow's graphic title (Figma 385:3809): Greed 22/24 at 450, a dark teal → sage fill clipped to the text. */
export function VarietyHeading({ className = '' }: { className?: string }) {
  return (
    <h2
      className={cn(
        'self-center bg-clip-text pb-[0.1em] text-center text-[22px] leading-6 tracking-[-0.22px] text-transparent',
        className,
      )}
      style={{ fontWeight: 450, backgroundImage: 'linear-gradient(124.73deg, #01312F 44.3%, #95B7B5 94.1%)' }}
    >
      More photos get you more variety
    </h2>
  )
}

/**
 * A labelled section in place of the tips list, two rows split by a hairline:
 * 3 photos fan into a couple of similar headshots, 10+ fill a grid that turns
 * into four varied ones. Shown only before the first upload; after that the
 * page keeps just the heading, above the grid. The
 * only motion is the results crossfading, slowly and out of step; it stops
 * for reduced motion.
 */
export function PhotoCountExamples({ className = '' }: { className?: string }) {
  const [few] = useRotatingLooks(FEW_LOOKS, 1, 4400)
  const many = useRotatingLooks(MANY_LOOKS, 4, 1300)

  return (
    <section className={cn('flex flex-col', className)} aria-label="More photos get you more variety">
      <VarietyHeading className="mb-1" />
      <div className="flex flex-col divide-y divide-[#E0E1E1]">
        <ExampleRow
          title="3 photos"
          note="A good start, fewer looks"
          inputs={
            <div className={cn('relative', INPUTS_BOX)}>
              {INPUTS.slice(0, 3).map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="absolute top-1/2 left-1/2 aspect-square h-[68%] rounded-md object-cover shadow-[0_1px_3px_rgba(0,0,0,0.12)] ring-2 ring-white"
                  style={{ transform: `translate(-50%, -50%) translateX(${(i - 1) * 42}%) rotate(${(i - 1) * 8}deg)`, zIndex: i === 1 ? 2 : 1 }}
                />
              ))}
            </div>
          }
          results={<Look src={few} className={cn('shrink-0', RESULTS)} />}
        />
        <ExampleRow
          title="10+ photos"
          note="The most variety"
          inputs={
            <div className={cn('flex items-center justify-center', INPUTS_BOX)}>
              <div className="grid w-full max-w-[176px] grid-cols-4 gap-1">
                {INPUTS.map((src, i) => (
                  <img key={i} src={src} alt="" className="aspect-square w-full rounded-[4px] object-cover" />
                ))}
              </div>
            </div>
          }
          results={
            <div className={cn('grid shrink-0 grid-cols-2 gap-1', RESULTS)}>
              {many.map((src, i) => (
                <Look key={i} src={src} className="rounded-[4px]" />
              ))}
            </div>
          }
        />
      </div>
    </section>
  )
}
