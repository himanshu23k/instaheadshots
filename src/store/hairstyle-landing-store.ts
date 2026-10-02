import { create } from 'zustand'
import { DEMO_PHOTO, FAILURES, SAMPLE_MSGS, styleNames, type CatalogKind, type CheckFailure, type SplashGender } from '@/components/hairstyle-landing/data'

/**
 * State for /hairstyle-landing, the standalone hairstyle funnel from the
 * "Magic Studio Try-On v3" flow. The landing page stays put; everything after
 * the upload runs in one flow surface over it (a modal on desktop, a bottom
 * sheet on phones): photo check + catalog → free style → offer (all 40 for $9)
 * → pay → save → gallery. Nothing is generated for real; timers stand in for
 * the backend.
 *
 * Query params for reaching every state:
 *   ?check=fail-first|auto|pass|fail — photo check outcome. `fail-first` (the
 *     default) fails the first upload on lighting and passes the next, so both
 *     states are seen; `auto` judges the real photo (under 500px fails).
 *   ?regens=N — free redos in the gallery (default 2).
 *   ?screen=check|check-fail|sampling|offer|pay|save|gallery — open a state
 *     directly, using a demo photo.
 */

export type Screen = 'landing' | 'check' | 'sampling' | 'offer' | 'pay' | 'save' | 'gallery'
export type TileState = 'queued' | 'working' | 'done'
type CheckMark = 0 | 1 | -1

const params = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search)
export const CHECK_OUTCOME = (['fail-first', 'auto', 'pass', 'fail'] as const).find((o) => o === params.get('check')) ?? 'fail-first'
const FREE_REGENS = Math.max(0, Number(params.get('regens') ?? 2) || 0)
export const START_SCREEN = params.get('screen')

type State = {
  /** Whose photos the landing page shows, set by the hero's Her / His switch (and the lookbook tabs). */
  look: SplashGender
  screen: Screen
  photo: string | null
  checks: [CheckMark, CheckMark, CheckMark]
  verdict: 'pass' | 'fail' | null
  fail: CheckFailure | null
  catalogKind: CatalogKind | null
  attempt: number
  sampleStep: number
  /** Catalog indexes being generated, in gallery order. */
  order: number[]
  tileState: TileState[]
  /** Bumped per style on a redo, so the regenerated look differs. Keyed by catalog index. */
  tileShift: Record<number, number>
  email: string
  savedAs: 'account' | 'guest' | null
  regenLeft: number
  downloadedAll: boolean
}

type Actions = {
  setLook: (look: SplashGender) => void
  upload: (file: File | undefined | null) => void
  chooseCatalog: (kind: CatalogKind) => void
  /** Offer → payment step. */
  checkout: () => void
  /** Payment step → back to the offer. */
  backToOffer: () => void
  pay: () => void
  setEmail: (email: string) => void
  save: (as: 'account' | 'guest') => void
  regenTile: (pos: number) => void
  redoSet: () => void
  markDownloadedAll: () => void
  /** Closes the flow and returns to the landing page. */
  reset: () => void
  /** Seeds a mid-flow state for ?screen=… */
  jumpTo: (screen: string) => void
}

const INITIAL: State = {
  look: 'women',
  screen: 'landing',
  photo: null,
  checks: [0, 0, 0],
  verdict: null,
  fail: null,
  catalogKind: null,
  attempt: 0,
  sampleStep: 0,
  order: [],
  tileState: [],
  tileShift: {},
  email: '',
  savedAs: null,
  regenLeft: FREE_REGENS,
  downloadedAll: false,
}

let timers: ReturnType<typeof setTimeout>[] = []
const clear = () => {
  timers.forEach(clearTimeout)
  timers = []
}
const after = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))

/** The landing page's own scroll container (App's route frame doesn't scroll). */
export const SCROLL_ID = 'hairstyle-landing-scroll'
/** The flow modal / sheet body; each step starts at its top. */
export const FLOW_SCROLL_ID = 'hairstyle-flow-scroll'
const toTop = () => requestAnimationFrame(() => document.getElementById(FLOW_SCROLL_ID)?.scrollTo({ top: 0 }))

export const useHairstyleLandingStore = create<State & Actions>((set, get) => {
  /** The free style starts by itself once the photo clears and a catalog is chosen — no confirm step. */
  const maybeStartSample = () => {
    const s = get()
    if (s.screen !== 'check' || s.verdict !== 'pass' || !s.catalogKind) return
    clear()
    set({ screen: 'sampling', sampleStep: 0 })
    toTop()
    SAMPLE_MSGS.forEach((_, i) => after(700 * (i + 1), () => set({ sampleStep: i + 1 })))
    after(700 * (SAMPLE_MSGS.length + 1), () => {
      set({ screen: 'offer' })
      toTop()
    })
  }

  const runCheck = (src: string, w: number, h: number) => {
    clear()
    const attempt = get().attempt + 1
    const firstFails = CHECK_OUTCOME === 'fail-first' && attempt === 1
    const forcePass = CHECK_OUTCOME === 'pass' || (CHECK_OUTCOME === 'fail-first' && attempt > 1)
    const forceFail = CHECK_OUTCOME === 'fail' || firstFails
    const small = forceFail || (!forcePass && Math.min(w, h) < 500)
    const wide = !forcePass && !forceFail && (w / h > 2.1 || h / w > 2.4)
    const fail = wide ? FAILURES.face : firstFails ? FAILURES.light : small ? FAILURES.small : null

    set({ screen: 'check', photo: src, checks: [0, 0, 0], verdict: null, fail: null, attempt })
    toTop()

    const mark = (i: number, ok: boolean) =>
      set((s) => {
        const checks = [...s.checks] as State['checks']
        checks[i] = ok ? 1 : -1
        return { checks }
      })

    ;[0, 1, 2].forEach((i) => {
      after(500 + i * 560, () => {
        if (fail && fail.step === i) {
          mark(i, false)
          after(360, () => set({ verdict: 'fail', fail }))
        } else if (!fail || i < fail.step) {
          mark(i, true)
        }
      })
    })
    if (!fail)
      after(2000, () => {
        set({ verdict: 'pass' })
        maybeStartSample()
      })
  }

  /** Generation begins at payment and keeps running behind the save screen. The free style (index 0) is already done. */
  const startGeneration = (order: number[], bumpShift?: number) => {
    const states: TileState[] = order.map((_, pos) => (pos === 0 ? 'done' : 'queued'))
    clear()
    const tileShift = { ...get().tileShift }
    if (bumpShift) order.forEach((idx) => (tileShift[idx] = (tileShift[idx] ?? 0) + bumpShift))
    set({ order, tileState: states, tileShift })
    order.forEach((_, pos) => {
      if (pos === 0) return
      after(420 * pos, () =>
        set((s) => {
          const tileState = [...s.tileState]
          tileState[pos] = 'done'
          return { tileState }
        }),
      )
    })
  }

  const allIndexes = () => styleNames(get().catalogKind).map((_, i) => i)

  return {
    ...INITIAL,

    setLook: (look) => set({ look }),

    upload: (file) => {
      if (!file || !file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const src = e.target?.result as string
        const probe = new Image()
        probe.onload = () => runCheck(src, probe.naturalWidth, probe.naturalHeight)
        probe.onerror = () => runCheck(src, 1000, 1000)
        probe.src = src
      }
      reader.readAsDataURL(file)
    },

    chooseCatalog: (kind) => {
      set({ catalogKind: kind })
      maybeStartSample()
    },

    checkout: () => {
      set({ screen: 'pay' })
      toTop()
    },
    backToOffer: () => {
      set({ screen: 'offer' })
      toTop()
    },

    pay: () => {
      set({ screen: 'save' })
      toTop()
      startGeneration(allIndexes())
    },

    setEmail: (email) => set({ email }),

    save: (as) => {
      set({ savedAs: as, screen: 'gallery' })
      toTop()
    },

    regenTile: (pos) => {
      const { regenLeft, order } = get()
      if (regenLeft <= 0) return
      const idx = order[pos]
      set((s) => {
        const tileState = [...s.tileState]
        tileState[pos] = 'working'
        return { tileState, regenLeft: regenLeft - 1 }
      })
      after(1700, () =>
        set((s) => {
          const tileState = [...s.tileState]
          tileState[pos] = 'done'
          return { tileState, tileShift: { ...s.tileShift, [idx]: (s.tileShift[idx] ?? 0) + 5 } }
        }),
      )
    },

    redoSet: () => {
      const { regenLeft, order } = get()
      if (regenLeft <= 0) return
      set({ regenLeft: regenLeft - 1 })
      startGeneration([...order], 7)
      toTop()
    },

    markDownloadedAll: () => set({ downloadedAll: true }),

    reset: () => {
      clear()
      // Starting over keeps whose photos the landing page shows.
      set({ ...INITIAL, look: get().look })
    },

    jumpTo: (screen) => {
      clear()
      const base: State = { ...INITIAL, photo: DEMO_PHOTO, catalogKind: 'women', attempt: 1 }
      switch (screen) {
        case 'check':
          set({ ...base, catalogKind: null, attempt: 0 })
          runCheck(DEMO_PHOTO, 1000, 1000)
          return
        case 'check-fail':
          set({ ...base, screen: 'check', checks: [1, -1, 0], verdict: 'fail', fail: FAILURES.light })
          return
        case 'sampling':
          set({ ...base, screen: 'check', verdict: 'pass', checks: [1, 1, 1] })
          maybeStartSample()
          return
        case 'offer':
        case 'pay':
          set({ ...base, screen })
          return
        case 'save':
          set({ ...base, screen: 'pay' })
          get().pay()
          return
        case 'gallery': {
          const order = styleNames('women').map((_, i) => i)
          set({ ...base, screen: 'gallery', savedAs: 'account', order, tileState: order.map(() => 'done') })
          return
        }
      }
    },
  }
})

export function useAllDone() {
  return useHairstyleLandingStore((s) => s.order.length > 0 && s.tileState.every((t) => t === 'done'))
}
