import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Shuffle, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  currentLook,
  useTryItOnStore,
  withBase,
  type OutfitTab,
  type SheetRoute,
} from '@/store/try-it-on-store'
import {
  COLLECTION,
  SLOT_LABEL,
  SLOT_SUGGESTIONS,
  STYLE_COMBOS,
  framingHint,
  garmentById,
  type Garment,
  type Slot,
} from '../try-it-on-data'
import { SheetFooter, SheetHeader } from '../Sheet'
import { GalleryIcon, GarmentImage, GarmentTile, LinkIcon, Notice, PrimaryButton, TileCheck } from '../ui'
import { SlotArt } from '../CreateLook'
import { C } from '../tokens'

type Route = Extract<SheetRoute, { name: 'builder' }>

const byId = (id: string) => garmentById(id) as Garment

/** The tray: "For you", then the outfit's slots in the order you'd dress. */
const TRAY: { tab: OutfitTab; label: string }[] = [
  { tab: 'for-you', label: 'For you' },
  { tab: 'top', label: 'Top' },
  { tab: 'bottom', label: 'Bottom' },
  { tab: 'dress', label: 'Dress' },
  { tab: 'outerwear', label: 'Layer' },
  { tab: 'shoes', label: 'Shoes' },
  { tab: 'bag', label: 'Bag' },
  { tab: 'glasses', label: 'Eyewear' },
  { tab: 'hat', label: 'Cap' },
]
const SLOT_TABS = TRAY.map((t) => t.tab).filter((t): t is Slot => t !== 'for-you')

/** Everything we can suggest for one slot. For you shows whole outfits instead. */
function piecesFor(tab: Slot): Garment[] {
  const ids = [...SLOT_SUGGESTIONS[tab], ...COLLECTION.filter((id) => byId(id).slot === tab)]
  return [...new Set(ids)].map(byId)
}

/** What the sheet calls a slot — outerwear is a "layer" here, to match its chip. */
const slotWord = (slot: Slot) =>
  slot === 'outerwear' ? 'layer' : slot === 'glasses' ? 'eyewear' : slot === 'hat' ? 'cap' : SLOT_LABEL[slot].toLowerCase()

/** "a top", "a layer" — but "shoes", "eyewear". */
const withArticle = (slot: Slot) => (slot === 'shoes' || slot === 'glasses' ? slotWord(slot) : `a ${slotWord(slot)}`)

/** Slots a piece takes over — a dress covers top and bottom. */
const takesOver = (slot: Slot): Slot[] =>
  slot === 'dress' ? ['top', 'bottom', 'dress'] : slot === 'top' || slot === 'bottom' ? [slot, 'dress'] : [slot]

// ── Tray chip ────────────────────────────────────────────────────────────────

function TrayChip({
  tab,
  label,
  active,
  piece,
  covered,
  isNew,
  onSelect,
  onRemove,
}: {
  tab: OutfitTab
  label: string
  active: boolean
  piece?: Garment
  covered: boolean
  isNew: boolean
  onSelect: () => void
  onRemove: () => void
}) {
  // Keep the selected slot in view — Style me can jump to one scrolled off the end.
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' })
  }, [active])

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        aria-label={
          tab === 'for-you'
            ? label
            : piece
              ? `${label}: ${piece.name}`
              : covered
                ? `${label}: covered by your dress`
                : `${label}: your base`
        }
        className="flex w-[58px] flex-col items-center gap-1.5"
      >
        <span
          className="relative flex size-[56px] items-center justify-center overflow-hidden rounded-[12px] transition-shadow duration-150"
          style={{
            background: piece ? '#FFFFFF' : C.grey03,
            boxShadow: active ? `0 0 0 1.5px ${C.text}` : `0 0 0 1px ${C.grey12}`,
          }}
        >
          {tab === 'for-you' ? (
            <Sparkles size={20} strokeWidth={1.6} color={C.text} />
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              {piece ? (
                <motion.span
                  key={piece.id}
                  className="absolute inset-0"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 30 }}
                >
                  <GarmentImage garment={piece} background="#FFFFFF" className="size-full" />
                </motion.span>
              ) : (
                <motion.span
                  key="ghost"
                  className="relative flex size-full items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: covered ? 0.35 : 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SlotArt kind={tab} />
                </motion.span>
              )}
            </AnimatePresence>
          )}
        </span>
        <span
          className="text-[11px] leading-[13px]"
          style={{ fontWeight: active ? 500 : 420, color: active ? C.text : C.secondary }}
        >
          {label}
        </span>
      </button>
      {piece && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Take off ${piece.name}`}
          className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-white transition-transform active:scale-90"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.2)', color: C.text }}
        >
          <X size={11} strokeWidth={2.2} />
        </button>
      )}
      {isNew && (
        <span className="absolute -left-0.5 -top-0.5 size-2 rounded-full ring-2 ring-white" style={{ background: '#00A36D' }} aria-hidden />
      )}
    </div>
  )
}

// ── Bring-your-own tiles, first in every grid ────────────────────────────────

function OwnTile({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-w-0 flex-col items-center gap-2">
      <span
        className="flex h-[124px] w-full flex-col items-center justify-center gap-2 rounded-[8px] border-[1.5px] border-dashed transition-colors hover:bg-[#F0F0F2]"
        style={{ borderColor: '#D9DADB', background: C.grey03, color: C.text }}
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-white">{icon}</span>
      </span>
      <span className="w-full truncate text-center text-[12px] leading-[14px]" style={{ fontWeight: 450, color: C.text }}>
        {label}
      </span>
    </button>
  )
}

// ── Outfit tiles (For you) ───────────────────────────────────────────────────

type Combo = (typeof STYLE_COMBOS)[number]
const comboKey = (combo: Combo) => [...combo.pieces].sort().join('|')

/** An outfit as a tile: its pieces in a small collage, the outfit's name under it. */
function OutfitTile({ combo, selected, onClick }: { combo: Combo; selected: boolean; onClick: () => void }) {
  const items = combo.pieces.map(byId)
  const [first, ...rest] = items
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`${combo.name}: ${items.map((g) => g.name).join(', ')}`}
      className="flex min-w-0 flex-col items-center gap-2"
    >
      <span
        className="relative grid h-[124px] w-full gap-px overflow-hidden rounded-[8px] transition-[box-shadow] duration-150"
        style={{
          gridTemplateColumns: rest.length ? '1fr 1fr' : '1fr',
          gridTemplateRows: rest.length > 1 ? '1fr 1fr' : '1fr',
          background: C.grey12,
          boxShadow: selected ? `0 0 0 1.4px ${C.text}, 0 2px 18px rgba(0,0,0,0.04)` : '0 0 0 1px #FFFFFF, 0 2px 18px rgba(0,0,0,0.04)',
        }}
      >
        <GarmentImage garment={first} className={cn('size-full', rest.length > 1 && 'row-span-2')} />
        {rest.map((g) => (
          <GarmentImage key={g.id} garment={g} className="size-full" />
        ))}
        <span
          className="absolute inset-0 transition-opacity duration-150"
          style={{ background: 'rgba(0,0,0,0.2)', opacity: selected ? 1 : 0 }}
        />
        <TileCheck on={selected} className="right-[3px] top-[3px]" />
      </span>
      <span className="w-full truncate text-center text-[12px] leading-[14px]" style={{ fontWeight: 450, color: C.text }}>
        {combo.name}
      </span>
    </button>
  )
}

// ── The sheet ────────────────────────────────────────────────────────────────

/**
 * v3: one sheet for the whole outfit. Picking a first piece and completing the
 * look are the same gesture — tap a piece to put it on, tap it again to take it
 * off. The tray across the top is both the outfit so far and the way to move
 * between kinds of pieces; empty slots are simply your base. Links and photos
 * are the first two tiles of every grid rather than a separate menu. For you
 * offers whole outfits that go together, plus Surprise me.
 */
export function OutfitSheet({ route }: { route: Route }) {
  const draft = useTryItOnStore((s) => s.draft)
  const look = useTryItOnStore(currentLook)
  const changed = useTryItOnStore((s) => s.draftChanged())
  const setDraftPiece = useTryItOnStore((s) => s.setDraftPiece)
  const removeDraftSlot = useTryItOnStore((s) => s.removeDraftSlot)
  const undoReplace = useTryItOnStore((s) => s.undoReplace)
  const setDraftPieces = useTryItOnStore((s) => s.setDraftPieces)
  const pushSheet = useTryItOnStore((s) => s.pushSheet)
  const replaceSheet = useTryItOnStore((s) => s.replaceSheet)
  const tryOn = useTryItOnStore((s) => s.tryOn)

  const starting = look.id === 'base'
  const [tab, setTab] = useState<OutfitTab>(() => {
    if (route.tab) return route.tab
    if (starting) return 'for-you'
    // Completing: open on the first slot that's still your base.
    return SLOT_TABS.find((s) => !draft?.pieces[s] && !(draft?.pieces.dress && (s === 'top' || s === 'bottom'))) ?? 'for-you'
  })
  const [undo, setUndo] = useState<{ text: string; slot?: Slot; restore?: Garment[] } | null>(null)
  if (!draft) return null

  const pieces = Object.values(draft.pieces) as Garment[]
  const inLook = new Set(look.pieces.map((p) => p.id))
  const added = pieces.filter((p) => !inLook.has(p.id))
  const canTry = changed && pieces.length > 0
  const hint = framingHint(look.pieces, added)

  /** Put a piece on, offering undo for anything it pushes out (a dress over a top and bottom). */
  const putOn = (g: Garment) => {
    const current = useTryItOnStore.getState().draft?.pieces ?? {}
    const pushedOut = takesOver(g.slot)
      .map((s) => current[s])
      .filter((p): p is Garment => !!p && p.id !== g.id && p.slot !== g.slot)
    setDraftPiece(g)
    setUndo(pushedOut.length ? { slot: g.slot, text: `Replaced ${pushedOut.map((p) => p.name).join(' & ')}` } : null)
  }

  const toggle = (g: Garment) => {
    if (draft.pieces[g.slot]?.id === g.id) {
      removeDraftSlot(g.slot)
      setUndo(null)
      return
    }
    putOn(g)
  }

  const draftKey = pieces
    .map((p) => p.id)
    .sort()
    .join('|')
  const isWearing = (combo: Combo) => comboKey(combo) === draftKey

  // An outfit goes on whole, like a piece does; tapping it again takes it off. Undo restores what was there.
  const toggleOutfit = (combo: Combo, text = `Styled ${combo.name}`) => {
    if (isWearing(combo)) {
      setDraftPieces([])
      setUndo({ text: `Took off ${combo.name}`, restore: pieces })
      return
    }
    setDraftPieces(combo.pieces.map(byId))
    setUndo({ text, restore: pieces })
  }

  const surpriseMe = () => {
    const options = STYLE_COMBOS.filter((c) => !isWearing(c))
    const combo = options[Math.floor(Math.random() * options.length)]
    if (combo) toggleOutfit(combo, `Surprise! ${combo.name}`)
  }

  // Remember the tab on the route so coming back from a link or photo lands here again.
  const bringYourOwn = (name: 'link' | 'upload', from: OutfitTab) => {
    replaceSheet({ name: 'builder', tab: from })
    pushSheet({ name, slot: from === 'for-you' ? undefined : from, toBuilder: true })
  }

  const grid = tab === 'for-you' ? [] : piecesFor(tab)

  return (
    // Fixed height so switching tabs doesn't make the sheet jump.
    <div className="flex h-[min(720px,90dvh)] flex-col">
      <SheetHeader
        title={starting ? 'Pick an Outfit' : 'Complete the Look'}
        subtitle="Tap pieces to put them on. Empty slots stay as your base."
        back={false}
        credits
      />

      <div className="scrollbar-hide flex shrink-0 gap-3 overflow-x-auto px-6 pb-3 pt-5" role="tablist" aria-label="Your outfit">
        {TRAY.map(({ tab: t, label }) => {
          const piece = t === 'for-you' ? undefined : draft.pieces[t]
          return (
            <TrayChip
              key={t}
              tab={t}
              label={label}
              active={tab === t}
              piece={piece}
              covered={(t === 'top' || t === 'bottom') && !piece && !!draft.pieces.dress}
              isNew={!!piece && !inLook.has(piece.id)}
              onSelect={() => setTab(t)}
              onRemove={() => t !== 'for-you' && removeDraftSlot(t)}
            />
          )
        })}
      </div>
      <div className="h-px shrink-0" style={{ background: C.grey12 }} />

      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            // The outgoing grid fades for a moment; it mustn't take taps meant for the new tab.
            exit={{ opacity: 0, pointerEvents: 'none' }}
            transition={{ duration: 0.16 }}
            className="flex flex-col gap-4"
          >
            <p className="text-[14px] leading-[16px]" style={{ color: C.secondary }}>
              {tab === 'for-you'
                ? 'Outfits that go well together. One tap puts the whole look on.'
                : draft.pieces[tab]
                  ? `Swap your ${slotWord(tab)}, or tap it again to take it off`
                  : (tab === 'top' || tab === 'bottom') && draft.pieces.dress
                    ? `Picking ${withArticle(tab)} swaps out your dress`
                    : `Add ${withArticle(tab)}`}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {/* Each grid passes its own tab, so a link is always for the slot it was pasted in. */}
              <OwnTile icon={<LinkIcon />} label="Paste a link" onClick={() => bringYourOwn('link', tab)} />
              <OwnTile icon={<GalleryIcon />} label="Upload a photo" onClick={() => bringYourOwn('upload', tab)} />
              {tab === 'for-you' && (
                <>
                  <OwnTile icon={<Shuffle size={17} strokeWidth={1.7} />} label="Surprise me" onClick={surpriseMe} />
                  {STYLE_COMBOS.map((combo) => (
                    <OutfitTile
                      key={combo.id}
                      combo={combo}
                      selected={isWearing(combo)}
                      onClick={() => toggleOutfit(combo)}
                    />
                  ))}
                </>
              )}
              {grid.map((g) => (
                <GarmentTile
                  key={g.id}
                  garment={g}
                  selected={draft.pieces[g.slot]?.id === g.id}
                  onClick={() => toggle(g)}
                />
              ))}
            </div>
            {tab !== 'for-you' && grid.length === 0 && (
              <p className="text-[14px] leading-[18px]" style={{ color: C.secondary }}>
                No {slotWord(tab as Slot)} to suggest yet. Paste a link or upload a photo of the one you
                have in mind.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <SheetFooter shadow>
        <AnimatePresence mode="popLayout">
          {undo ? (
            <Notice
              key={`undo-${undo.text}`}
              duration={5000}
              onClose={() => setUndo(null)}
              action={
                <button
                  type="button"
                  onClick={() => {
                    if (undo.restore) setDraftPieces(undo.restore)
                    else if (undo.slot) undoReplace(undo.slot)
                    setUndo(null)
                  }}
                  className="shrink-0 text-[14px] leading-[16px] underline underline-offset-2 hover:opacity-70"
                  style={{ fontWeight: 450, color: C.text }}
                >
                  Undo
                </button>
              }
            >
              {undo.text}
            </Notice>
          ) : (
            hint && (
              <Notice key={hint} duration={null}>
                {hint}
              </Notice>
            )
          )}
        </AnimatePresence>
        <PrimaryButton disabled={!canTry} cost={canTry ? 1 : undefined} onClick={() => tryOn(withBase(pieces))}>
          {!canTry
            ? starting
              ? 'Tap a piece to start'
              : 'Add a piece to try on'
            : added.length > 1
              ? `Try on ${added.length} pieces`
              : 'Try on'}
        </PrimaryButton>
      </SheetFooter>
    </div>
  )
}

