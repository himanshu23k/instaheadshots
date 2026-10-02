import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ChevronRight, Lock, LockOpen, Sparkles, X } from 'lucide-react'
import { currentLook, useTryItOnStore, withBase } from '@/store/try-it-on-store'
import { SLOT_LABEL, type Garment, type Slot } from './try-it-on-data'
import { Credits, CreditsIcon, GarmentImage, Notice } from './ui'
import { LinkField } from './sheets/pick-sheets'
import { C, FONT } from './tokens'

const EASE = [0.32, 0.72, 0, 1] as const
const LINE = '#EFEFEF'

// ── Ghost silhouettes for empty slots ────────────────────────────────────────

/** Soft white stand-ins for an empty slot, drawn so they read as "put something here". */
function GhostArt({ kind }: { kind: Slot }) {
  const shapes: Partial<Record<Slot, React.ReactNode>> = {
    top: <path d="M62 44 86 33q14 14 28 0l24 11 32 30-20 22-12-9v83H66V87l-12 9-20-22Z" />,
    bottom: <path d="M66 28h68l12 150h-36l-10-104-10 104H54Z" />,
    shoes: (
      <path d="M62 34h44v88q24 6 46 16 14 7 12 20v8H60q-6 0-6-6V40q0-6 8-6Z" />
    ),
    outerwear: (
      <>
        <path d="M60 42 86 32l14 20 14-20 26 10 32 92-20 10-14-50v80H62v-80l-14 50-20-10Z" />
        <path d="M100 54v108" stroke="#DCDCE0" strokeWidth="2" fill="none" />
      </>
    ),
    glasses: (
      <>
        <rect x="34" y="86" width="56" height="38" rx="14" />
        <rect x="110" y="86" width="56" height="38" rx="14" />
        <path d="M90 98q10-8 20 0" stroke="#E4E4E8" strokeWidth="6" fill="none" />
        <path d="M34 92 20 86M166 92l14-6" stroke="#E4E4E8" strokeWidth="6" strokeLinecap="round" fill="none" />
      </>
    ),
    bag: (
      <>
        <path d="M76 82V62q0-26 24-26t24 26v20" stroke="#E4E4E8" strokeWidth="9" fill="none" />
        <path d="M52 80h96l8 92q1 8-8 8H52q-9 0-8-8Z" />
      </>
    ),
    hat: (
      <>
        <path d="M40 120q0-56 60-56t60 56Z" />
        <path d="M120 116q40 2 56 14-30 8-76 4Z" />
      </>
    ),
    dress: <path d="M80 30h40l6 40 30 104H44L74 70Z" />,
  }
  return (
    <svg viewBox="0 0 200 200" className="size-[72%]" aria-hidden>
      <defs>
        {/* Lit from the top left, like a soft white foam cast of the piece. */}
        <linearGradient id="ghost" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.55" stopColor="#F4F4F6" />
          <stop offset="1" stopColor="#E4E4E8" />
        </linearGradient>
        <filter id="ghost-shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000409" floodOpacity="0.10" />
        </filter>
      </defs>
      <g fill="url(#ghost)" stroke="#E2E2E6" strokeWidth="1.5" strokeLinejoin="round" filter="url(#ghost-shadow)">
        {shapes[kind]}
      </g>
    </svg>
  )
}

// ── Tiles ────────────────────────────────────────────────────────────────────

const TILES: { slot: Slot; empty: string }[] = [
  { slot: 'top', empty: 'Select a Top' },
  { slot: 'bottom', empty: 'Select Bottoms' },
  { slot: 'dress', empty: 'Select a Dress' },
  { slot: 'outerwear', empty: 'Add Another Top' },
  { slot: 'shoes', empty: 'Select Shoes' },
  { slot: 'bag', empty: 'Add a Bag' },
  { slot: 'glasses', empty: 'Add Glasses' },
  { slot: 'hat', empty: 'Add a Hat' },
]

function TileLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center justify-center gap-1 text-[15px] leading-[18px]" style={{ fontWeight: 420, color: C.text }}>
      {children}
      <ChevronRight size={15} strokeWidth={1.8} />
    </span>
  )
}

function FilledTile({ slot, piece }: { slot: Slot; piece: Garment }) {
  const locked = useTryItOnStore((s) => !!s.draft?.locked[slot])
  const toggleLock = useTryItOnStore((s) => s.toggleLock)
  const removeDraftSlot = useTryItOnStore((s) => s.removeDraftSlot)
  const yours = piece.source === 'link' || piece.source === 'upload'
  return (
    <>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => toggleLock(slot)}
          aria-pressed={locked}
          aria-label={locked ? `Unlock ${piece.name}` : `Lock ${piece.name} so Style Me keeps it`}
          className="pointer-events-auto -m-2 p-2 transition-opacity hover:opacity-70"
          style={{ color: locked ? C.text : '#B5B8BF' }}
        >
          {locked ? <Lock size={18} strokeWidth={1.5} /> : <LockOpen size={18} strokeWidth={1.5} />}
        </button>
        <button
          type="button"
          onClick={() => removeDraftSlot(slot)}
          aria-label={`Remove ${piece.name}`}
          className="pointer-events-auto -m-2 p-2 transition-opacity hover:opacity-70"
          style={{ color: '#B5B8BF' }}
        >
          <X size={20} strokeWidth={1.4} />
        </button>
      </div>
      <GarmentImage garment={piece} background="#FFFFFF" className="my-1.5 min-h-0 flex-1" />
      <div className="flex flex-col gap-1.5">
        {yours && (
          <span
            className="self-start rounded-full px-2 py-0.5 text-[11px] leading-[14px]"
            style={{ background: '#E6F9F1', color: '#006846', fontWeight: 450 }}
          >
            Yours
          </span>
        )}
        <span className="line-clamp-2 text-[15px] leading-[18px]" style={{ fontWeight: 420, color: C.text }}>
          {piece.name}
        </span>
      </div>
    </>
  )
}

function Tile({ slot, empty, index }: { slot: Slot; empty: string; index: number }) {
  const draft = useTryItOnStore((s) => s.draft)
  const openSheet = useTryItOnStore((s) => s.openSheet)
  const piece = draft?.pieces[slot]
  // A dress covers Top and Bottoms; picking either swaps the dress out.
  const covered = (slot === 'top' || slot === 'bottom') && !!draft?.pieces.dress && !piece
  const open = () => openSheet({ name: 'slot', slot })

  const label = piece ? `Change ${piece.name}` : covered ? `Swap your dress for a ${SLOT_LABEL[slot].toLowerCase()}` : empty
  return (
    // The whole tile opens the slot; lock and ✕ sit above that button rather than inside it.
    <div
      className="relative flex aspect-[46/54] flex-col p-4"
      style={{ borderBottom: `1px solid ${LINE}`, borderRight: index % 2 === 0 ? `1px solid ${LINE}` : 'none' }}
    >
      <button
        type="button"
        onClick={open}
        aria-label={label}
        className="absolute inset-0 outline-none transition-colors hover:bg-[#FCFCFC] focus-visible:bg-[#F7F7F8]"
      />
      <div className="pointer-events-none relative flex min-h-0 flex-1 flex-col">
        {piece ? (
          <FilledTile slot={slot} piece={piece} />
        ) : (
          <>
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <GhostArt kind={slot} />
            </div>
            {covered ? (
              <span className="text-center text-[14px] leading-[18px]" style={{ color: C.secondary }}>
                Covered by your dress
              </span>
            ) : (
              <TileLabel>{empty}</TileLabel>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

/**
 * v2 Complete the Look, after Doji's "Create Look": every slot is a tile in one
 * grid, empty ones showing a ghost of what goes there. A product link pasted
 * above the grid lands in whichever slots its pieces belong to. Base pieces are
 * never listed — an empty Top or Bottoms falls back to the base when
 * generating. Lock keeps a piece through "Style Me", which restyles the rest.
 */
export function CreateLook() {
  const draft = useTryItOnStore((s) => s.draft)
  const look = useTryItOnStore(currentLook)
  const credits = useTryItOnStore((s) => s.credits)
  const [url, setUrl] = useState('')
  const notice = useTryItOnStore((s) => s.builderNotice)
  const sheetOpen = useTryItOnStore((s) => s.sheets.length > 0)
  const draftChanged = useTryItOnStore((s) => s.draftChanged())
  const closeBuilder = useTryItOnStore((s) => s.closeBuilder)
  const openSheet = useTryItOnStore((s) => s.openSheet)
  const setBuilderNotice = useTryItOnStore((s) => s.setBuilderNotice)
  const styleMe = useTryItOnStore((s) => s.styleMe)
  const tryOn = useTryItOnStore((s) => s.tryOn)
  if (!draft) return null

  const pieces = Object.values(draft.pieces) as Garment[]
  const canTry = draftChanged && pieces.length > 0

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col overflow-hidden bg-white"
      style={{ ...FONT, transformOrigin: 'top center' }}
      initial={{ y: '100%' }}
      animate={{ y: sheetOpen ? 10 : 0, scale: sheetOpen ? 0.94 : 1, borderRadius: sheetOpen ? 12 : 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.42, ease: EASE }}
    >
      {/* Same header as the studio: back and credits. */}
      <header className="flex h-[60px] shrink-0 items-center justify-between px-6">
        <button type="button" onClick={closeBuilder} aria-label="Go back" className="-ml-2 p-2 transition-opacity hover:opacity-70">
          <ArrowLeft size={24} strokeWidth={1.5} color={C.text} />
        </button>
        <div className="-mr-1.5">
          <Credits value={credits} />
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <div className="pointer-events-none absolute inset-x-3 top-3 z-10">
          <AnimatePresence>
            {notice && (
              <div className="pointer-events-auto">
                <Notice tone="success" duration={3000} onClose={() => setBuilderNotice(null)}>
                  {notice}
                </Notice>
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="scrollbar-hide h-full overflow-y-auto pb-6">
          <div className="flex flex-col gap-3 px-6 pt-2">
            <h1 className="text-[24px] leading-[26px] tracking-[-0.288px]" style={{ fontWeight: 450, color: C.text }}>
              Complete the Look
            </h1>
            <p className="text-[16px] leading-[18px]" style={{ fontWeight: 420, color: C.secondary }}>
              Anything you leave empty stays as your base
            </p>
          </div>
          <div className="flex flex-col gap-2 px-6 pb-5 pt-5">
            <LinkField
              compact
              value={url}
              onChange={setUrl}
              onSubmit={(v) => {
                openSheet({ name: 'link', url: v, toBuilder: true })
                setUrl('')
              }}
            />
            <p className="text-[13px] leading-[16px]" style={{ color: C.secondary }}>
              We'll try to identify the item type ourselves
            </p>
          </div>
          <div className="grid grid-cols-2" style={{ borderTop: `1px solid ${LINE}` }}>
            {TILES.map((t, i) => (
              <Tile key={t.slot} slot={t.slot} empty={t.empty} index={i} />
            ))}
          </div>
        </div>

      </div>

      <div className="flex shrink-0 gap-3 bg-white px-6 pb-4 pt-3" style={{ borderTop: `1px solid ${LINE}` }}>
        <button
          type="button"
          onClick={styleMe}
          className="flex h-[45px] flex-1 items-center justify-center gap-2 rounded-[8px] text-[16px] leading-[18px] transition-[background-color,transform] hover:bg-[#EEEEF0] active:scale-[0.98]"
          style={{ background: C.grey03, color: C.text, fontWeight: 450 }}
        >
          <Sparkles size={18} strokeWidth={1.6} /> Style Me
        </button>
        <button
          type="button"
          disabled={!canTry}
          onClick={() => tryOn(withBase(pieces))}
          className="flex h-[45px] flex-1 items-center justify-center gap-2 rounded-[8px] text-[16px] leading-[18px] text-white transition-transform active:scale-[0.98] disabled:active:scale-100"
          style={{
            background: canTry ? C.text : '#9A9B9D',
            fontWeight: 450,
            boxShadow: 'inset 0 2px 2px rgba(255,255,255,0.25)',
          }}
        >
          Try on
          {canTry && (
            <>
              <span className="h-4 w-px bg-white/40" aria-hidden />
              <span className="flex items-center gap-1.5">
                <CreditsIcon />1
              </span>
            </>
          )}
        </button>
      </div>
      {/* Keeps the look being completed in view for screen readers. */}
      <span className="sr-only">Completing {look.pieces.map((p) => p.name).join(', ')}</span>
    </motion.div>
  )
}
