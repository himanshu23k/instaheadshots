import { thumbnailFor, type Hairstyle } from './hairstylist-data'

const LABEL_STYLE = { fontFamily: 'var(--font-greed)', fontWeight: 420, color: 'var(--color-text-primary)' }
const TILE_BORDER = '#E0E1E1'

/** 18px corner check box — Figma "Image state icon". */
function StateIcon({ selected, variant }: { selected: boolean; variant: 'web' | 'mobile' }) {
  // Web fills the box black when selected; mobile keeps it white with a black tick.
  const filled = selected && variant === 'web'
  return (
    <span
      className="absolute right-[5px] top-[5px] flex size-[18px] items-center justify-center overflow-hidden rounded-[4px]"
      style={{
        background: filled ? 'var(--color-button-primary-default)' : 'white',
        border: filled ? 'none' : `1px solid ${TILE_BORDER}`,
      }}
    >
      {selected && (
        <img src={variant === 'web' ? '/hairstylist/check-white.svg' : '/hairstylist/check-black.svg'} alt="" width={10} height={10} />
      )}
    </span>
  )
}

/** Desktop tile (Figma 8176:18721 / 18729): 163px square, darkened when selected. */
function WebTile({ style, selected, onSelect }: { style: Hairstyle; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className="group flex w-[163px] flex-col items-center gap-2 outline-none"
    >
      <span
        className="relative block size-[163px] overflow-hidden rounded-lg border border-[#E0E1E1] transition-[border-width] group-hover:border-[1.5px] group-focus-visible:ring-2 group-focus-visible:ring-[var(--color-border-neon-green)]"
        style={selected ? { borderWidth: 1.5 } : undefined}
      >
        <img src={thumbnailFor(style)} alt="" className="size-full object-cover" />
        {selected && <span className="absolute inset-0 bg-black/40" />}
        <StateIcon selected={selected} variant="web" />
      </span>
      <span className="w-full truncate text-center text-[12px] leading-[14px]" style={LABEL_STYLE}>
        {style.name}
      </span>
    </button>
  )
}

/** Mobile tile (Figma 2342:21263): 106px square, black ring when selected. */
function MobileTile({ style, selected, onSelect }: { style: Hairstyle; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className="flex w-[106px] shrink-0 flex-col items-center gap-3 outline-none"
    >
      <span
        className="relative block size-[106px] overflow-hidden rounded-lg"
        style={{ border: selected ? '1.4px solid var(--color-border-secondary)' : `1px solid ${TILE_BORDER}` }}
      >
        <img src={thumbnailFor(style)} alt="" className="size-full object-cover" />
        {selected && <span className="absolute inset-0 bg-black/20" />}
        <StateIcon selected={selected} variant="mobile" />
      </span>
      <span className="w-full truncate text-center text-[12px] leading-[14px]" style={LABEL_STYLE}>
        {style.name}
      </span>
    </button>
  )
}

/**
 * "Upload an example" — the first tile in both Figma layouts. Uploading a
 * reference isn't built yet, so this is presentational only.
 */
function UploadTile({ variant }: { variant: 'web' | 'mobile' }) {
  const web = variant === 'web'
  return (
    <div className={`flex shrink-0 flex-col items-center ${web ? 'w-[163px] gap-2' : 'w-[106px] gap-3'}`}>
      <span
        className={`flex items-center justify-center rounded-lg border border-dashed border-[#E0E1E1] ${web ? 'size-[163px]' : 'size-[106px]'}`}
      >
        <img src="/hairstylist/upload-example.png" alt="" className={web ? 'size-[116px]' : 'size-[96px]'} />
      </span>
      <span className="w-full truncate text-center text-[12px] leading-[14px]" style={LABEL_STYLE}>
        Upload an example
      </span>
    </div>
  )
}

export function StyleGrid({
  styles,
  selectedId,
  onSelect,
}: {
  styles: Hairstyle[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <>
      {/* Mobile (Figma 2342:21254): "Hairstyles" heading over a horizontal strip */}
      <div className="flex w-full flex-col gap-4 web:hidden">
        <p
          className="text-[20px] leading-[22px] tracking-[-0.2px]"
          style={{ fontFamily: 'var(--font-greed)', fontWeight: 450, color: 'var(--color-text-primary)' }}
        >
          Hairstyles
        </p>
        <div
          role="radiogroup"
          aria-label="Choose a hairstyle"
          className="scrollbar-hide -mx-6 flex gap-3 overflow-x-auto px-6"
        >
          <UploadTile variant="mobile" />
          {styles.map((s) => (
            <MobileTile key={s.id} style={s} selected={selectedId === s.id} onSelect={() => onSelect(s.id)} />
          ))}
        </div>
      </div>

      {/* Web (Figma 2342:21198): two columns of 163px tiles, 8px apart */}
      <div
        role="radiogroup"
        aria-label="Choose a hairstyle"
        className="hidden w-[334px] flex-wrap content-start gap-2 web:flex"
      >
        <UploadTile variant="web" />
        {styles.map((s) => (
          <WebTile key={s.id} style={s} selected={selectedId === s.id} onSelect={() => onSelect(s.id)} />
        ))}
      </div>
    </>
  )
}
