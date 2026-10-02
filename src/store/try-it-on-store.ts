import { create } from 'zustand'
import {
  BASE_PIECES,
  BASE_RENDER,
  GENERATING_STEPS,
  RENDERS,
  SLOT_SUGGESTIONS,
  ZARA_TEDDY,
  garmentById,
  resolveRender,
  type FoundItem,
  type Garment,
  type LinkProduct,
  type Render,
  type Slot,
  type UploadSample,
} from '@/components/try-it-on/try-it-on-data'

export type Look = { id: string; render: Render; pieces: Garment[]; favorite: boolean }

/**
 * Every bottom sheet in the flow. They share one sheet surface and stack, so
 * the back arrow pops one level and ✕ closes the lot (Figma's sheets all carry
 * both). `slot` is set when the sheet was opened from a builder slot — that is
 * what tells link/upload/collection which category the user is filling.
 */
export type SheetRoute =
  | { name: 'pick' }
  | { name: 'try'; garments: Garment[]; product?: LinkProduct; fromUpload?: boolean }
  | { name: 'link'; slot?: Slot; url?: string; toBuilder?: boolean }
  | { name: 'upload'; slot?: Slot; toBuilder?: boolean }
  | { name: 'upload-pieces'; sample: UploadSample; image: string }
  | { name: 'collection'; slot?: Slot }
  /** v3 opens it on a tab (a slot, or For you); v1 ignores it. */
  | { name: 'builder'; tab?: OutfitTab }
  | { name: 'slot'; slot: Slot }
  | { name: 'found'; slot?: Slot; image: string; items: FoundItem[]; title: string }
  | { name: 'not-found'; slot: Slot; image: string }
  | { name: 'swap'; slot: Slot }
  | { name: 'redo' }
  | { name: 'redo-upload' }
  | { name: 'guidelines' }
  | { name: 'credits' }

export type Banner =
  | { kind: 'info'; text: string }
  | { kind: 'error'; text: string }
  | { kind: 'favorite'; image: string }
  | { kind: 'success'; text: string }

type Draft = {
  pieces: Partial<Record<Slot, Garment>>
  /** Pieces a new pick pushed out, so the builder can offer "undo". */
  replaced: Partial<Record<Slot, Garment[]>>
  /** v2: slots "Style Me" must leave alone. */
  locked: Partial<Record<Slot, boolean>>
}

type Phase = 'idle' | 'generating' | 'failed' | 'refreshing-base'

/**
 * What the studio shows (Claude Design 4b/4c). `home` is two panels side by
 * side — the base, and the grid of past trials — that the user swipes between.
 * `look` is one past generation on its own, with no side peek. `pending` is the
 * render in progress (or the one that just failed).
 */
export type View =
  | { name: 'home'; panel: 0 | 1 }
  /** `fromGrid`: opened by tapping a Past Trials tile, so it grows out of that tile. */
  | { name: 'look'; id: string; fromGrid?: boolean }
  | { name: 'pending' }

/** Which slots a piece takes over — a dress fills both top and bottom. */
function conflictsOf(slot: Slot): Slot[] {
  if (slot === 'dress') return ['top', 'bottom', 'dress']
  if (slot === 'top' || slot === 'bottom') return [slot, 'dress']
  return [slot]
}

/** Put `piece` on top of `pieces`, dropping whatever it replaces. */
export function withPiece(pieces: Garment[], piece: Garment): Garment[] {
  const out = conflictsOf(piece.slot)
  return [...pieces.filter((p) => !out.includes(p.slot)), piece]
}

/** Take a piece off. Top and bottom fall back to the base photo's own. */
export function withoutSlot(pieces: Garment[], slot: Slot): Garment[] {
  let next = pieces.filter((p) => p.slot !== slot)
  const has = (s: Slot) => next.some((p) => p.slot === s)
  if (!has('dress')) {
    if (!has('top')) next = [BASE_PIECES[0], ...next]
    if (!has('bottom')) next = [...next, BASE_PIECES[1]]
  }
  return next
}

/** Fill whatever the user left empty with the base photo's own top and bottom. */
export function withBase(pieces: Garment[]): Garment[] {
  const has = (s: Slot) => pieces.some((p) => p.slot === s)
  if (has('dress')) return pieces
  return [...(has('top') ? [] : [BASE_PIECES[0]]), ...pieces, ...(has('bottom') ? [] : [BASE_PIECES[1]])]
}

const notBase = (p: Garment) => p.source !== 'base'

/** The builder only ever holds what the user picked — the base fills the rest when generating. */
const toDraft = (pieces: Garment[]): Draft => ({
  pieces: Object.fromEntries(pieces.filter(notBase).map((p) => [p.slot, p])),
  replaced: {},
  locked: {},
})

const idsOf = (pieces: Garment[]) =>
  pieces
    .map((p) => p.id)
    .sort()
    .join('|')

const BASE_LOOK: Look = { id: 'base', render: BASE_RENDER, pieces: BASE_PIECES, favorite: false }

const params = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search)
const START_CREDITS = Number(params.get('credits') ?? 50)

/**
 * `?user_type=new` (the default) starts with no history: no past trials, so no
 * side peek. `?user_type=repeat` starts with 16 past trials already in the grid.
 */
export const USER_TYPE: 'new' | 'repeat' = params.get('user_type') === 'repeat' ? 'repeat' : 'new'

/**
 * `?version=1` (the default) completes the look in the slot-list sheet.
 * `?version=2` opens the full-screen "Create Look" grid, after Doji.
 * `?version=3` merges picking and completing into one outfit sheet: the same
 * tray of slots starts a look and completes it. Other versions fall back to 1.
 */
const versionParam = params.get('version')
export const VERSION: 1 | 2 | 3 = versionParam === '2' ? 2 : versionParam === '3' ? 3 : 1

/** v3 outfit sheet tabs: For you, then one per slot. */
export type OutfitTab = 'for-you' | Slot

/** Slots "Style Me" fills — the ones we have catalog pieces for. */
const STYLE_ME_SLOTS: Slot[] = ['top', 'bottom', 'outerwear']

/** A returning user's history: the pre-rendered looks, cycled to 16 trials, newest first. */
function seedLooks(): Look[] {
  const pieceById = (id: string) => garmentById(id) ?? ZARA_TEDDY.items.find((i) => i.id === id)
  const renders = RENDERS.filter((r) => r !== BASE_RENDER)
  return Array.from({ length: 16 }, (_, i) => {
    const render = renders[i % renders.length]
    return {
      id: `seed-${i}`,
      render,
      pieces: render.pieces.map(pieceById).filter((p): p is Garment => !!p),
      favorite: i === 2 || i === 7,
    }
  })
}
const startLooks = () => (USER_TYPE === 'repeat' ? seedLooks() : [])

let timers: number[] = []
const later = (ms: number, fn: () => void) => {
  timers.push(window.setTimeout(fn, ms))
}
const clearTimers = () => {
  timers.forEach((t) => window.clearTimeout(t))
  timers = []
}

export type TryItOnState = {
  credits: number
  base: Look
  /** Past generations, newest first — the "Past trials" grid. */
  looks: Look[]
  view: View
  phase: Phase
  genStep: number
  genPieces: Garment[]
  /** Photo the pending render started from, shown blurred while it works. */
  genSource: string
  /** Id of the look the pending render started from ('base' for the base). */
  genFrom: string
  /** `?fail=1` makes the next generation fail, to reach Figma's failure state. */
  failNext: boolean
  sheets: SheetRoute[]
  /** One-line confirmation shown at the top of the builder ("2 items added"). */
  builderNotice: string | null
  draft: Draft | null
  /** v2: the full-screen Create Look page is up. */
  builderOpen: boolean
  banner: Banner | null
  bannerKey: number

  openSheet: (route: SheetRoute) => void
  pushSheet: (route: SheetRoute) => void
  replaceSheet: (route: SheetRoute) => void
  popSheet: () => void
  /** Pop back to the nearest sheet called `name` (e.g. return to the builder). */
  popTo: (name: SheetRoute['name']) => void
  closeSheets: () => void
  /** Back to the builder after adding a piece — a sheet in v1, the page underneath in v2. */
  returnToBuilder: () => void
  setBuilderNotice: (text: string | null) => void

  setView: (view: View) => void
  showBanner: (banner: Banner) => void
  dismissBanner: () => void

  tryOn: (pieces: Garment[]) => void
  retry: () => void
  /** Like or unlike a look — the one on screen, or any trial in the grid by id. */
  toggleFavorite: (id?: string) => void
  createNewLook: () => void
  refreshBase: () => void
  buyCredits: (credits: number) => void

  openBuilder: (tab?: OutfitTab) => void
  closeBuilder: () => void
  toggleLock: (slot: Slot) => void
  styleMe: () => void
  setDraftPiece: (piece: Garment) => void
  undoReplace: (slot: Slot) => void
  /** Take a piece out of the draft — that slot falls back to the base. */
  removeDraftSlot: (slot: Slot) => void
  /** Swap the whole draft for these pieces (v3 Style me, and its undo). */
  setDraftPieces: (pieces: Garment[]) => void
  draftChanged: () => boolean

  reset: () => void
}

export const useTryItOnStore = create<TryItOnState>((set, get) => ({
  credits: START_CREDITS,
  base: BASE_LOOK,
  looks: startLooks(),
  view: { name: 'home', panel: 0 },
  phase: 'idle',
  genStep: 0,
  genPieces: [],
  genSource: BASE_LOOK.render.image,
  genFrom: 'base',
  failNext: params.get('fail') === '1',
  sheets: [],
  builderNotice: null,
  draft: null,
  builderOpen: false,
  banner: null,
  bannerKey: 0,

  openSheet: (route) => set({ sheets: [route] }),
  pushSheet: (route) => set((s) => ({ sheets: [...s.sheets, route] })),
  replaceSheet: (route) => set((s) => ({ sheets: [...s.sheets.slice(0, -1), route] })),
  popSheet: () => set((s) => ({ sheets: s.sheets.slice(0, -1) })),
  popTo: (name) =>
    set((s) => {
      const i = s.sheets.map((r) => r.name).lastIndexOf(name)
      return { sheets: i === -1 ? s.sheets : s.sheets.slice(0, i + 1) }
    }),
  closeSheets: () => set({ sheets: [], builderNotice: null }),
  returnToBuilder: () =>
    set((s) => {
      const i = s.sheets.map((r) => r.name).lastIndexOf('builder')
      return { sheets: i === -1 ? [] : s.sheets.slice(0, i + 1) }
    }),
  setBuilderNotice: (builderNotice) => set({ builderNotice }),

  setView: (view) => set({ view }),
  showBanner: (banner) => set((s) => ({ banner, bannerKey: s.bannerKey + 1 })),
  dismissBanner: () => set({ banner: null }),

  tryOn: (pieces) => {
    const s = get()
    if (s.credits < 1) {
      set({ sheets: [{ name: 'credits' }] })
      return
    }
    clearTimers()
    set((st) => ({
      credits: st.credits - 1,
      phase: 'generating',
      genStep: 0,
      genPieces: pieces,
      genSource: currentLook(st).render.image,
      genFrom: currentLook(st).id,
      sheets: [],
      builderNotice: null,
      // The draft stays so Create Look can slide away intact; opening the builder rebuilds it.
      builderOpen: false,
      view: { name: 'pending' },
      banner: { kind: 'info', text: 'Image is creating. 1 credit got used' },
      bannerKey: st.bannerKey + 1,
    }))
    GENERATING_STEPS.forEach((_, i) => i > 0 && later(i * 1500, () => set({ genStep: i })))
    later(GENERATING_STEPS.length * 1500, () => {
      if (get().failNext) {
        // A failed render refunds the credit — "No credits used".
        set((st) => ({
          phase: 'failed',
          failNext: false,
          credits: st.credits + 1,
          banner: { kind: 'error', text: "Image wasn't created. No credits used" },
          bannerKey: st.bannerKey + 1,
        }))
        return
      }
      const look: Look = {
        id: `look-${Date.now()}`,
        render: resolveRender(pieces),
        pieces,
        favorite: false,
      }
      // Open the result if the user is still watching it render; otherwise it lands in Past trials.
      set((st) => ({
        phase: 'idle',
        looks: [look, ...st.looks],
        view: st.view.name === 'pending' ? { name: 'look', id: look.id } : st.view,
        banner: st.view.name === 'pending' ? null : { kind: 'success', text: 'Your new look is in Past trials' },
        bannerKey: st.bannerKey + 1,
      }))
    })
  },

  retry: () => get().tryOn(get().genPieces),

  toggleFavorite: (id) => {
    const { looks, view } = get()
    const target = id ?? (view.name === 'look' ? view.id : undefined)
    const look = looks.find((l) => l.id === target)
    if (!look) return
    const favorite = !look.favorite
    set((st) => ({
      looks: st.looks.map((l) => (l.id === look.id ? { ...l, favorite } : l)),
      banner: favorite ? { kind: 'favorite', image: look.render.image } : null,
      bannerKey: st.bannerKey + 1,
    }))
  },

  // v3 starts a new look in the same outfit sheet, empty (everything is the base).
  createNewLook: () =>
    set((st) =>
      VERSION === 3
        ? {
            view: { name: 'home', panel: 0 },
            draft: toDraft(st.base.pieces),
            builderNotice: null,
            sheets: [{ name: 'builder', tab: 'for-you' }],
          }
        : { view: { name: 'home', panel: 0 }, sheets: [{ name: 'pick' }] },
    ),

  refreshBase: () => {
    clearTimers()
    set({ sheets: [], view: { name: 'home', panel: 0 }, phase: 'refreshing-base' })
    later(3500, () =>
      set((st) => ({
        phase: 'idle',
        banner: { kind: 'success', text: 'Your base is refreshed' },
        bannerKey: st.bannerKey + 1,
      })),
    )
  },

  buyCredits: (credits) =>
    set((st) => ({
      credits: st.credits + credits,
      sheets: [],
      banner: { kind: 'success', text: `${credits} credits added` },
      bannerKey: st.bannerKey + 1,
    })),

  openBuilder: (tab) =>
    set((st) =>
      VERSION === 2
        ? { draft: toDraft(currentLook(st).pieces), builderNotice: null, builderOpen: true, sheets: [] }
        : { draft: toDraft(currentLook(st).pieces), builderNotice: null, sheets: [{ name: 'builder', tab }] },
    ),

  closeBuilder: () => set({ builderOpen: false, sheets: [], builderNotice: null }),

  toggleLock: (slot) =>
    set((st) =>
      st.draft ? { draft: { ...st.draft, locked: { ...st.draft.locked, [slot]: !st.draft.locked[slot] } } } : st,
    ),

  // Fill every unlocked slot we have pieces for with a different suggestion.
  styleMe: () => {
    const { draft } = get()
    if (!draft) return
    const dressLocked = !!(draft.pieces.dress && draft.locked.dress)
    let styled = 0
    for (const slot of STYLE_ME_SLOTS) {
      if (draft.locked[slot] || (dressLocked && slot !== 'outerwear')) continue
      const current = get().draft?.pieces[slot]?.id
      const options = SLOT_SUGGESTIONS[slot].filter((id) => id !== current)
      const pick = garmentById(options[Math.floor(Math.random() * options.length)])
      if (pick) {
        get().setDraftPiece(pick)
        styled++
      }
    }
    set({ builderNotice: styled ? `Styled ${styled} pieces for you` : 'Everything is locked' })
  },

  setDraftPiece: (piece) =>
    set((st) => {
      if (!st.draft) return st
      const pieces = { ...st.draft.pieces }
      const pushedOut: Garment[] = []
      for (const slot of conflictsOf(piece.slot)) {
        const existing = pieces[slot]
        if (existing && existing.id !== piece.id) pushedOut.push(existing)
        delete pieces[slot]
      }
      pieces[piece.slot] = piece
      // Keep the first thing a slot replaced, so undo goes back to the look itself.
      const replaced = { ...st.draft.replaced }
      if (pushedOut.length && !replaced[piece.slot]) replaced[piece.slot] = pushedOut
      return { draft: { ...st.draft, pieces, replaced } }
    }),

  undoReplace: (slot) =>
    set((st) => {
      if (!st.draft) return st
      const pieces = { ...st.draft.pieces }
      delete pieces[slot]
      for (const p of st.draft.replaced[slot] ?? []) pieces[p.slot] = p
      const replaced = { ...st.draft.replaced }
      delete replaced[slot]
      return { draft: { ...st.draft, pieces, replaced } }
    }),

  removeDraftSlot: (slot) =>
    set((st) => {
      if (!st.draft) return st
      const pieces = { ...st.draft.pieces }
      const replaced = { ...st.draft.replaced }
      const locked = { ...st.draft.locked }
      delete pieces[slot]
      delete replaced[slot]
      delete locked[slot]
      return { draft: { pieces, replaced, locked } }
    }),

  setDraftPieces: (pieces) =>
    set({ draft: { pieces: Object.fromEntries(pieces.map((p) => [p.slot, p])), replaced: {}, locked: {} } }),

  draftChanged: () => {
    const s = get()
    if (!s.draft) return false
    return idsOf(Object.values(s.draft.pieces) as Garment[]) !== idsOf(currentLook(s).pieces.filter(notBase))
  },

  reset: () => {
    clearTimers()
    set({
      credits: START_CREDITS,
      base: BASE_LOOK,
      looks: startLooks(),
      view: { name: 'home', panel: 0 },
      phase: 'idle',
      genStep: 0,
      genPieces: [],
      genSource: BASE_LOOK.render.image,
      genFrom: 'base',
      sheets: [],
      builderNotice: null,
      draft: null,
      builderOpen: false,
      banner: null,
    })
  },
}))

/** The look on screen; the base on the home panels and while a render is pending. */
export function currentLook(s: Pick<TryItOnState, 'base' | 'looks' | 'view' | 'genFrom'>): Look {
  const { view } = s
  const id = view.name === 'look' ? view.id : view.name === 'pending' ? s.genFrom : 'base'
  return s.looks.find((l) => l.id === id) ?? s.base
}
