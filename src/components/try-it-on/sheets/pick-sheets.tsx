import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { VERSION, currentLook, useTryItOnStore, withPiece, type SheetRoute } from '@/store/try-it-on-store'
import {
  COLLECTION,
  COLLECTION_FILTERS,
  FIRST_SUGGESTIONS,
  SLOT_LABEL,
  UPLOAD_SAMPLES,
  V4_UPLOAD_SAMPLES,
  ZARA_TEDDY,
  classifyLink,
  framingHint,
  garmentById,
  type FoundItem,
  type Garment,
  type Slot,
  type UploadSample,
} from '../try-it-on-data'
import { Divider, SectionLabel, SheetFooter, SheetHeader, SheetScroll } from '../Sheet'
import { FolderIcon, GalleryIcon, GarmentImage, GarmentTile, LinkIcon, Notice, OptionRow, PrimaryButton, TextLink, TileCheck, WorkingPanel } from '../ui'
import { C, FONT } from '../tokens'

type Route<N extends SheetRoute['name']> = Extract<SheetRoute, { name: N }>

const byId = (id: string) => garmentById(id) as Garment

// ── Pick an outfit — Figma 370:45001 / 370:45070 ─────────────────────────────

export function PickSheet() {
  const pushSheet = useTryItOnStore((s) => s.pushSheet)
  const [selected, setSelected] = useState<string | null>(null)
  const suggestions = FIRST_SUGGESTIONS.map(byId)

  return (
    <>
      <SheetHeader title="Pick an outfit" back={false} />
      <SheetScroll>
        <Suggestions
          label="Suggested for you"
          garments={suggestions}
          selected={selected}
          onSelect={(id) => setSelected((s) => (s === id ? null : id))}
        />
        <BringYourOwn />
      </SheetScroll>
      <AnimatePresence initial={false}>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            <SheetFooter>
              <PrimaryButton onClick={() => pushSheet({ name: 'try', garments: [byId(selected)] })}>Continue</PrimaryButton>
            </SheetFooter>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Suggestions({
  label,
  garments,
  selected,
  onSelect,
}: {
  label: string
  garments: Garment[]
  selected: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <SectionLabel>{label}</SectionLabel>
      <div className="grid grid-cols-3 gap-3">
        {garments.map((g) => (
          <GarmentTile key={g.id} garment={g} selected={selected === g.id} onClick={() => onSelect(g.id)} />
        ))}
      </div>
    </div>
  )
}

/** "Or bring your own" — link, upload, collection. */
export function BringYourOwn({ slot }: { slot?: Slot }) {
  const pushSheet = useTryItOnStore((s) => s.pushSheet)
  return (
    <div className="flex flex-col gap-6">
      <SectionLabel>Or bring your own</SectionLabel>
      <div className="flex flex-col gap-5">
        <OptionRow
          icon={<LinkIcon />}
          title="Paste a product link"
          subtitle="From most online stores"
          onClick={() => pushSheet({ name: 'link', slot })}
        />
        <Divider />
        <OptionRow
          icon={<GalleryIcon />}
          title="Upload a photo"
          subtitle="A screenshot, a photo of the piece or someone wearing it"
          onClick={() => pushSheet({ name: 'upload', slot })}
        />
        <Divider />
        <OptionRow
          icon={<FolderIcon />}
          title="Browse our collection"
          subtitle="Curated pieces for work, weekends and events"
          // v6 browses in v4's collection sheet, tabbed by asset type; earlier versions in v1's list.
          onClick={() => pushSheet(VERSION === 6 ? { name: 'builder', tab: slot } : { name: 'collection', slot })}
        />
      </div>
    </div>
  )
}

// ── Try this on — Figma 370:45140, 370:51684, 370:58726 ──────────────────────

export function TrySheet({ route }: { route: Route<'try'> }) {
  const look = useTryItOnStore(currentLook)
  const tryOn = useTryItOnStore((s) => s.tryOn)
  const popSheet = useTryItOnStore((s) => s.popSheet)
  const { garments, product } = route
  const [photo, setPhoto] = useState(product?.photos[0].id)
  const [hintOpen, setHintOpen] = useState(true)
  const hint = framingHint(look.pieces, garments)

  const shown = product
    ? {
        ...garments[0],
        image: product.photos.find((p) => p.id === photo)?.image ?? garments[0].image,
        crop: undefined,
        found: undefined,
      }
    : garments[0]
  const caption = product
    ? product.title
    : route.fromUpload
      ? 'We found this outfit from upload'
      : garments.map((g) => g.name).join(' + ')

  return (
    <>
      <SheetHeader title="Try this on" credits />
      <SheetScroll className="pt-5">
        <div className="flex flex-col items-center gap-4">
          <div
            className="relative h-[242px] w-[228px] overflow-hidden rounded-[12px]"
            style={{ boxShadow: '0 2px 18px rgba(0,0,0,0.04)' }}
          >
            {garments.length > 1 && !product ? (
              <div className="grid size-full grid-cols-2">
                {garments.map((g) => (
                  <GarmentImage key={g.id} garment={g} className="size-full" />
                ))}
              </div>
            ) : (
              <GarmentImage garment={shown} className="absolute inset-0" />
            )}
            {product && (
              <span
                className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[12px] leading-[14px] backdrop-blur"
                style={{ fontWeight: 450, color: C.text }}
              >
                {product.store}
              </span>
            )}
          </div>
          <p className="text-center text-[16px] leading-[18px]" style={{ fontWeight: 420, color: C.text }}>
            {caption}
          </p>
        </div>

        {product && (
          <>
            <Divider />
            <div className="flex flex-col gap-4">
              <p className="text-[14px] leading-[16px]" style={{ color: C.secondary }}>
                Pick the clearest photo of it
              </p>
              <div className="grid grid-cols-3 gap-3">
                {product.photos.map((p) => {
                  const on = p.id === photo
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPhoto(p.id)}
                      aria-pressed={on}
                      className="relative h-[120px] overflow-hidden rounded-[8px] bg-white"
                      style={{ boxShadow: on ? `0 0 0 1.4px ${C.text}` : '0 2px 18px rgba(0,0,0,0.06)' }}
                    >
                      <img src={p.image} alt="" className="absolute inset-0 size-full object-cover" />
                      <span className="absolute inset-x-0 bottom-0 h-[40px] bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute bottom-2 left-2 text-[12px] leading-[14px] text-white" style={{ fontWeight: 450 }}>
                        {p.label}
                      </span>
                      <TileCheck on={on} className="right-[3px] top-[3px]" />
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </SheetScroll>
      <SheetFooter>
        <AnimatePresence>
          {hint && hintOpen && (
            <Notice onClose={() => setHintOpen(false)} duration={8000}>
              {hint}
            </Notice>
          )}
        </AnimatePresence>
        <PrimaryButton
          cost={1}
          onClick={() => tryOn(garments.reduce((pieces, g) => withPiece(pieces, g), look.pieces))}
        >
          Try It On
        </PrimaryButton>
        <TextLink onClick={popSheet}>Choose Something Else</TextLink>
      </SheetFooter>
    </>
  )
}

// ── Paste a product link — Figma 370:51709 → 370:51761, 370:56843, 370:56872 ─

type LinkState = 'idle' | 'reading' | 'invalid' | 'blocked'

/** Link field with the inline Paste button, used here and on a builder slot. */
export function LinkField({
  value,
  onChange,
  onSubmit,
  compact = false,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: (v: string) => void
  compact?: boolean
}) {
  const paste = async () => {
    let text = ''
    try {
      text = await navigator.clipboard.readText()
    } catch {
      // Clipboard needs permission; fall back to the sample product so the flow is still walkable.
    }
    const url = text.trim() || 'https://zara.com/teddy-jacket'
    onChange(url)
    onSubmit(url)
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (value.trim()) onSubmit(value)
      }}
      className={cn('flex items-center gap-2 rounded-[8px] bg-white pl-3 pr-2', compact ? 'h-12' : 'h-[52px]')}
      style={{ boxShadow: `0 0 0 1px ${C.grey12}, 0 2px 8px rgba(0,0,0,0.04)` }}
    >
      {compact && (
        <span className="shrink-0" style={{ color: C.secondary }}>
          <LinkIcon />
        </span>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={(e) => {
          const text = e.clipboardData.getData('text')
          if (text) {
            e.preventDefault()
            onChange(text)
            onSubmit(text)
          }
        }}
        inputMode="url"
        placeholder={compact ? 'Paste a product link' : 'https://store/product'}
        aria-label="Product link"
        className="min-w-0 flex-1 bg-transparent text-[16px] leading-[18px] outline-none placeholder:text-[#9A9B9D]"
        style={{ ...FONT, color: C.text }}
      />
      <button
        type="button"
        onClick={paste}
        className="shrink-0 rounded-[6px] px-3 py-2 text-[14px] leading-[16px] transition-colors hover:bg-[#EEEEF0]"
        style={{ background: C.grey03, color: C.text, fontWeight: 450 }}
      >
        Paste
      </button>
    </form>
  )
}

export function LinkSheet({ route }: { route: Route<'link'> }) {
  const replaceSheet = useTryItOnStore((s) => s.replaceSheet)
  const popSheet = useTryItOnStore((s) => s.popSheet)
  const [url, setUrl] = useState(route.url ?? '')
  const [state, setState] = useState<LinkState>('idle')
  const timer = useRef<number>(undefined)

  const submit = (value: string) => {
    window.clearTimeout(timer.current)
    setState('reading')
    timer.current = window.setTimeout(() => {
      const verdict = classifyLink(value)
      if (verdict !== 'ok') return setState(verdict)
      const items = ZARA_TEDDY.items
      // From a builder slot, or Create Look's "Add Product": pick pieces into the builder.
      if (route.slot || route.toBuilder) {
        replaceSheet({ name: 'found', slot: route.slot, image: ZARA_TEDDY.photos[0].image, items, title: 'Items found' })
      } else {
        replaceSheet({ name: 'try', garments: [items[0]], product: ZARA_TEDDY })
      }
    }, 1600)
  }

  useEffect(() => {
    if (route.url) submit(route.url)
    return () => window.clearTimeout(timer.current)
    // Run once for a link handed over from a builder slot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <SheetHeader title="Paste a product link" />
      <SheetScroll>
        {state === 'reading' ? (
          <WorkingPanel title="Reading the page" subtitle={url} />
        ) : (
          <div className="flex flex-col rounded-[12px]" style={{ background: C.grey03 }}>
            <LinkField
              value={url}
              onChange={(v) => {
                setUrl(v)
                if (state !== 'idle') setState('idle')
              }}
              onSubmit={submit}
            />
            <p className="px-3 pb-3 pt-3 text-[14px] leading-[16px]" style={{ color: C.secondary }}>
              We pull the piece off the page. Nothing gets added to your cart.
            </p>
          </div>
        )}
      </SheetScroll>
      <SheetFooter>
        <AnimatePresence mode="popLayout">
          {state === 'invalid' && (
            <Notice key="invalid" tone="error" onClose={() => setState('idle')}>
              Please check the pasted link. Seems to be invalid
            </Notice>
          )}
          {state === 'blocked' && (
            <Notice key="blocked" tone="error" onClose={() => setState('idle')} duration={null}>
              We couldn't read that page. Some stores block this. Take a screenshot of the product and upload it
              instead
            </Notice>
          )}
        </AnimatePresence>
        {state === 'blocked' && (
          <button
            type="button"
            onClick={() => replaceSheet({ name: 'upload', slot: route.slot, toBuilder: route.toBuilder })}
            className="h-[45px] w-full rounded-[8px] text-[16px] leading-[18px] transition-colors hover:bg-[#EEEEF0]"
            style={{ background: C.grey03, color: C.text, fontWeight: 450 }}
          >
            Upload a Screenshot
          </button>
        )}
        {state !== 'reading' && <TextLink onClick={popSheet}>Choose Something Else</TextLink>}
      </SheetFooter>
    </>
  )
}

// ── Upload a photo — Figma 370:58697 → 370:58777, 370:65202–65268 ────────────

type UploadError = 'unknown' | 'size' | 'failed'
const UPLOAD_ERRORS: Record<UploadError, string> = {
  unknown: "Couldn't identify the outfit in uploaded image.",
  size: 'Max image size is 20MB',
  failed: 'Failed to upload the image.',
}
const MAX_UPLOAD = 20 * 1024 * 1024

/** Dashed drop zone — tap opens the camera roll; files can be dropped on desktop. */
export function DropZone({
  title,
  subtitle,
  onFile,
  className,
}: {
  title: string
  subtitle: string
  onFile: (file: File) => void
  className?: string
}) {
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  return (
    <button
      type="button"
      onClick={() => input.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        const f = e.dataTransfer.files[0]
        if (f) onFile(f)
      }}
      className={cn(
        'flex w-full flex-col items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-dashed px-4 py-6 text-center transition-colors',
        className,
      )}
      style={{ borderColor: over ? C.text : '#D9DADB', background: over ? '#F0F0F2' : C.grey03 }}
    >
      <span className="mb-2 flex size-9 items-center justify-center rounded-full bg-white" aria-hidden>
        <Upload size={16} strokeWidth={1.6} color={C.text} />
      </span>
      <span className="text-[16px] leading-[18px]" style={{ fontWeight: 420, color: C.text }}>
        {title}
      </span>
      <span className="text-[12px] leading-[14px]" style={{ color: C.secondary }}>
        {subtitle}
      </span>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
          e.target.value = ''
        }}
      />
    </button>
  )
}

/** v4 seeds its own photos (Figma 3380:166586 "Uploads/Product Links"). */
const SAMPLES = VERSION >= 4 ? V4_UPLOAD_SAMPLES : UPLOAD_SAMPLES

export function UploadSheet({ route }: { route: Route<'upload'> }) {
  const replaceSheet = useTryItOnStore((s) => s.replaceSheet)
  const popSheet = useTryItOnStore((s) => s.popSheet)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<UploadError | null>(null)
  const timer = useRef<number>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  /** Carry on with what we "found" in the photo. */
  const proceed = (sample: UploadSample, image: string) => {
    const items: FoundItem[] = sample.items.map((it) => ({ ...it, image }))
    if (route.slot) {
      const hasSlot = items.some((it) => it.slot === route.slot)
      replaceSheet(
        hasSlot
          ? { name: 'found', slot: route.slot, image, items, title: 'Items found' }
          : { name: 'not-found', slot: route.slot, image },
      )
    } else if (route.toBuilder) {
      replaceSheet({ name: 'found', image, items, title: 'Items found' })
    } else if (items.length > 1) {
      replaceSheet({ name: 'upload-pieces', sample, image })
    } else {
      replaceSheet({ name: 'try', garments: [items[0]], fromUpload: true })
    }
  }

  const start = (sample: UploadSample, image: string) => {
    setError(null)
    setBusy(true)
    timer.current = window.setTimeout(() => proceed(sample, image), 1800)
  }

  const onFile = (file: File) => {
    if (!file.type.startsWith('image/')) return setError('unknown')
    if (file.size > MAX_UPLOAD) return setError('size')
    if (new URLSearchParams(window.location.search).get('upload') === 'fail') return setError('failed')
    // We can't read pieces out of a real photo yet, so it's treated like the street sample.
    start(SAMPLES[0], URL.createObjectURL(file))
  }

  return (
    <>
      <SheetHeader title="Upload a photo" />
      <SheetScroll>
        {busy ? (
          <WorkingPanel title="Finding the output" subtitle="Usually takes sometime" />
        ) : (
          <>
            <div className="flex flex-col rounded-[12px]" style={{ background: C.grey03 }}>
              <DropZone
                title={route.slot ? `Upload a photo of the ${SLOT_LABEL[route.slot].toLowerCase()}` : 'Upload a photo of the piece'}
                subtitle="A screenshot works. So do photos of someone wearing it"
                onFile={onFile}
              />
              <p className="px-3 py-3 text-[14px] leading-[16px]" style={{ color: C.secondary }}>
                We pull the piece off the page. Nothing gets added to your cart.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[14px] leading-[16px]" style={{ color: C.secondary }}>
                No photo handy? Try one of these
              </p>
              <div className="flex gap-3">
                {SAMPLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => start(s, s.image)}
                    className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-[#EEEEF0]"
                    style={{ background: C.grey03 }}
                  >
                    <img src={s.image} alt="" className="size-7 rounded-full object-cover" />
                    <span className="text-[14px] leading-[16px]" style={{ fontWeight: 450, color: C.text }}>
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </SheetScroll>
      {!busy && (
        <SheetFooter>
          <AnimatePresence>
            {error && (
              <Notice tone="error" onClose={() => setError(null)}>
                {UPLOAD_ERRORS[error]}
              </Notice>
            )}
          </AnimatePresence>
          {error && <TextLink onClick={popSheet}>Choose Something Else</TextLink>}
        </SheetFooter>
      )}
    </>
  )
}

const unionBox = (a: FoundItem['found'], b: FoundItem['found']) => {
  const x = Math.min(a.x, b.x)
  const y = Math.min(a.y, b.y)
  return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y }
}

/** Two pieces in one photo — Figma 370:65459. */
export function UploadPiecesSheet({ route }: { route: Route<'upload-pieces'> }) {
  const replaceSheet = useTryItOnStore((s) => s.replaceSheet)
  const items = route.sample.items.map((it) => ({ ...it, image: route.image }))
  const [top, bottom] = items
  const options = [
    { id: 'top', label: 'Topwear', garments: [top], tile: top },
    { id: 'bottom', label: 'Bottomwear', garments: [bottom], tile: bottom },
    { id: 'both', label: 'Both', garments: [top, bottom], tile: { ...top, found: unionBox(top.found, bottom.found) } },
  ]
  const [picked, setPicked] = useState('bottom')
  const choice = options.find((o) => o.id === picked)!

  return (
    <>
      <SheetHeader title="Upload a photo" subtitle="We spotted two pieces. Which one do you wish to try on?" />
      <SheetScroll className="pt-5">
        <div className="grid grid-cols-3 gap-3">
          {options.map((o) => (
            <GarmentTile
              key={o.id}
              garment={{ ...o.tile, look: 'product' }}
              label={o.label}
              selected={picked === o.id}
              onClick={() => setPicked(o.id)}
            />
          ))}
        </div>
      </SheetScroll>
      <SheetFooter>
        <PrimaryButton onClick={() => replaceSheet({ name: 'try', garments: choice.garments, fromUpload: true })}>
          Continue
        </PrimaryButton>
      </SheetFooter>
    </>
  )
}

// ── Browse our collection — Figma 370:70760 ──────────────────────────────────

export function CollectionSheet({ route }: { route: Route<'collection'> }) {
  const pushSheet = useTryItOnStore((s) => s.pushSheet)
  const setDraftPiece = useTryItOnStore((s) => s.setDraftPiece)
  const returnToBuilder = useTryItOnStore((s) => s.returnToBuilder)
  const setBuilderNotice = useTryItOnStore((s) => s.setBuilderNotice)
  const [filter, setFilter] = useState<(typeof COLLECTION_FILTERS)[number]['id']>('all')
  const [selected, setSelected] = useState<string | null>(null)

  const items = useMemo(() => {
    const all = COLLECTION.map(byId).filter((g) => !route.slot || g.slot === route.slot)
    return filter === 'all' ? all : all.filter((g) => g.tags?.includes(filter))
  }, [filter, route.slot])

  const confirm = () => selected && pushSheet({ name: 'try', garments: [byId(selected)] })

  // Filling a builder slot, a tap adds the piece straight away (after a beat to show it picked).
  const tap = (id: string) => {
    if (!route.slot) return setSelected((s) => (s === id ? null : id))
    if (selected) return
    setSelected(id)
    window.setTimeout(() => {
      const g = byId(id)
      setDraftPiece(g)
      setBuilderNotice(`${g.name} added`)
      returnToBuilder()
    }, 220)
  }

  return (
    <>
      <SheetHeader title={route.slot ? `All ${SLOT_LABEL[route.slot].toLowerCase()}` : 'Browse our collection'} credits />
      <div className="scrollbar-hide -mb-1 flex shrink-0 gap-2 overflow-x-auto px-6 pt-6">
        {COLLECTION_FILTERS.map((f) => {
          const on = f.id === filter
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={on}
              className="shrink-0 rounded-full px-4 py-2 text-[14px] leading-[16px] transition-colors"
              style={{
                fontWeight: 420,
                color: C.text,
                background: on ? '#FFFFFF' : C.grey03,
                boxShadow: on ? `inset 0 0 0 1px ${C.text}` : 'none',
              }}
            >
              {f.label}
            </button>
          )
        })}
      </div>
      <SheetScroll className="pt-5">
        {items.length === 0 ? (
          <p className="py-[40px] text-center text-[14px]" style={{ color: C.secondary }}>
            Nothing here yet. Try another filter.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {items.map((g) => (
              <GarmentTile
                key={g.id}
                garment={g}
                height={163}
                selected={selected === g.id}
                onClick={() => tap(g.id)}
              />
            ))}
          </div>
        )}
      </SheetScroll>
      {!route.slot && (
        <SheetFooter shadow>
          <PrimaryButton disabled={!selected} onClick={confirm}>
            Continue
          </PrimaryButton>
        </SheetFooter>
      )}
    </>
  )
}
