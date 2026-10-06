import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Menu, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { K, captionFor } from './tokens'
import { MAX_PHOTOS, MIN_PHOTOS, VARIETY_PHOTOS, type Photo, type Toast } from './use-photos'

const A = '/creator-flow-3test'

export function TopBar({ className = '' }: { className?: string }) {
  const navigate = useNavigate()
  return (
    <div className={cn('flex h-15 w-full items-center justify-between', className)}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Go back"
        className="flex items-center justify-center rounded-md p-2 transition-opacity hover:opacity-70"
        style={{ color: K.text }}
      >
        <ArrowLeft size={24} strokeWidth={1.5} />
      </button>
      <button
        type="button"
        aria-label="Open menu"
        className="flex items-center justify-center rounded-md p-2 transition-opacity hover:opacity-70"
        style={{ color: K.text }}
      >
        <Menu size={24} strokeWidth={1.5} />
      </button>
    </div>
  )
}

/** Old flow's underlined text button. */
export function RequirementsLink() {
  return (
    <button
      type="button"
      className="self-start border-b pb-0.5 text-[16px] leading-[18px] transition-opacity hover:opacity-70"
      style={{ fontWeight: 450, color: K.text, borderColor: K.text }}
    >
      Read photo requirements
    </button>
  )
}

export function SecureNote({ className = '' }: { className?: string }) {
  return (
    <p className={cn('flex items-center gap-2 text-[14px] leading-4', className)} style={{ color: K.secondary }}>
      <img src={`${A}/secure.svg`} alt="" width={14} height={14} className="shrink-0" />
      Photos only used to create your headshots
    </p>
  )
}

/** White, outlined sibling of PrimaryCta for "Add more for variety". */
export function SecondaryCta({ children, onClick, className = '' }: { children: React.ReactNode; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-12 items-center justify-center gap-2 rounded-lg border bg-white px-6 text-[16px] leading-[18px] transition-colors hover:bg-[#FAFAFB]',
        className,
      )}
      style={{ fontWeight: 450, color: K.text, borderColor: K.text }}
    >
      <Plus size={18} strokeWidth={1.75} />
      {children}
    </button>
  )
}

// ── Variety meter ─────────────────────────────────────────────────────────────

const pct = (n: number) => (Math.min(n, VARIETY_PHOTOS) / VARIETY_PHOTOS) * 100
const READY_AT = pct(MIN_PHOTOS)

/**
 * A track from 0 to 10 with two stops — "3 · Ready" and "10 · Most variety" —
 * and a caption bubble whose arrow follows the fill. The bubble's avatars are
 * the user's own photos, with dashed ghosts until the first 3 are in.
 */
export function VarietyMeter({ photos, compact = false }: { photos: Photo[]; compact?: boolean }) {
  const n = photos.length
  const fill = pct(n)
  const avatarCount = n < 6 ? 3 : n < VARIETY_PHOTOS ? 4 : 5
  const avatars = Array.from({ length: avatarCount }, (_, i) => photos[i] ?? null)
  const label = compact ? 'text-[12px] leading-[14px]' : 'text-[13px] leading-4'

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="relative h-[40px]" role="meter" aria-valuemin={0} aria-valuemax={VARIETY_PHOTOS} aria-valuenow={Math.min(n, VARIETY_PHOTOS)} aria-label="Photos added">
        <div className="absolute top-[7px] left-0 h-1.5 rounded-l-full" style={{ width: `${READY_AT}%`, background: K.stroke }} />
        <div className="absolute top-[7px] right-0 h-1.5 rounded-r-full" style={{ left: `${READY_AT}%`, background: K.varietyTrack }} />
        <div
          className="absolute top-[7px] left-0 h-1.5 rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${fill}%`, background: n >= VARIETY_PHOTOS ? K.variety : K.text }}
        />
        <Stop at={READY_AT} reached={n >= MIN_PHOTOS} color={K.text} />
        <Stop at={100} reached={n >= VARIETY_PHOTOS} color={K.variety} />
        <span className={cn('absolute top-6 -translate-x-1/2 whitespace-nowrap', label)} style={{ left: `${READY_AT}%`, fontWeight: 450, color: K.text }}>
          3 · Ready
        </span>
        <span className={cn('absolute top-6 right-0 whitespace-nowrap', label)} style={{ fontWeight: 450, color: K.variety }}>
          10 · Most variety
        </span>
      </div>

      <div className="relative">
        <span
          aria-hidden
          className="absolute -top-1.5 -ml-1.5 size-3 rotate-45 border-t border-l transition-[left] duration-300 ease-out"
          style={{ left: `${Math.max(4, Math.min(96, fill))}%`, background: K.bubble, borderColor: K.bubbleStroke }}
        />
        <div className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5" style={{ background: K.bubble, borderColor: K.bubbleStroke }}>
          <div className="flex shrink-0 items-center">
            {avatars.map((p, i) => (
              <span
                key={p?.id ?? `ghost-${i}`}
                className={cn('size-6 overflow-hidden rounded-full', i > 0 && '-ml-[7px]')}
                style={p ? { boxShadow: `0 0 0 2px ${K.bubble}` } : { border: `1.5px dashed ${K.muted}`, background: '#fff' }}
              >
                {p && <img src={p.url} alt="" className="size-full object-cover" />}
              </span>
            ))}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={captionFor(n)}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              aria-live="polite"
              className={compact ? 'text-[14px] leading-[18px]' : 'text-[15px] leading-[18px]'}
              style={{ fontWeight: 450, color: K.variety }}
            >
              {captionFor(n)}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function Stop({ at, reached, color }: { at: number; reached: boolean; color: string }) {
  return (
    <span
      aria-hidden
      className={cn('absolute top-[3px] size-3.5 rounded-full border-[3px] border-white transition-colors duration-300', at < 100 ? '-ml-[7px]' : '')}
      style={{
        ...(at < 100 ? { left: `${at}%` } : { right: 0 }),
        background: reached ? color : '#fff',
        boxShadow: `0 0 0 1.5px ${color}`,
      }}
    />
  )
}

// ── Photo grid ────────────────────────────────────────────────────────────────

type Tier = 'required' | 'recommended' | 'optional'
const tierFor = (i: number): Tier => (i < MIN_PHOTOS ? 'required' : i < VARIETY_PHOTOS ? 'recommended' : 'optional')

/**
 * Up to 10 the grid shows 10 slots (3 you need, 7 for variety). Past 10 it
 * keeps one optional slot open until all 15 are in.
 */
export function PhotoGrid({
  photos,
  onAdd,
  onRemove,
  className = '',
}: {
  photos: Photo[]
  onAdd: () => void
  onRemove: (id: string) => void
  className?: string
}) {
  const n = photos.length
  const shown = n < VARIETY_PHOTOS ? VARIETY_PHOTOS : Math.min(n + 1, MAX_PHOTOS)
  return (
    <div className={cn('grid w-full', className)}>
      {Array.from({ length: shown }, (_, i) => {
        const p = photos[i]
        return p ? (
          <FilledSlot key={p.id} photo={p} index={i} onRemove={() => onRemove(p.id)} />
        ) : (
          <EmptySlot key={`empty-${i}`} tier={tierFor(i)} onAdd={onAdd} />
        )
      })}
    </div>
  )
}

function FilledSlot({ photo, index, onRemove }: { photo: Photo; index: number; onRemove: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="relative aspect-square overflow-hidden rounded-lg border"
      style={{ borderColor: K.stroke }}
    >
      <img
        src={photo.url}
        alt={`Photo ${index + 1}`}
        className="size-full object-cover transition-[filter] duration-500"
        style={{ filter: photo.uploading ? 'blur(8px)' : 'none' }}
      />
      {/* Old flow close chip: 18px, #000409, radius 4, 4px in from the corner. The button pads it out to a usable target. */}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove photo ${index + 1}`}
        className="absolute top-0 right-0 flex size-9 items-start justify-end p-1"
      >
        <span className="flex size-[18px] items-center justify-center rounded-[4px] p-0.5" style={{ background: K.text }}>
          <img src={`${A}/close.svg`} alt="" width={14} height={14} />
        </span>
      </button>
    </motion.div>
  )
}

const TIER_STYLE: Record<Tier, { className: string; style: React.CSSProperties; label: string }> = {
  required: {
    className: 'border-[1.5px] border-solid bg-[#FAFAFA] web:bg-white',
    style: { borderColor: K.text, color: K.text },
    label: 'Add a photo',
  },
  recommended: {
    className: 'border border-dashed bg-[#FAFAFA] web:bg-white',
    style: { borderColor: K.muted, color: K.variety },
    label: 'Add a photo for variety',
  },
  optional: {
    className: 'border border-dashed bg-white',
    style: { borderColor: K.stroke, color: K.muted },
    label: 'Add another photo',
  },
}

function EmptySlot({ tier, onAdd }: { tier: Tier; onAdd: () => void }) {
  const t = TIER_STYLE[tier]
  return (
    <button
      type="button"
      onClick={onAdd}
      aria-label={t.label}
      className={cn('flex aspect-square items-center justify-center rounded-lg transition-transform active:scale-[0.97]', t.className)}
      style={t.style}
    >
      <Plus size={22} strokeWidth={1.5} />
    </button>
  )
}

// ── Toast (Figma 385:3453) ────────────────────────────────────────────────────

const TOAST_MS = 3000

export function UploadToast({ toast, onDismiss, className = '' }: { toast: Toast | null; onDismiss: () => void; className?: string }) {
  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(onDismiss, TOAST_MS)
    return () => clearTimeout(t)
  }, [toast, onDismiss])

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          role="status"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'relative flex items-center justify-between gap-3 overflow-hidden rounded-lg border-[1.5px] bg-white py-2 pr-2 pl-3 shadow-[0_2px_16px_rgba(0,0,0,0.1)]',
            className,
          )}
          style={{ borderColor: K.stroke }}
        >
          <div className="flex items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-[4px] bg-[#FFF2F2]">
              <img src={`${A}/alert.svg`} alt="" width={17} height={17} />
            </span>
            <span className="text-[14px] leading-4" style={{ color: K.text }}>
              {toast.message}
            </span>
          </div>
          <button type="button" onClick={onDismiss} aria-label="Dismiss" className="rounded-md p-1 transition-opacity hover:opacity-70">
            <img src={`${A}/toast-close.svg`} alt="" width={16} height={16} />
          </button>
          <motion.span
            aria-hidden
            className="absolute bottom-0 left-0 h-[3px]"
            style={{ background: K.text }}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: TOAST_MS / 1000, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
