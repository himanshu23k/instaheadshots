import { Check, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilledSlot } from './parts'
import { CHECKLIST, K, K2, progressMix } from './tokens'
import { MIN_PHOTOS, VARIETY_PHOTOS, type Photo } from './use-photos'

/**
 * Ten segments, one per photo, filling yellow and turning mint by 10. The
 * 3rd and the 10th are milestones: taller, labelled "3 • Minimum" and "10 • Recommended" underneath.
 */
export function SegmentMeter({ count }: { count: number }) {
  // Same yellow → mint as the caption under it.
  const mix = progressMix(count)
  const fill = mix(K2.segStart.fill, K2.segDone.fill)
  const strong = mix(K2.segStart.strong, K2.segDone.strong)
  return (
    <div className="flex w-full flex-col gap-3">
      <div
        className="flex h-[9px] items-center gap-1"
        role="meter"
        aria-label="Photos added"
        aria-valuemin={0}
        aria-valuemax={VARIETY_PHOTOS}
        aria-valuenow={Math.min(count, VARIETY_PHOTOS)}
      >
        {Array.from({ length: VARIETY_PHOTOS }, (_, i) => {
          const milestone = i === MIN_PHOTOS - 1 || i === VARIETY_PHOTOS - 1
          const filled = i < count
          return (
            <span
              key={i}
              className={cn('flex-1 rounded-full transition-colors duration-300', milestone ? 'h-[9px]' : 'h-[5px]')}
              style={{
                background: filled ? (milestone ? strong : fill) : milestone ? K2.trackMilestone : K2.track,
                transitionDelay: filled ? `${i * 40}ms` : '0ms',
              }}
            />
          )
        })}
      </div>
      <div className="relative h-4 text-[14px] leading-4">
        {/* Centred under the 3rd segment. */}
        <span className="absolute left-1/4 -translate-x-1/2 whitespace-nowrap">
          <Milestone n={MIN_PHOTOS} label="Minimum" />
        </span>
        <span className="absolute right-0 whitespace-nowrap">
          <Milestone n={VARIETY_PHOTOS} label="Recommended" />
        </span>
      </div>
    </div>
  )
}

function Milestone({ n, label }: { n: number; label: string }) {
  return (
    <>
      <span style={{ fontWeight: 450, color: K.text }}>{n}</span>
      <span style={{ color: K.secondary }}> • {label}</span>
    </>
  )
}

const tileClass = 'flex items-center justify-center rounded-xl border-[1.5px] border-dashed transition-transform active:scale-[0.98]'
const tileStyle = { background: K2.tile, borderColor: K2.tileStroke, color: K.text }

/**
 * No photos yet: one wide dashed tile. Once there are some, a square add tile
 * leads the grid and the photos follow. It stays past 10 (the meter just tops
 * out) and goes only once `max` are in.
 */
export function PhotoPicker({
  photos,
  max,
  onAdd,
  onRemove,
  className = '',
}: {
  photos: Photo[]
  max: number
  onAdd: () => void
  onRemove: (id: string) => void
  className?: string
}) {
  if (!photos.length) {
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
    </div>
  )
}

export function Checklist({ className = '' }: { className?: string }) {
  return (
    <ul className={cn('flex flex-col gap-[14px]', className)}>
      {CHECKLIST.map((item) => (
        <li key={item} className="flex items-center gap-3 text-[16px] leading-[18px]" style={{ color: K.text }}>
          <Check size={16} strokeWidth={1.75} className="shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  )
}
