import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Check, Info, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FoundItem, Garment } from './try-it-on-data'
import { C, FONT } from './tokens'

// ── Icons drawn from the Figma frames (lucide covers the rest) ───────────────

export function CreditsIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6.4" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M7.68592 5.64763L5.64782 7.68573C5.47425 7.8593 5.47425 8.1407 5.64782 8.31427L7.68592 10.3524C7.85949 10.5259 8.1409 10.5259 8.31446 10.3524L10.3526 8.31427C10.5261 8.1407 10.5261 7.8593 10.3526 7.68573L8.31446 5.64763C8.1409 5.47406 7.85949 5.47406 7.68592 5.64763Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function EditIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M9.37511 3.93056L12.0693 6.62478" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M2.44444 13.5553C2.44444 13.5553 5.64356 13.0504 6.48533 12.2087C7.32711 11.3669 12.9982 5.69578 12.9982 5.69578C13.7422 4.95178 13.7422 3.74556 12.9982 3.00244C12.2542 2.25844 11.048 2.25844 10.3049 3.00244C10.3049 3.00244 4.63378 8.67356 3.792 9.51533C2.95022 10.3571 2.44533 13.5562 2.44533 13.5562L2.44444 13.5553Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M8.36909 6.8934C8.06649 7.0539 7.78239 7.2617 7.52799 7.517L7.51799 7.527C6.13699 8.908 6.13699 11.146 7.51799 12.527L9.69299 14.702C11.074 16.083 13.312 16.083 14.693 14.702L14.703 14.692C16.084 13.311 16.084 11.073 14.703 9.692L13.9406 8.9296" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.63289 11.1066C9.93549 10.9461 10.2196 10.7383 10.474 10.483L10.484 10.473C11.865 9.09199 11.865 6.85399 10.484 5.47299L8.30899 3.29799C6.92799 1.91699 4.68999 1.91699 3.30899 3.29799L3.29899 3.30799C1.91799 4.68899 1.91799 6.92699 3.29899 8.30799L4.06139 9.07039" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function GalleryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M6.60212 15.6421L11.7071 10.5431C12.0981 10.1521 12.7311 10.1521 13.1211 10.5431L15.7511 13.1731" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.50103 9.50015C7.95003 9.50015 7.50103 9.05115 7.50103 8.50015C7.50103 7.94915 7.95003 7.50015 8.50103 7.50015C9.05203 7.50015 9.50103 7.94915 9.50103 8.50015C9.50103 9.05115 9.05203 9.50015 8.50103 9.50015Z" fill="currentColor" />
      <path d="M14.1818 5.25015H7.09089C5.88544 5.25015 4.90908 6.14515 4.90908 7.25015V13.7501C4.90908 14.8551 5.88544 15.7501 7.09089 15.7501H14.1818C15.3873 15.7501 16.3636 14.8551 16.3636 13.7501V7.25015C16.3636 6.14515 15.3873 5.25015 14.1818 5.25015Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.401 2.74993C12.002 2.06143 11.2149 1.64833 10.3798 1.77283L3.45575 2.80193C2.36375 2.96383 1.60975 3.98093 1.77175 5.07393L2.74975 11.6547" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function FolderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M12.25 1.25H5.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.2501 4.24995H3.75007" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.06595 7.2501H14.934C15.595 7.2501 16.075 7.8801 15.898 8.5181L13.954 15.5181C13.834 15.9511 13.44 16.2501 12.99 16.2501H5.00995C4.56095 16.2501 4.16695 15.9501 4.04595 15.5181L2.10195 8.5181C1.92495 7.8811 2.40395 7.2501 3.06595 7.2501Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Credits readout ──────────────────────────────────────────────────────────

export function Credits({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2 p-1.5" style={{ color: C.text }}>
      <CreditsIcon />
      <motion.span
        key={value}
        initial={{ y: -6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-0.5 text-[16px] leading-[18px]"
        style={{ ...FONT, fontWeight: 450 }}
      >
        {value}
      </motion.span>
      <span className="sr-only">credits</span>
    </div>
  )
}

// ── Buttons ──────────────────────────────────────────────────────────────────

/** Figma "Primary button": 45 tall, radius 8, #000409 with a soft inner highlight. */
export function PrimaryButton({
  children,
  onClick,
  disabled,
  cost,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  /** Renders the "| ◎ 1" credit cost after the label. */
  cost?: number
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative flex h-[45px] w-full shrink-0 items-center justify-center gap-2 overflow-hidden rounded-[8px] px-6 text-white transition-[background-color,transform] duration-150 active:scale-[0.98] disabled:active:scale-100',
        className,
      )}
      style={{
        ...FONT,
        background: disabled ? '#9A9B9D' : C.text,
        border: `1px solid ${disabled ? '#9A9B9D' : C.text}`,
        boxShadow: 'inset 0 2px 2px rgba(255,255,255,0.25)',
      }}
    >
      <span className="px-0.5 text-[16px] leading-[18px]" style={{ fontWeight: 450 }}>
        {children}
      </span>
      {cost != null && (
        <>
          <span className="h-4 w-px bg-white/40" aria-hidden />
          <span className="flex items-center gap-1.5 text-[16px] leading-[18px]" style={{ fontWeight: 450 }}>
            <CreditsIcon />
            {cost}
            <span className="sr-only">credit</span>
          </span>
        </>
      )}
    </button>
  )
}

export function TextLink({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-auto shrink-0 text-[16px] leading-[18px] underline decoration-1 underline-offset-[3px] transition-opacity hover:opacity-70"
      style={{ ...FONT, fontWeight: 450, color: C.text }}
    >
      {children}
    </button>
  )
}

export function Spinner({ size = 14, className }: { size?: number; className?: string }) {
  return <Loader2 size={size} strokeWidth={1.8} className={cn('animate-spin', className)} aria-hidden />
}

// ── Garment imagery ──────────────────────────────────────────────────────────

/**
 * A garment on its tile: mannequins on #F0F0F0, product shots on white. Pieces
 * found in a bigger photo are cropped to their detection box — the box spans
 * the tile's width and sits centred vertically.
 */
export function GarmentImage({
  garment,
  className,
  background,
}: {
  garment: Garment
  className?: string
  /** Overrides the tile colour (Create Look sits everything on white). */
  background?: string
}) {
  const { crop } = garment
  const box = (garment as Partial<FoundItem>).found
  let style: React.CSSProperties | undefined
  if (box) {
    style = {
      position: 'absolute',
      maxWidth: 'none',
      width: `${10000 / box.w}%`,
      left: `${(-box.x * 100) / box.w}%`,
      top: '50%',
      transform: `translateY(-${box.y + box.h / 2}%)`,
    }
  } else if (crop) {
    style = { objectPosition: crop.position, transform: `scale(${crop.scale})`, transformOrigin: crop.position }
  }
  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ background: background ?? (garment.look === 'mannequin' ? C.tile : '#FFFFFF') }}
    >
      <img
        src={garment.image}
        alt=""
        draggable={false}
        className={box ? 'h-auto' : cn('absolute inset-0 size-full', crop || garment.fill ? 'object-cover' : 'object-contain')}
        style={style}
      />
    </div>
  )
}

/** Checkbox in a tile's corner — Figma "Image state icon". */
export function TileCheck({ on, className }: { on: boolean; className?: string }) {
  return (
    <span
      className={cn('absolute flex size-[18px] items-center justify-center rounded-[4px] bg-white', className)}
      style={{ boxShadow: on ? 'none' : 'inset 0 0 0 1px rgba(0,4,9,0.08)' }}
      aria-hidden
    >
      {on && <Check size={11} strokeWidth={2.2} color={C.text} />}
    </span>
  )
}

/** Product tile with a label under it — the "Suggested for you" row. */
export function GarmentTile({
  garment,
  selected,
  onClick,
  height = 124,
  label = garment.name,
}: {
  garment: Garment
  selected: boolean
  onClick: () => void
  height?: number
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="flex min-w-0 flex-col items-center gap-2 text-left"
    >
      <div
        className="relative w-full overflow-hidden rounded-[8px] transition-[box-shadow] duration-150"
        style={{
          height,
          boxShadow: selected
            ? `0 0 0 1.4px ${C.text}, 0 2px 18px rgba(0,0,0,0.04)`
            : '0 0 0 1px #FFFFFF, 0 2px 18px rgba(0,0,0,0.04)',
        }}
      >
        <GarmentImage garment={garment} className="absolute inset-0" />
        <div
          className="absolute inset-0 transition-opacity duration-150"
          style={{ background: 'rgba(0,0,0,0.2)', opacity: selected ? 1 : 0 }}
        />
        <TileCheck on={selected} className="right-[3px] top-[3px]" />
      </div>
      <p
        className="w-full truncate text-center text-[12px] leading-[14px]"
        style={{ ...FONT, fontWeight: 450, color: C.text }}
      >
        {label}
      </p>
    </button>
  )
}

// ── Rows ─────────────────────────────────────────────────────────────────────

/** Figma "Email Item": icon chip, title + subtitle, chevron. */
export function OptionRow({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className="group flex w-full items-center justify-between gap-3 text-left">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          className="flex shrink-0 items-center justify-center rounded-full p-2"
          style={{ background: C.grey03, color: C.text }}
        >
          {icon}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1" style={FONT}>
          <span className="text-[18px] leading-[20px] tracking-[-0.09px]" style={{ fontWeight: 420, color: C.text }}>
            {title}
          </span>
          <span className="text-[16px] leading-[18px]" style={{ fontWeight: 420, color: C.secondaryAlt }}>
            {subtitle}
          </span>
        </span>
      </div>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
        aria-hidden
      >
        <path d="M8.09 4.79L13.3 10L8.09 15.21" stroke={C.text} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

// ── Toasts ───────────────────────────────────────────────────────────────────

/**
 * The inline notice used across the Figma frames: white card, info/error dot,
 * text, ✕, and a black bar along the bottom that runs down while it's shown.
 */
export function Notice({
  tone = 'info',
  children,
  onClose,
  duration = 5000,
  action,
}: {
  tone?: 'info' | 'error' | 'success'
  children: React.ReactNode
  onClose?: () => void
  duration?: number | null
  action?: React.ReactNode
}) {
  const [running, setRunning] = useState(false)
  // Callers pass inline handlers; reading through a ref keeps the timer from restarting.
  const close = useRef(onClose)
  useEffect(() => {
    close.current = onClose
  })
  useEffect(() => {
    const r = requestAnimationFrame(() => setRunning(true))
    if (!duration) return () => cancelAnimationFrame(r)
    const t = window.setTimeout(() => close.current?.(), duration)
    return () => {
      cancelAnimationFrame(r)
      window.clearTimeout(t)
    }
  }, [duration])

  return (
    <motion.div
      role={tone === 'error' ? 'alert' : 'status'}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className="relative flex w-full shrink-0 items-center gap-3 overflow-hidden rounded-[8px] bg-white px-3 py-2.5"
      style={{ boxShadow: '0 0 0 1px rgba(0,4,9,0.06), 0 2px 12px rgba(0,0,0,0.08)' }}
    >
      <span
        className="flex size-4 shrink-0 items-center justify-center rounded-full"
        style={{ background: tone === 'error' ? C.error : C.text }}
        aria-hidden
      >
        {tone === 'error' ? (
          <span className="text-[11px] font-bold leading-none text-white">!</span>
        ) : tone === 'success' ? (
          <Check size={11} strokeWidth={3} color="#fff" />
        ) : (
          <Info size={12} strokeWidth={2.4} color="#fff" />
        )}
      </span>
      <div className="min-w-0 flex-1 text-[14px] leading-[16px]" style={{ ...FONT, fontWeight: 420, color: C.text }}>
        {children}
      </div>
      {action}
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Dismiss" className="shrink-0 p-0.5 hover:opacity-70">
          <X size={16} strokeWidth={1.6} color={C.text} />
        </button>
      )}
      {duration != null && (
        <span
          className="absolute bottom-0 left-0 h-[2px]"
          style={{
            background: C.text,
            width: running ? '0%' : '100%',
            transition: `width ${duration}ms linear`,
          }}
          aria-hidden
        />
      )}
    </motion.div>
  )
}

/** Small spinner panel — "Reading the page", "Finding the output". */
export function WorkingPanel({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div
      className="flex w-full flex-col items-center gap-2 rounded-[12px] px-4 py-5 text-center"
      style={{ ...FONT, background: C.grey03 }}
    >
      <Spinner size={22} className="text-[#000409]/70" />
      <p className="mt-1 text-[16px] leading-[18px]" style={{ fontWeight: 420, color: C.text }}>
        {title}
      </p>
      {subtitle && (
        <p className="max-w-full truncate text-[14px] leading-[16px]" style={{ color: C.secondary }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
