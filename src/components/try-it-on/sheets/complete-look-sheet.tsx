import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { TriangleAlert } from 'lucide-react'
import { VERSION, useTryItOnStore, type Look, type SheetRoute } from '@/store/try-it-on-store'
import {
  V4_GARMENTS,
  LOOK_TABS,
  firstEmptyTab,
  lookTabFor,
  pieceInTab,
  type Garment,
  type LookTab,
  type Slot,
} from '../try-it-on-data'
import { AccessoriesArt, SlotArt } from '../CreateLook'
import { SheetHeader } from '../Sheet'
import { GarmentImage, PrimaryButton, TileCheck } from '../ui'
import { C } from '../tokens'

type Route = Extract<SheetRoute, { name: 'builder' }>
type Tab = LookTab | 'saves'
type Pieces = Partial<Record<Slot, Garment>>

const keyOf = (pieces: Garment[]) =>
  pieces
    .map((p) => p.id)
    .sort()
    .join('|')

// ── Tabs ─────────────────────────────────────────────────────────────────────

/** Figma "pill" (3396:15994…16005): Saves keeps its pink fill, the active type goes white with a black ring. */
function TabPill({ tab, label, active, onSelect }: { tab: Tab; label: string; active: boolean; onSelect: () => void }) {
  const saves = tab === 'saves'
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onSelect}
      className={`flex h-8 shrink-0 items-center gap-1 rounded-full text-[14px] leading-[18px] transition-colors ${saves ? 'px-2' : 'px-4'}`}
      style={{
        color: C.text,
        fontWeight: 420,
        background: saves ? '#FFF4F8' : active ? '#FFFFFF' : C.grey03,
        boxShadow: active ? `inset 0 0 0 1px ${C.text}` : undefined,
      }}
    >
      {saves && <img src="/try-it-on/saves-heart.svg" alt="" width={14} height={14} />}
      {label}
    </button>
  )
}

// ── Tiles ────────────────────────────────────────────────────────────────────

const TILE_LABEL = 'w-full truncate text-center text-[12px] leading-[14px]'

/** Figma "Image tile" (8176:18729): black ring, 20% dim and a ticked box once it's in the look. */
function PieceTile({ garment, label, selected, onClick }: { garment: Garment; label?: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className="flex min-w-0 flex-col gap-2">
      <span
        className="relative block aspect-square w-full overflow-hidden rounded-[8px]"
        style={{ border: selected ? `1.5px solid ${C.text}` : `1px solid ${C.grey12}` }}
      >
        <GarmentImage garment={garment} className="absolute inset-0" />
        <span className="absolute inset-0 transition-opacity duration-150" style={{ background: 'rgba(0,0,0,0.2)', opacity: selected ? 1 : 0 }} />
        <TileCheck on={selected} className="right-[4.5px] top-[4.5px]" />
      </span>
      <span className={TILE_LABEL} style={{ fontWeight: 420, color: C.text }}>
        {label ?? garment.name}
      </span>
    </button>
  )
}

/** A liked look on the Saves tab: tapping it puts that whole outfit on. */
function SavedLookTile({ look, selected, onClick }: { look: Look; selected: boolean; onClick: () => void }) {
  const names = look.pieces.filter((p) => p.source !== 'base').map((p) => p.name)
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} aria-label={names.join(', ')} className="flex min-w-0 flex-col gap-2">
      <span
        className="relative block aspect-[3/4] w-full overflow-hidden rounded-[8px]"
        style={{ border: selected ? `1.5px solid ${C.text}` : `1px solid ${C.grey12}` }}
      >
        <img src={look.render.image} alt="" className="absolute inset-0 size-full object-cover object-top" />
        <span className="absolute inset-0 transition-opacity duration-150" style={{ background: 'rgba(0,0,0,0.2)', opacity: selected ? 1 : 0 }} />
        <TileCheck on={selected} className="right-[4.5px] top-[4.5px]" />
      </span>
      <span className={TILE_LABEL} style={{ fontWeight: 420, color: C.text }}>
        {names.join(' + ')}
      </span>
    </button>
  )
}

/** "Upload a top/dress" (Figma 3396:16007): dashed inset, frosted upload button in the middle. */
function UploadTile({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="group flex min-w-0 flex-col gap-2">
      <span className="relative flex aspect-square w-full items-center justify-center rounded-[8px] transition-colors group-hover:bg-[#F0F0F2]" style={{ background: C.grey03 }}>
        <span className="absolute inset-[3px] rounded-[6px] border border-dashed" style={{ borderColor: '#CFD1D3' }} />
        <span
          className="relative flex items-center justify-center rounded-full border border-white p-[10px] backdrop-blur-[6px]"
          style={{ background: 'rgba(255,255,255,0.44)', boxShadow: 'inset 2px 2px 12px rgba(255,255,255,0.3)' }}
        >
          <span className="flex size-4 items-center justify-center">
            <img src="/try-it-on/upload.svg" alt="" width={14} height={13} />
          </span>
        </span>
      </span>
      <span className={TILE_LABEL} style={{ fontWeight: 420, color: C.text }}>
        {label}
      </span>
    </button>
  )
}

// ── Look slots beside Continue ───────────────────────────────────────────────

/**
 * One 40px slot per asset type (Figma 3396:16028). Empty ones show the type's
 * icon (Figma 3380:218932); tapping any slot jumps to its tab.
 */
function LookSlots({ pieces, tab, onSelect }: { pieces: Pieces; tab: Tab; onSelect: (t: LookTab) => void }) {
  return (
    <div className="scrollbar-hide flex items-center gap-1 overflow-x-auto p-[2px]">
      {LOOK_TABS.map((t) => {
        const piece = pieceInTab(pieces, t.id)
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            aria-label={`${t.label}: ${piece ? piece.name : 'your base'}`}
            className="relative size-[40px] shrink-0 overflow-hidden rounded-[5.7px] transition-shadow"
            style={{
              background: C.grey03,
              border: `0.7px ${piece ? 'solid' : 'dashed'} ${C.grey12}`,
              boxShadow: tab === t.id ? `0 0 0 1.5px ${C.text}` : undefined,
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={piece?.id ?? 'empty'}
                className="absolute inset-0"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 520, damping: 30 }}
              >
                {piece ? (
                  <GarmentImage garment={piece} className="size-full" />
                ) : (
                  // Same placeholder as the attire grid; faded so an empty slot doesn't read as picked.
                  <span className="relative flex size-full items-center justify-center opacity-60">
                    {t.id === 'accessories' ? <AccessoriesArt /> : <SlotArt kind={t.slots[0]} />}
                  </span>
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        )
      })}
    </div>
  )
}

// ── The sheet ────────────────────────────────────────────────────────────────

/**
 * v4 "Complete the look" (Figma 3396:15834). The same draft the panel's
 * picks write to, so starting a look and completing it is one flow: tap a
 * piece to put it on, tap it again to take it off, Continue goes back to the
 * panel with everything picked shown above its Create.
 * Saves lists the looks you've liked; tapping one puts that outfit on.
 */
export function CompleteLookSheet({ route }: { route: Route }) {
  const draft = useTryItOnStore((s) => s.draft)
  const looks = useTryItOnStore((s) => s.looks)
  const setDraftPiece = useTryItOnStore((s) => s.setDraftPiece)
  const removeDraftSlot = useTryItOnStore((s) => s.removeDraftSlot)
  const setDraftPieces = useTryItOnStore((s) => s.setDraftPieces)
  const replaceSheet = useTryItOnStore((s) => s.replaceSheet)
  const pushSheet = useTryItOnStore((s) => s.pushSheet)
  const popSheet = useTryItOnStore((s) => s.popSheet)
  const closeSheets = useTryItOnStore((s) => s.closeSheets)
  const stacked = useTryItOnStore((s) => s.sheets.length > 1)

  const [tab, setTab] = useState<Tab>(() => {
    if (route.tab && route.tab !== 'for-you') return lookTabFor(route.tab)
    return firstEmptyTab(draft?.pieces ?? {})
  })
  if (!draft) return null

  const pieces = Object.values(draft.pieces) as Garment[]
  // A dress takes the place of a top and bottoms, so on the Dress tab say what picking one would remove.
  const covered = [draft.pieces.top, draft.pieces.bottom].filter((p): p is Garment => !!p)
  const dressWarning =
    tab === 'dress' && covered.length
      ? `Selecting a dress removes your ${covered.map((p) => p.name).join(' and ')}.`
      : null
  const saved = looks.filter((l) => l.favorite)
  const def = tab === 'saves' ? null : LOOK_TABS.find((t) => t.id === tab)!
  const grid = def ? V4_GARMENTS.filter((g) => def.slots.includes(g.slot)) : []

  const toggle = (g: Garment) => (draft.pieces[g.slot]?.id === g.id ? removeDraftSlot(g.slot) : setDraftPiece(g))

  const toggleSaved = (look: Look) => {
    const own = look.pieces.filter((p) => p.source !== 'base')
    setDraftPieces(keyOf(own) === keyOf(pieces) ? [] : own)
  }

  // Keep the tab on the route so coming back from the upload steps lands here again.
  const upload = (slot: Slot) => {
    replaceSheet({ name: 'builder', tab: slot, fromPick: route.fromPick })
    pushSheet({ name: 'upload', slot, toBuilder: true })
  }

  return (
    // Fixed height so switching tabs doesn't make the sheet jump; sheets never exceed 90% of the screen.
    <div className="flex h-[90dvh] flex-col">
      <SheetHeader title="Complete the look" subtitle="Choose what you like to make an outfit" back={false} />

      <div role="tablist" aria-label="Asset type" className="scrollbar-hide flex shrink-0 gap-2 overflow-x-auto px-6 pt-6 web:pt-10">
        <TabPill tab="saves" label="Saves" active={tab === 'saves'} onSelect={() => setTab('saves')} />
        {LOOK_TABS.map((t) => (
          <TabPill key={t.id} tab={t.id} label={t.label} active={tab === t.id} onSelect={() => setTab(t.id)} />
        ))}
      </div>
      <AnimatePresence initial={false}>
        {dressWarning && (
          <motion.p
            key="dress-warning"
            role="status"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="flex shrink-0 items-start gap-2 overflow-hidden px-6 pt-3 text-[14px] leading-[18px]"
            style={{ color: '#8A5A00', fontWeight: 420 }}
          >
            <TriangleAlert size={16} strokeWidth={1.8} className="mt-px shrink-0" aria-hidden />
            {dressWarning}
          </motion.p>
        )}
      </AnimatePresence>

      <div role="tabpanel" className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-6 web:pt-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            // The outgoing grid fades for a moment; it mustn't take taps meant for the new tab.
            exit={{ opacity: 0, pointerEvents: 'none' }}
            transition={{ duration: 0.16 }}
          >
            {def ? (
              <div className="grid grid-cols-3 gap-2 web:grid-cols-5">
                <UploadTile label={def.upload} onClick={() => upload(def.slots[0])} />
                {grid.map((g) => (
                  <PieceTile key={g.id} garment={g} selected={draft.pieces[g.slot]?.id === g.id} onClick={() => toggle(g)} />
                ))}
              </div>
            ) : saved.length ? (
              <div className="grid grid-cols-3 gap-2 web:grid-cols-5">
                {saved.map((look) => (
                  <SavedLookTile
                    key={look.id}
                    look={look}
                    selected={keyOf(look.pieces.filter((p) => p.source !== 'base')) === keyOf(pieces)}
                    onClick={() => toggleSaved(look)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <img src="/try-it-on/saves-heart.svg" alt="" width={24} height={24} />
                <p className="text-[16px] leading-[18px]" style={{ fontWeight: 450, color: C.text }}>
                  No saves yet
                </p>
                <p className="text-[14px] leading-[16px]" style={{ fontWeight: 420, color: C.secondary }}>
                  Tap the heart on a look you like and it shows up here.
                </p>
              </div>
            )}
            {def && grid.length === 0 && (
              <p className="mt-4 text-[14px] leading-[18px]" style={{ color: C.secondary }}>
                No {def.label.toLowerCase()} to suggest yet. Upload a photo of the one you have in mind.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        className="relative flex shrink-0 items-center justify-between gap-3 bg-white px-6 py-4 web:justify-end"
        style={{ filter: 'drop-shadow(0px -2px 6px rgba(0,0,0,0.06))' }}
      >
        <div className="min-w-0 web:absolute web:left-1/2 web:top-1/2 web:-translate-x-1/2 web:-translate-y-1/2">
          <LookSlots pieces={draft.pieces} tab={tab} onSelect={setTab} />
        </div>
        {/* Back to the panel, whose Create renders the look — on the phone the panel is the sheet underneath. */}
        <PrimaryButton
          // v6 opened from Pick an outfit, which has no Try on of its own: carry on to Try this on.
          // From a Complete the Look tile it just goes back, where Try on sits beside Style Me.
          onClick={
            VERSION === 6 && route.fromPick && pieces.length
              ? () => replaceSheet({ name: 'try', garments: pieces })
              : stacked
                ? popSheet
                : closeSheets
          }
          className="w-auto"
        >
          Continue
        </PrimaryButton>
      </div>
    </div>
  )
}
