import { useEffect, useRef, useState } from 'react'
import { HAIR_COLORS, colorLabel, titleCase, type ColorId } from './hairstylist-data'

const FONT = { fontFamily: 'var(--font-greed)' }

/** "Texture ........ Straight" — the section label carries the current value instead of a subtitle. */
function SectionHeader({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <p className="text-[14px] leading-4" style={{ ...FONT, fontWeight: 450, color: 'var(--color-text-primary)' }}>
        {title}
      </p>
      <p className="truncate text-[14px] leading-4" style={{ ...FONT, fontWeight: 420, color: 'var(--color-text-secondary)' }}>
        {value}
      </p>
    </div>
  )
}

/**
 * Even columns so a row never strands one option: up to three share a row,
 * four split 2x2, and anything longer runs three across.
 */
function columnsFor(count: number): number {
  if (count <= 3) return count
  return count === 4 ? 2 : 3
}

/** One axis (sides / texture / length) as an even grid of options. */
export function AxisSection<T extends string>({
  title,
  values,
  selected,
  onSelect,
}: {
  title: string
  values: T[]
  selected: T | undefined
  onSelect: (v: T) => void
}) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <SectionHeader title={title} value={selected ? titleCase(selected) : ''} />
      <div
        role="radiogroup"
        aria-label={title}
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columnsFor(values.length)}, minmax(0, 1fr))` }}
      >
        {values.map((v) => {
          const on = selected === v
          return (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onSelect(v)}
              className="h-[40px] truncate rounded-lg px-2 text-[14px] leading-4 transition-[border-color,background-color] outline-none hover:bg-[#F7F7F8] focus-visible:ring-2 focus-visible:ring-[var(--color-border-neon-green)]"
              style={{
                ...FONT,
                fontWeight: on ? 450 : 420,
                color: 'var(--color-text-primary)',
                border: on ? '1.5px solid var(--color-border-secondary)' : '1px solid var(--color-border-primary)',
                background: on ? 'white' : undefined,
              }}
            >
              {titleCase(v)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const colorValueLabel = (id: ColorId) => (id === 'natural' ? 'Natural (unchanged)' : colorLabel(id))

/** A filled shade circle. "Natural" means leave it alone, so it gets a slash rather than a shade. */
function Swatch({ id, className = '' }: { id: ColorId; className?: string }) {
  const swatch = HAIR_COLORS.find((c) => c.id === id)?.swatch
  return (
    <span
      aria-hidden
      className={`relative block rounded-full ${className}`}
      style={{ background: swatch, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)' }}
    >
      {id === 'natural' && (
        <span className="absolute left-1/2 top-1/2 h-px w-3/5 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[#999B9D]" />
      )}
    </span>
  )
}

function SwatchGrid({ selected, onSelect }: { selected: ColorId; onSelect: (v: ColorId) => void }) {
  return (
    <div role="radiogroup" aria-label="Hair Color" className="grid grid-cols-7 gap-2">
      {HAIR_COLORS.map((c) => {
        const on = selected === c.id
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={c.label}
            title={c.label}
            onClick={() => onSelect(c.id)}
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-neon-green)]"
            style={{ boxShadow: on ? '0 0 0 2px white, 0 0 0 3.5px var(--color-border-secondary)' : undefined }}
          >
            <Swatch id={c.id} className="aspect-square w-full" />
          </button>
        )
      })}
    </div>
  )
}

export function ColorSection({ selected, onSelect }: { selected: ColorId; onSelect: (v: ColorId) => void }) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <SectionHeader title="Hair Color" value={colorValueLabel(selected)} />
      <SwatchGrid selected={selected} onSelect={onSelect} />
    </div>
  )
}

/**
 * V2's color chip: just the shade, no text. A native <select> can't draw
 * swatches, so this opens a small swatch popover above the dock instead.
 */
export function ColorPill({ value, onChange }: { value: ColorId; onChange: (v: ColorId) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-label={`Hair color: ${colorLabel(value)}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex size-[35px] items-center justify-center rounded-full border border-[#F0F0F0] bg-white transition-colors hover:border-[#E0E1E1]"
      >
        <Swatch id={value} className="size-[21px]" />
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Hair color"
          className="absolute bottom-full left-0 z-10 mb-2 flex w-[280px] flex-col gap-3 rounded-xl border border-[#E0E1E1] bg-white p-3"
          style={{ boxShadow: '0px 8px 24px rgba(0,0,0,0.12)' }}
        >
          <SectionHeader title="Hair Color" value={colorValueLabel(value)} />
          <SwatchGrid
            selected={value}
            onSelect={(id) => {
              onChange(id)
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

/**
 * Figma's "Color: Black" / "Texture: Straight" chips (2376:21531): 35px,
 * fully rounded. A native <select> sits invisibly over each so it opens the
 * platform picker without a custom popover.
 */
export function PillSelect<T extends string>({
  label,
  value,
  options,
  getLabel,
  onChange,
}: {
  label: string
  value: T
  options: T[]
  getLabel: (v: T) => string
  onChange: (v: T) => void
}) {
  return (
    // flex-auto, not flex-1: pills size to their text first and share out the slack,
    // so three fit a row without truncating and a fourth (men's sides) wraps.
    <label className="relative flex h-[35px] flex-auto cursor-pointer items-center justify-center rounded-full border border-[#F0F0F0] bg-white px-2.5 transition-colors hover:border-[#E0E1E1]">
      <span className="whitespace-nowrap text-[12px] leading-[14px]" style={{ ...FONT, fontWeight: 450, color: 'black' }}>
        {label}: {getLabel(value)}
      </span>
      <select
        aria-label={label}
        className="absolute inset-0 cursor-pointer opacity-0"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {getLabel(o)}
          </option>
        ))}
      </select>
    </label>
  )
}

/** "Create | ◇ 1" — Figma CTA I2376:21537 with its credit cost. */
export function CreateLabel({ cost = 1 }: { cost?: number }) {
  return (
    <span className="flex items-center gap-3.5">
      Create
      <span aria-hidden className="h-4 w-px bg-white/70" />
      <span className="flex items-center gap-2">
        <img src="/hairstylist/credits-white.svg" alt="" width={16} height={16} />
        {cost}
        <span className="sr-only">credit</span>
      </span>
    </span>
  )
}
