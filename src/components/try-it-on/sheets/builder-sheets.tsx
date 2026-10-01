import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Plus, Upload, X } from 'lucide-react'
import { currentLook, useTryItOnStore, withBase, withPiece, withoutSlot, type SheetRoute } from '@/store/try-it-on-store'
import {
  COLLECTION,
  SLOT_LABEL,
  SLOT_ORDER,
  SLOT_SUGGESTIONS,
  garmentById,
  type Garment,
  type Slot,
} from '../try-it-on-data'
import { SectionLabel, SheetFooter, SheetHeader, SheetScroll } from '../Sheet'
import { EditIcon, GarmentImage, GarmentTile, Notice, PrimaryButton, TextLink } from '../ui'
import { C } from '../tokens'
import { LinkField } from './pick-sheets'

type Route<N extends SheetRoute['name']> = Extract<SheetRoute, { name: N }>

const byId = (id: string) => garmentById(id) as Garment
const lower = (slot: Slot) => SLOT_LABEL[slot].toLowerCase()

function Tag({ children, tone = 'grey' }: { children: React.ReactNode; tone?: 'grey' | 'green' }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px] leading-[14px]"
      style={{
        fontWeight: 450,
        background: tone === 'green' ? '#E6F9F1' : C.grey03,
        color: tone === 'green' ? '#006846' : C.secondary,
      }}
    >
      {children}
    </span>
  )
}

// ── Complete the Look builder — Claude Design 4a step 5 / 2a steps 1 & 4 ─────

/**
 * Only the pieces the user picked are listed — the base photo's own top and
 * bottom never show here, they are simply what an empty slot falls back to when
 * the look is generated. Every listed piece can be changed or taken off, and
 * anything a new pick pushed out can be undone.
 */
export function BuilderSheet() {
  const draft = useTryItOnStore((s) => s.draft)
  const look = useTryItOnStore(currentLook)
  const notice = useTryItOnStore((s) => s.builderNotice)
  const setBuilderNotice = useTryItOnStore((s) => s.setBuilderNotice)
  const pushSheet = useTryItOnStore((s) => s.pushSheet)
  const undoReplace = useTryItOnStore((s) => s.undoReplace)
  const removeDraftSlot = useTryItOnStore((s) => s.removeDraftSlot)
  const tryOn = useTryItOnStore((s) => s.tryOn)
  const draftChanged = useTryItOnStore((s) => s.draftChanged())
  if (!draft) return null

  const filled = SLOT_ORDER.filter((s) => draft.pieces[s])
  const hasDress = !!draft.pieces.dress
  const empty = SLOT_ORDER.filter((s) => !draft.pieces[s] && !(hasDress && (s === 'top' || s === 'bottom')))
  const inLook = new Set(look.pieces.filter((p) => p.source !== 'base').map((p) => p.id))
  const pieces = Object.values(draft.pieces) as Garment[]
  const added = pieces.filter((p) => !inLook.has(p.id)).length
  // An empty builder would only re-render the base, so it needs at least one piece.
  const changed = draftChanged && pieces.length > 0

  return (
    <>
      <SheetHeader title="Complete the Look" back={false} />
      <SheetScroll className="pt-5">
        <AnimatePresence>
          {notice && (
            <Notice tone="success" onClose={() => setBuilderNotice(null)} duration={3500}>
              {notice}
            </Notice>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-3">
          <SectionLabel>In this look</SectionLabel>
          {filled.length === 0 && (
            <p className="text-[14px] leading-[18px]" style={{ color: C.secondary }}>
              Nothing picked yet. Add a piece below — the rest stays as your base.
            </p>
          )}
          <div className="flex flex-col">
            {filled.map((slot) => {
              const piece = draft.pieces[slot]!
              const isNew = !inLook.has(piece.id)
              const replaced = draft.replaced[slot]
              return (
                <motion.div
                  layout
                  key={slot}
                  className="-mx-3 flex items-center gap-3 rounded-[10px] px-3 py-2.5"
                  style={{ background: isNew ? C.grey03 : 'transparent' }}
                >
                  <GarmentImage garment={piece} className="size-12 shrink-0 rounded-[8px]" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] leading-[16px]" style={{ color: C.secondary }}>
                        {SLOT_LABEL[slot]}
                      </span>
                      {(piece.source === 'link' || piece.source === 'upload') && <Tag tone="green">Yours</Tag>}
                    </div>
                    <span className="truncate text-[16px] leading-[18px]" style={{ fontWeight: 420, color: C.text }}>
                      {piece.name}
                    </span>
                    {replaced && (
                      <span className="text-[13px] leading-[15px]" style={{ color: C.secondary }}>
                        Replaces {replaced.map((r) => r.name).join(' & ')} ·{' '}
                        <button
                          type="button"
                          onClick={() => undoReplace(slot)}
                          className="underline underline-offset-2 hover:opacity-70"
                          style={{ color: C.text }}
                        >
                          Undo
                        </button>
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => pushSheet({ name: 'slot', slot })}
                    aria-label={`Change ${lower(slot)}`}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[#EEEEF0]"
                    style={{ color: C.text }}
                  >
                    <EditIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeDraftSlot(slot)}
                    aria-label={`Remove ${piece.name}`}
                    className="-ml-2 flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[#EEEEF0]"
                    style={{ color: C.text }}
                  >
                    <X size={16} strokeWidth={1.6} />
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <SectionLabel>
              Add more <span style={{ color: '#9A9B9D' }}>· all optional</span>
            </SectionLabel>
            <p className="text-[13px] leading-[16px]" style={{ color: '#9A9B9D' }}>
              Anything you leave empty stays as your base
            </p>
          </div>
          <div className="flex flex-col">
            {empty.map((slot, i) => (
              <motion.button
                layout
                key={slot}
                type="button"
                onClick={() => pushSheet({ name: 'slot', slot })}
                className="flex items-center justify-between py-3.5 text-left"
                style={{ borderTop: i === 0 ? 'none' : `1px solid ${C.grey12}` }}
              >
                <span className="text-[18px] leading-[20px] tracking-[-0.09px]" style={{ fontWeight: 420, color: C.text }}>
                  {SLOT_LABEL[slot]}
                </span>
                <span
                  className="flex items-center gap-1 rounded-full border border-dashed px-3 py-1.5 text-[14px] leading-[16px]"
                  style={{ borderColor: '#B5B8BF', color: C.text, fontWeight: 450 }}
                >
                  <Plus size={14} strokeWidth={1.8} /> Add
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </SheetScroll>
      <SheetFooter shadow>
        <PrimaryButton disabled={!changed} cost={changed ? 1 : undefined} onClick={() => tryOn(withBase(pieces))}>
          {!changed ? 'Add a piece to try on' : added > 1 ? `Try on ${added} new pieces` : 'Try it on'}
        </PrimaryButton>
      </SheetFooter>
    </>
  )
}

// ── One slot — Claude Design 2a step 2 ───────────────────────────────────────

export function SlotSheet({ route }: { route: Route<'slot'> }) {
  const { slot } = route
  const draft = useTryItOnStore((s) => s.draft)
  const pushSheet = useTryItOnStore((s) => s.pushSheet)
  const setDraftPiece = useTryItOnStore((s) => s.setDraftPiece)
  const popTo = useTryItOnStore((s) => s.popTo)
  const setBuilderNotice = useTryItOnStore((s) => s.setBuilderNotice)
  const current = draft?.pieces[slot]
  const [selected, setSelected] = useState<string | null>(current?.source === 'catalog' ? current.id : null)
  const [url, setUrl] = useState('')

  const suggestions = SLOT_SUGGESTIONS[slot].map(byId)
  const hasMore = COLLECTION.some((id) => byId(id).slot === slot && !SLOT_SUGGESTIONS[slot].includes(id))
  const changed = !!selected && selected !== current?.id

  const add = () => {
    if (!selected) return
    const g = byId(selected)
    setDraftPiece(g)
    setBuilderNotice(`${g.name} added`)
    popTo('builder')
  }

  return (
    <>
      <SheetHeader title={SLOT_LABEL[slot]} />
      <SheetScroll className="pt-5">
        <LinkField compact value={url} onChange={setUrl} onSubmit={(v) => pushSheet({ name: 'link', slot, url: v })} />
        <div className="flex flex-col gap-4">
          <SectionLabel>Suggested for this look</SectionLabel>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => pushSheet({ name: 'upload', slot })}
              className="flex h-[163px] flex-col items-center justify-center gap-1.5 rounded-[8px] border-[1.5px] border-dashed text-center transition-colors hover:bg-[#F0F0F2]"
              style={{ borderColor: '#D9DADB', background: C.grey03 }}
            >
              <span className="mb-1 flex size-9 items-center justify-center rounded-full bg-white" aria-hidden>
                <Upload size={16} strokeWidth={1.6} color={C.text} />
              </span>
              <span className="text-[14px] leading-[16px]" style={{ fontWeight: 450, color: C.text }}>
                Upload a photo
              </span>
              <span className="text-[12px] leading-[14px]" style={{ color: C.secondary }}>
                Camera or gallery
              </span>
            </button>
            {suggestions.map((g) => (
              <GarmentTile
                key={g.id}
                garment={g}
                height={163}
                selected={selected === g.id}
                onClick={() => setSelected((s) => (s === g.id ? null : g.id))}
              />
            ))}
          </div>
          {suggestions.length === 0 && (
            <p className="text-[14px] leading-[18px]" style={{ color: C.secondary }}>
              We don't have {lower(slot)} to suggest yet. Paste a link or upload a photo of one you have in mind.
            </p>
          )}
          {hasMore && (
            <div className="pt-1">
              <TextLink onClick={() => pushSheet({ name: 'collection', slot })}>View all {lower(slot)}</TextLink>
            </div>
          )}
        </div>
      </SheetScroll>
      <AnimatePresence initial={false}>
        {changed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            <SheetFooter shadow>
              <PrimaryButton onClick={add}>Add item</PrimaryButton>
            </SheetFooter>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Items found in a link or photo — Claude Design 2a step 3 ─────────────────

export function FoundSheet({ route }: { route: Route<'found'> }) {
  const draft = useTryItOnStore((s) => s.draft)
  const setDraftPiece = useTryItOnStore((s) => s.setDraftPiece)
  const popTo = useTryItOnStore((s) => s.popTo)
  const setBuilderNotice = useTryItOnStore((s) => s.setBuilderNotice)
  const { items, slot } = route
  const [picked, setPicked] = useState<string[]>(() => {
    const forSlot = items.filter((it) => it.slot === slot).map((it) => it.id)
    return forSlot.length ? forSlot : [items[0].id]
  })
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  // Picking something for a slot the user already filled (not the slot they came from) replaces it.
  const clashes = items
    .filter((it) => picked.includes(it.id) && it.slot !== slot)
    .map((it) => ({ it, existing: draft?.pieces[it.slot] }))
    .filter((c) => c.existing && c.existing.source !== 'base')

  const add = () => {
    const chosen = items.filter((it) => picked.includes(it.id))
    chosen.forEach((it) => setDraftPiece(it))
    setBuilderNotice(chosen.length === 1 ? `${chosen[0].name} added` : `${chosen.length} items added`)
    popTo('builder')
  }

  return (
    <>
      <SheetHeader title={route.title} subtitle={`Found ${items.length} items. Select one or more.`} />
      <SheetScroll className="pt-5">
        {/* Sized to the photo itself so the detection boxes line up with it. */}
        <div className="relative mx-auto h-[260px] w-fit overflow-hidden rounded-[12px] bg-[#F0F0F0]">
          <img src={route.image} alt="" className="block h-full w-auto max-w-none" />
          {items.map((it) => {
            const on = picked.includes(it.id)
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => toggle(it.id)}
                aria-label={`${on ? 'Deselect' : 'Select'} ${it.name}`}
                className="absolute rounded-[6px] transition-[background-color,border-color] duration-150"
                style={{
                  left: `${it.found.x}%`,
                  top: `${it.found.y}%`,
                  width: `${it.found.w}%`,
                  height: `${it.found.h}%`,
                  border: on ? '2px solid #FFFFFF' : '1.5px dashed rgba(255,255,255,0.8)',
                  background: on ? 'rgba(0,4,9,0.18)' : 'transparent',
                  boxShadow: on ? '0 0 0 1px rgba(0,4,9,0.35)' : 'none',
                }}
              >
                {on && (
                  <span className="absolute -right-2 -top-2 flex size-[18px] items-center justify-center rounded-full bg-white shadow">
                    <Check size={11} strokeWidth={2.4} color={C.text} />
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {items.map((it) => (
            <GarmentTile
              key={it.id}
              garment={it}
              height={96}
              label={it.name}
              selected={picked.includes(it.id)}
              onClick={() => toggle(it.id)}
            />
          ))}
        </div>
      </SheetScroll>
      <SheetFooter shadow>
        <AnimatePresence>
          {clashes.map(({ it, existing }) => (
            <Notice key={it.id} tone="error" duration={null}>
              The {it.name.toLowerCase()} will replace your <b style={{ fontWeight: 500 }}>{existing!.name}</b> in the
              photo
            </Notice>
          ))}
        </AnimatePresence>
        <PrimaryButton disabled={picked.length === 0} onClick={add}>
          {picked.length > 1 ? `Add ${picked.length} items` : 'Add item'}
        </PrimaryButton>
      </SheetFooter>
    </>
  )
}

export function NotFoundSheet({ route }: { route: Route<'not-found'> }) {
  const replaceSheet = useTryItOnStore((s) => s.replaceSheet)
  const popTo = useTryItOnStore((s) => s.popTo)
  return (
    <>
      <SheetHeader title="Upload a photo" />
      <SheetScroll className="pt-5">
        <div className="relative h-[220px] w-full overflow-hidden rounded-[12px] bg-[#F0F0F0]">
          <img src={route.image} alt="" className="absolute inset-0 size-full object-cover opacity-60" />
        </div>
      </SheetScroll>
      <SheetFooter>
        <Notice tone="error" duration={null}>
          <b style={{ fontWeight: 500 }}>We couldn't find any {lower(route.slot)}</b>
          <br />
          Try a clearer photo where the item is fully visible. No credit was used.
        </Notice>
        <PrimaryButton onClick={() => replaceSheet({ name: 'upload', slot: route.slot })}>Upload another photo</PrimaryButton>
        <TextLink onClick={() => popTo('slot')}>Back to {SLOT_LABEL[route.slot]}</TextLink>
      </SheetFooter>
    </>
  )
}

// ── Swap one piece on a result — Claude Design 1b step 6 ─────────────────────

export function SwapSheet({ route }: { route: Route<'swap'> }) {
  const { slot } = route
  const look = useTryItOnStore(currentLook)
  const tryOn = useTryItOnStore((s) => s.tryOn)
  const openBuilder = useTryItOnStore((s) => s.openBuilder)
  const pushSheet = useTryItOnStore((s) => s.pushSheet)
  const piece = look.pieces.find((p) => p.slot === slot)
  const options = SLOT_SUGGESTIONS[slot].filter((id) => id !== piece?.id).slice(0, 3).map(byId)
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <>
      <SheetHeader title={`Swap ${piece?.name ?? SLOT_LABEL[slot]}`} back={false} credits />
      <SheetScroll className="pt-5">
        <div className="grid grid-cols-3 gap-3">
          {options.map((g) => (
            <GarmentTile key={g.id} garment={g} selected={selected === g.id} onClick={() => setSelected(g.id)} />
          ))}
        </div>
        <TextLink
          onClick={() => {
            openBuilder()
            pushSheet({ name: 'slot', slot })
          }}
        >
          + Bring your own
        </TextLink>
      </SheetScroll>
      <SheetFooter>
        <p className="text-center text-[14px] leading-[16px]" style={{ color: C.secondary }}>
          Only the swapped piece changes. The rest of the look stays.
        </p>
        <PrimaryButton
          disabled={!selected}
          cost={1}
          onClick={() => selected && tryOn(withPiece(look.pieces, byId(selected)))}
        >
          Swap
        </PrimaryButton>
        {piece && piece.source !== 'base' && (
          <TextLink onClick={() => tryOn(withoutSlot(look.pieces, slot))}>Remove piece</TextLink>
        )}
      </SheetFooter>
    </>
  )
}

