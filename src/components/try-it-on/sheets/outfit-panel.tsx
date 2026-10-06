import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { VERSION, currentLook, useTryItOnStore, withBase, withPiece } from '@/store/try-it-on-store'
import {
  FIRST_SUGGESTIONS,
  LOOK_TABS,
  V4_GARMENTS,
  V4_TOP_PICKS,
  classifyLink,
  productForLink,
  firstEmptyTab,
  garmentById,
  type Garment,
  type Slot,
} from '../try-it-on-data'
import { AttireActions, AttireGrid } from '../CreateLook'
import { SectionLabel, SheetFooter, SheetHeader } from '../Sheet'
import { Credits, GarmentImage, GarmentTile, Notice, PrimaryButton, Spinner, TileCheck } from '../ui'
import { BringYourOwn, LinkField } from './pick-sheets'
import { C } from '../tokens'

const byId = (id: string) => garmentById(id) as Garment

/** Slots to suggest for, emptiest first, once there's a look to complete. */
const COMPLETE_ORDER: Slot[] = ['bottom', 'outerwear', 'top', 'dress']

/**
 * The panel's state: picking an outfit on the base, completing it on a look.
 * Figma 3390:229694 ("Pick an outfit / Top Picks") vs 3391:14701 ("Complete
 * the look / Suggested for you this look").
 */
function usePanel() {
  const completing = useTryItOnStore((s) => (s.view.name === 'pending' ? s.genFrom !== 'base' : s.view.name === 'look'))
  const look = useTryItOnStore(currentLook)
  if (!completing) return { title: 'Pick an outfit', subtitle: 'Top Picks', picks: V4_TOP_PICKS }
  // Suggest against the look on screen, not the draft, so a tile doesn't vanish once it's picked.
  const wearing = new Set(look.pieces.map((p) => p.id))
  const filled = new Set(look.pieces.filter((p) => p.source !== 'base').map((p) => p.slot))
  const order = [...COMPLETE_ORDER.filter((s) => !filled.has(s)), ...COMPLETE_ORDER.filter((s) => filled.has(s))]
  // One from each slot in turn, emptiest slots first, so the three picks are three different kinds of piece.
  const bySlot = order.map((slot) => V4_GARMENTS.filter((g) => g.slot === slot && !wearing.has(g.id)))
  const picks: string[] = []
  for (let round = 0; picks.length < 3 && round < 6; round++) {
    for (const list of bySlot) if (list[round] && picks.length < 3) picks.push(list[round].id)
  }
  return { title: 'Complete the look', subtitle: 'Suggested for you this look', picks }
}

// ── Pieces of the panel ──────────────────────────────────────────────────────

/** Figma "Outfit Card" (3390:237586): 106x116, white hairline, soft shadow. */
function TopPick({ garment, selected, onClick }: { garment: Garment; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className="flex w-[106px] min-w-0 flex-col items-center gap-[10px]">
      <span
        className="relative block h-[116px] w-full overflow-hidden rounded-[8px] transition-[box-shadow] duration-150"
        style={{
          boxShadow: selected
            ? `0 0 0 1.4px ${C.text}, 0 2px 18px rgba(0,0,0,0.1)`
            : '0 0 0 1.4px #FFFFFF, 0 2px 18px rgba(0,0,0,0.1)',
        }}
      >
        <GarmentImage garment={garment} background="#EBEBEB" className="absolute inset-0" />
        <span className="absolute inset-0 transition-opacity duration-150" style={{ background: 'rgba(0,0,0,0.2)', opacity: selected ? 1 : 0 }} />
        <TileCheck on={selected} className="right-[2.6px] top-[2.6px]" />
      </span>
      <span className="w-full truncate text-center text-[12px] leading-[14px]" style={{ fontWeight: 450, color: C.text }}>
        {garment.name}
      </span>
    </button>
  )
}

/** Opens a step over the panel: stacked on the panel sheet on the phone, on its own on web. */
function useStep(inSheet: boolean) {
  const openSheet = useTryItOnStore((s) => s.openSheet)
  const pushSheet = useTryItOnStore((s) => s.pushSheet)
  return inSheet ? pushSheet : openSheet
}

type LinkState = 'idle' | 'reading' | 'invalid' | 'blocked'

/**
 * The product link, read and checked right here in the panel — the spinner and
 * any error sit under the field. Only once the page is read does a sheet open,
 * for picking which of the items found to add (they land above Create).
 * Copy and timings as LinkSheet (Figma 370:51709, 370:56843, 370:56872).
 */
function PanelLink({ inSheet }: { inSheet: boolean }) {
  const step = useStep(inSheet)
  const [url, setUrl] = useState('')
  const [state, setState] = useState<LinkState>('idle')
  const timer = useRef<number>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const submit = (value: string) => {
    window.clearTimeout(timer.current)
    setState('reading')
    timer.current = window.setTimeout(() => {
      const verdict = classifyLink(value)
      if (verdict !== 'ok') return setState(verdict)
      setState('idle')
      setUrl('')
      const product = productForLink(value)
      step({ name: 'found', image: product.photos[0].image, items: product.items, title: 'Items found' })
    }, 1600)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="transition-opacity duration-150" style={{ opacity: state === 'reading' ? 0.6 : 1, pointerEvents: state === 'reading' ? 'none' : 'auto' }}>
        <LinkField
          value={url}
          onChange={(v) => {
            setUrl(v)
            if (state === 'invalid' || state === 'blocked') setState('idle')
          }}
          onSubmit={submit}
        />
      </div>
      <AnimatePresence mode="popLayout" initial={false}>
        {state === 'reading' && (
          <motion.p
            key="reading"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-1 text-[14px] leading-[16px]"
            style={{ color: C.secondary }}
            role="status"
          >
            <Spinner size={14} /> Reading the page
          </motion.p>
        )}
        {state === 'invalid' && (
          <Notice key="invalid" tone="error" onClose={() => setState('idle')}>
            Please check the pasted link. Seems to be invalid
          </Notice>
        )}
        {state === 'blocked' && (
          <motion.div key="blocked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-2">
            <Notice tone="error" duration={null} onClose={() => setState('idle')}>
              We couldn't read that page. Some stores block this. Take a screenshot of the product and upload it instead
            </Notice>
            <button
              type="button"
              onClick={() => {
                setState('idle')
                step({ name: 'upload', toBuilder: true })
              }}
              className="h-[45px] w-full rounded-[8px] text-[16px] leading-[18px] transition-colors hover:bg-[#EEEEF0]"
              style={{ background: C.grey03, color: C.text, fontWeight: 450 }}
            >
              Upload a Screenshot
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Title, picks, Browse entire collection and the product link — everything above the dock. */
export function PanelBody({ inSheet }: { inSheet: boolean }) {
  const draft = useTryItOnStore((s) => s.draft)
  const setDraftPiece = useTryItOnStore((s) => s.setDraftPiece)
  const removeDraftSlot = useTryItOnStore((s) => s.removeDraftSlot)
  const step = useStep(inSheet)
  const { picks } = usePanel()

  const toggle = (g: Garment) => (draft?.pieces[g.slot]?.id === g.id ? removeDraftSlot(g.slot) : setDraftPiece(g))
  const browse = () => {
    const tab = firstEmptyTab(useTryItOnStore.getState().draft?.pieces ?? {})
    step({ name: 'builder', tab: LOOK_TABS.find((t) => t.id === tab)!.slots[0] })
  }

  return (
    <>
      <div className="flex gap-2">
        {picks.map((id) => {
          const g = byId(id)
          return <TopPick key={id} garment={g} selected={draft?.pieces[g.slot]?.id === id} onClick={() => toggle(g)} />
        })}
      </div>

      <div className="flex flex-col gap-6">
        <button type="button" onClick={browse} aria-haspopup="dialog" className="group flex w-full items-center gap-3 text-left">
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="flex items-center gap-1">
              <span className="text-[16px] leading-[18px]" style={{ fontWeight: 420, color: C.text }}>
                Browse entire collection
              </span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="transition-transform group-hover:translate-x-0.5">
                <path d="M6.47 3.83 10.64 8l-4.17 4.17" stroke={C.text} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-[14px] leading-[16px]" style={{ fontWeight: 420, color: C.secondaryAlt }}>
              Curated pieces for work, weekends and events
            </span>
          </span>
        </button>
        <div className="h-px w-full" style={{ background: C.grey12 }} />
        <PanelLink inSheet={inSheet} />
      </div>
    </>
  )
}

/** Desktop heading: title + credits, subtitle under it. */
export function PanelHeading() {
  const credits = useTryItOnStore((s) => s.credits)
  const { title, subtitle } = usePanel()
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-[26px] leading-7 tracking-[-0.312px]" style={{ fontWeight: 450, color: C.text }}>
          {title}
        </h1>
        <div className="-mr-1.5">
          <Credits value={credits} />
        </div>
      </div>
      <p className="text-[16px] leading-[18px]" style={{ fontWeight: 420, color: C.secondary }}>
        {subtitle}
      </p>
    </div>
  )
}

/**
 * Figma "Filter Options" (3391:14770): what's picked so far, as 40px tiles,
 * with View Attire across from them, over Create. Pieces picked anywhere in the
 * flow (Top Picks, the collection sheet, a link) land here.
 */
export function PanelDock({ onViewAttire }: { onViewAttire: () => void }) {
  const draft = useTryItOnStore((s) => s.draft)
  const changed = useTryItOnStore((s) => s.draftChanged())
  const tryOn = useTryItOnStore((s) => s.tryOn)
  const pieces = draft ? (Object.values(draft.pieces) as Garment[]) : []
  const canTry = changed && pieces.length > 0

  return (
    <div className="flex flex-col">
      {/* Only once something is picked — an empty row would just be noise above Create. */}
      <AnimatePresence initial={false}>
        {pieces.length > 0 && (
          <motion.div
            key="picked"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 pb-3">
              <div className="scrollbar-hide flex min-w-0 items-center gap-1 overflow-x-auto">
                <AnimatePresence initial={false} mode="popLayout">
                  {pieces.map((p) => (
                    <motion.span
                      key={p.id}
                      layout
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 520, damping: 30 }}
                      className="relative size-[40px] shrink-0 overflow-hidden rounded-[5.7px]"
                      style={{ border: `0.7px dashed ${C.grey12}` }}
                      title={p.name}
                    >
                      <GarmentImage garment={p} className="size-full" />
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
              <button
                type="button"
                onClick={onViewAttire}
                className="shrink-0 text-[14px] leading-[18px] transition-opacity hover:opacity-70"
                style={{ fontWeight: 420, color: C.text }}
              >
                View Attire
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <PrimaryButton disabled={!canTry} cost={1} onClick={() => tryOn(withBase(pieces))}>
        Create
      </PrimaryButton>
    </div>
  )
}

// ── v6: v1's Pick an outfit, in the side panel ───────────────────────────────

/**
 * v6 on web: v1's Pick an outfit sheet laid out in the side panel — Suggested
 * for you, then Or bring your own. Its next steps (Try this on, a link, an
 * upload, the collection) open as sheets, as they do in v1.
 */
export function PickPanel() {
  const credits = useTryItOnStore((s) => s.credits)
  const look = useTryItOnStore(currentLook)
  const tryOn = useTryItOnStore((s) => s.tryOn)
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between pb-5">
        <h1 className="text-[26px] leading-7 tracking-[-0.312px]" style={{ fontWeight: 450, color: C.text }}>
          Pick an outfit
        </h1>
        <div className="-mr-1.5">
          <Credits value={credits} />
        </div>
      </div>
      {/* Negative margin + padding: tile rings and shadows reach past their boxes, and the scroll area clips at its edges. */}
      <div className="scrollbar-hide -ml-4 -mr-6 -mt-2 min-h-0 flex-1 overflow-y-auto pb-6 pl-4 pr-6 pt-2">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <SectionLabel>Suggested for you</SectionLabel>
            <div className="grid grid-cols-3 gap-3">
              {FIRST_SUGGESTIONS.map((id) => {
                const g = byId(id)
                return (
                  <GarmentTile
                    key={id}
                    garment={g}
                    selected={selected === id}
                    onClick={() => setSelected((s) => (s === id ? null : id))}
                  />
                )
              })}
            </div>
          </div>
          <BringYourOwn />
        </div>
      </div>
      {/* Selecting a suggestion is the confirmation: Try It On renders it straight away, no sheet. */}
      <div className="relative -mx-6 shrink-0 bg-white px-6 pb-4 pt-3" style={{ filter: 'drop-shadow(0px -2px 6px rgba(0,0,0,0.06))' }}>
        <PrimaryButton
          disabled={!selected}
          cost={1}
          onClick={() => selected && tryOn(withPiece(look.pieces, byId(selected)))}
        >
          Try It On
        </PrimaryButton>
      </div>
    </div>
  )
}

// ── Sheets (the phone) ───────────────────────────────────────────────────────

/** v4 on the phone: the side panel as a sheet, opened from Pick an Outfit / Complete the Look. */
export function OutfitPanelSheet() {
  const pushSheet = useTryItOnStore((s) => s.pushSheet)
  const { title, subtitle } = usePanel()
  return (
    <div className="flex max-h-[90dvh] flex-col">
      <SheetHeader title={title} subtitle={subtitle} back={false} credits />
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-8">
        <div className="flex flex-col gap-8">
          <PanelBody inSheet />
        </div>
      </div>
      <SheetFooter shadow>
        <PanelDock onViewAttire={() => pushSheet({ name: 'attire' })} />
      </SheetFooter>
    </div>
  )
}

/** v6 reaches this from its Complete the Look button, so it carries that name. */
const ATTIRE_TITLE = VERSION === 6 ? 'Complete the Look' : 'Your attire'
const ATTIRE_SUBTITLE = 'Anything you leave empty stays as your base'

function AttireNotice() {
  const notice = useTryItOnStore((s) => s.builderNotice)
  const setBuilderNotice = useTryItOnStore((s) => s.setBuilderNotice)
  return (
    <AnimatePresence mode="popLayout">
      {notice && (
        <Notice key={notice} tone="success" duration={3000} onClose={() => setBuilderNotice(null)}>
          {notice}
        </Notice>
      )}
    </AnimatePresence>
  )
}

/**
 * v5 starts here and v6 completes the look here, so their View Attire also takes
 * a product link and shows credits — v4 has those on its Pick an outfit panel.
 */
const ATTIRE_IS_BASE = VERSION >= 5

/**
 * "View Attire" on the phone: v2's Complete the Look grid as a sheet. In v4 it
 * stacks over the panel sheet (back returns there); in v5 it is the first sheet.
 */
export function AttireSheet() {
  const stacked = useTryItOnStore((s) => s.sheets.length > 1)
  return (
    <div className="flex h-[90dvh] flex-col">
      <SheetHeader title={ATTIRE_TITLE} subtitle={ATTIRE_SUBTITLE} back={stacked} credits={!stacked} />
      {/* mt/pt split: the link field's ring sits just above it, and the scroll area clips at its top. */}
      <div className="scrollbar-hide mt-3 min-h-0 flex-1 overflow-y-auto pt-2">
        {ATTIRE_IS_BASE && (
          <div className="px-6 pb-5">
            <PanelLink inSheet />
          </div>
        )}
        <div className="px-6 pb-6">
          <AttireGrid layout="v4" />
        </div>
      </div>
      <SheetFooter shadow>
        <AttireNotice />
        <AttireActions />
      </SheetFooter>
    </div>
  )
}

/**
 * "View Attire" on web: the same grid in the side panel. v4 swaps it in from the
 * panel (the page header's back returns); v5 shows it from the start, with credits.
 */
export function AttirePanel({ onClose }: { onClose?: () => void }) {
  const credits = useTryItOnStore((s) => s.credits)
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* As v6's sheet: credits and ✕ on a row of their own, top right, like the other sheets. */}
      {onClose && (
        <div className="flex h-6 shrink-0 items-center justify-end gap-2 pb-4 pt-6" style={{ boxSizing: 'content-box' }}>
          <Credits value={credits} />
          <span className="h-4 w-px" style={{ background: C.grey12 }} aria-hidden />
          <button type="button" onClick={onClose} aria-label="Close" className="-mr-1 p-1 transition-opacity hover:opacity-70">
            <X size={24} strokeWidth={1.5} color={C.text} />
          </button>
        </div>
      )}
      <div className="flex shrink-0 flex-col gap-3 pb-5">
        <div className="flex items-center justify-between">
          <h1 className="text-[26px] leading-7 tracking-[-0.312px]" style={{ fontWeight: 450, color: C.text }}>
            {ATTIRE_TITLE}
          </h1>
          {ATTIRE_IS_BASE && !onClose && (
            <div className="-mr-1.5">
              <Credits value={credits} />
            </div>
          )}
        </div>
        <p className="text-[16px] leading-[18px]" style={{ fontWeight: 420, color: C.secondary }}>
          {ATTIRE_SUBTITLE}
        </p>
      </div>
      {/* Negative margin + padding: the link field's ring and shadow sit just outside it, and the
          scroll area clips at its edges; this leaves them room without moving or narrowing anything. */}
      <div className="scrollbar-hide -ml-4 -mr-6 -mt-2 min-h-0 flex-1 overflow-y-auto pl-4 pt-2">
        {ATTIRE_IS_BASE && (
          <div className="pb-5 pr-6">
            <PanelLink inSheet={false} />
          </div>
        )}
        <div className="pb-6 pr-6">
          <AttireGrid layout="v4" />
        </div>
      </div>
      <div className="relative -mx-6 flex shrink-0 flex-col gap-3 bg-white px-6 pb-4 pt-3" style={{ filter: 'drop-shadow(0px -2px 6px rgba(0,0,0,0.06))' }}>
        <AttireNotice />
        <AttireActions />
      </div>
    </div>
  )
}
