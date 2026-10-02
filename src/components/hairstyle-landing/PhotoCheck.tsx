import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react'
import { Check, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHairstyleLandingStore } from '@/store/hairstyle-landing-store'
import { CATALOG_OPTIONS, CHECK_COPY, PHOTO_TIPS, type CatalogKind } from './data'
import { StepHead } from './FlowScreens'
import { CTA, Photo, Serif, Tick } from './ui'
import { C, FONT, HC } from './tokens'

/**
 * Step one, in the flow modal: the photo is scanned while the person picks a
 * catalog, and the free style starts the moment both are done.
 *
 * The scan is shown, not described: a rainbow beam sweeps the photo, corner
 * brackets lock onto the face once it is found, and a clear photo gets a rim
 * of light, a "Photo cleared" pill and a small burst of sparkles. Each check
 * reads as it runs ("Looking for your face") and settles on its result.
 */

const EASE = [0.23, 1, 0.32, 1] as const
const POP = { type: 'spring', stiffness: 560, damping: 20 } as const
const SPARKLE = 'M14 0c1.7 8.9 4.4 11.6 14 14-9.6 2.4-12.3 5.1-14 14-1.7-8.9-4.4-11.6-14-14 9.6-2.4 12.3-5.1 14-14Z'

type Mark = 0 | 1 | -1
type RowState = 'queued' | 'running' | 'passed' | 'failed'

function rowStates(checks: Mark[], verdict: 'pass' | 'fail' | null): RowState[] {
  const running = verdict === null ? checks.findIndex((c) => c === 0) : -1
  return checks.map((c, i) => (c === 1 ? 'passed' : c === -1 ? 'failed' : i === running ? 'running' : 'queued'))
}

// ── The scan ────────────────────────────────────────────────────────────────

/** Corner brackets framing the face; they lock on (scale in) once the face check passes. */
function FaceBrackets({ on, failed }: { on: boolean; failed: boolean }) {
  const color = failed ? C.error : '#fff'
  const corner = 'absolute size-[18%] max-w-[22px] max-h-[22px] border-solid'
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-[22%] right-[22%] top-[13%] bottom-[38%]"
      initial={false}
      animate={{ opacity: on || failed ? 1 : 0, scale: on || failed ? 1 : 1.25 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.35))' }}
    >
      <span className={cn(corner, 'left-0 top-0 rounded-tl-[6px] border-l-2 border-t-2')} style={{ borderColor: color }} />
      <span className={cn(corner, 'right-0 top-0 rounded-tr-[6px] border-r-2 border-t-2')} style={{ borderColor: color }} />
      <span className={cn(corner, 'bottom-0 left-0 rounded-bl-[6px] border-b-2 border-l-2')} style={{ borderColor: color }} />
      <span className={cn(corner, 'bottom-0 right-0 rounded-br-[6px] border-b-2 border-r-2')} style={{ borderColor: color }} />
    </motion.div>
  )
}

/** Five sparkles that burst from the card's edges when the photo clears. */
const BURST = [
  { x: '-6%', y: '8%', s: 14, c: '#14DBDB', d: 0 },
  { x: '96%', y: '4%', s: 18, c: '#FC81F1', d: 0.06 },
  { x: '100%', y: '58%', s: 12, c: '#FFA755', d: 0.12 },
  { x: '-8%', y: '70%', s: 16, c: '#E3F86E', d: 0.09 },
  { x: '46%', y: '-6%', s: 11, c: '#36C97E', d: 0.15 },
]

function ScanPhoto({ photo, checks, verdict }: { photo: string | null; checks: Mark[]; verdict: 'pass' | 'fail' | null }) {
  const reduce = useReducedMotion()
  const scanning = verdict === null
  const cleared = verdict === 'pass'
  return (
    <div className="relative w-[112px] shrink-0 md:w-full">
      {/* rim of light once the photo clears */}
      <AnimatePresence>
        {cleared && (
          <motion.div
            key="rim"
            aria-hidden
            className="absolute -inset-[3px] rounded-[23px] blur-[6px]"
            style={{ background: HC.rainbow }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.55] }}
            transition={{ duration: 1.1, times: [0, 0.35, 1], ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] bg-[#E5E6E6] shadow-[0_8px_28px_rgba(0,4,9,0.12)] md:rounded-[20px]">
        <Photo src={photo} label="Your uploaded photo" pos="center 22%" />

        {/* dot grid + sweeping beam while the checks run */}
        <AnimatePresence>
          {scanning && (
            <motion.div key="scan" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.4 } }}>
              <div
                aria-hidden
                className="absolute inset-0 opacity-40 mix-blend-overlay"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1.1px, transparent 1.4px)', backgroundSize: '9px 9px' }}
              />
              {!reduce && (
                <motion.div
                  aria-hidden
                  className="absolute inset-x-0 top-[-40%] h-[40%]"
                  animate={{ y: ['0%', '350%'] }}
                  transition={{ duration: 1.7, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
                >
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(252,129,241,0.10) 55%, rgba(20,219,219,0.28) 100%)' }} />
                  <div className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: HC.rainbow, boxShadow: '0 0 12px 2px rgba(255,255,255,0.75)' }} />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <FaceBrackets on={checks[0] === 1} failed={checks[0] === -1} />

        <AnimatePresence>
          {cleared && (
            <motion.span
              key="cleared"
              className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-white/90 py-1.5 pl-1.5 pr-3 text-[12px] leading-[14px] shadow-[0_4px_14px_rgba(0,4,9,0.12)] backdrop-blur-md md:bottom-3 md:text-[13px]"
              style={{ ...FONT, fontWeight: 450, color: C.text }}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...POP, delay: 0.1 }}
            >
              <span className="flex size-[18px] items-center justify-center rounded-full" style={{ background: C.text }}>
                <Check size={11} strokeWidth={2.6} color="#fff" aria-hidden />
              </span>
              <span className="hidden md:inline">Photo cleared</span>
              <span className="md:hidden">Cleared</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* sparkles burst out when it clears */}
      {cleared &&
        !reduce &&
        BURST.map((b, i) => (
          <motion.svg
            key={i}
            viewBox="0 0 28 28"
            aria-hidden
            className="pointer-events-none absolute"
            style={{ left: b.x, top: b.y, width: b.s, height: b.s, color: b.c }}
            initial={{ scale: 0, opacity: 0, rotate: -30 }}
            animate={{ scale: [0, 1.15, 0], opacity: [0, 1, 0], rotate: [-30, 0, 20] }}
            transition={{ duration: 1.1, delay: 0.15 + b.d, ease: 'easeOut' }}
          >
            <path d={SPARKLE} fill="currentColor" />
          </motion.svg>
        ))}
    </div>
  )
}

function CheckIcon({ state }: { state: RowState }) {
  return (
    <span className="relative flex size-5 shrink-0 items-center justify-center">
      <AnimatePresence mode="popLayout" initial={false}>
        {state === 'passed' ? (
          <motion.span key="ok" className="flex size-5 items-center justify-center rounded-full" style={{ background: C.text }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={POP}>
            <Check size={12} strokeWidth={2.6} color="#fff" aria-hidden />
          </motion.span>
        ) : state === 'failed' ? (
          <motion.span
            key="no"
            className="flex size-5 items-center justify-center rounded-full"
            style={{ background: C.error }}
            initial={{ scale: 0 }}
            animate={{ scale: 1, x: [0, -3, 3, -2, 2, 0] }}
            transition={{ scale: POP, x: { duration: 0.4, delay: 0.1 } }}
          >
            <X size={11} strokeWidth={2.8} color="#fff" aria-hidden />
          </motion.span>
        ) : state === 'running' ? (
          <motion.span key="run" className="size-[18px] animate-spin rounded-full border-2" style={{ borderColor: '#E1E2E5', borderTopColor: C.text }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
        ) : (
          <motion.span key="wait" className="size-2 rounded-full" style={{ background: '#D9DADD' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
        )}
      </AnimatePresence>
    </span>
  )
}

/**
 * One line at a time: the check that is running rolls over to the next as each
 * passes, then settles on the result. Three pips keep count. Keeps the photo
 * column no taller than the catalog cards beside it.
 */
function CheckTicker({ states, verdict }: { states: RowState[]; verdict: 'pass' | 'fail' | null }) {
  const running = states.findIndex((st) => st === 'running')
  const failed = states.findIndex((st) => st === 'failed')
  const lastPassed = states.lastIndexOf('passed')
  const i = running >= 0 ? running : failed >= 0 ? failed : Math.max(lastPassed, 0)
  const cleared = verdict === 'pass'
  const state: RowState = cleared ? 'passed' : states[i]
  const text = cleared
    ? 'All 3 checks passed'
    : state === 'passed'
      ? CHECK_COPY[i].passed
      : state === 'failed'
        ? CHECK_COPY[i].failed
        : `${CHECK_COPY[i].running}…`
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2.5 md:mt-4" aria-live="polite" style={FONT}>
      <CheckIcon state={state} />
      <span className="relative h-[18px] min-w-0 flex-1 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={text}
            className="absolute inset-0 truncate text-[14px] leading-[18px]"
            style={{ fontWeight: state === 'passed' ? 450 : 420, color: state === 'failed' ? C.error : state === 'passed' ? C.text : C.secondary }}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="flex shrink-0 items-center gap-1" aria-hidden>
        {states.map((st, k) => (
          <motion.span
            key={k}
            className="h-1.5 rounded-full"
            initial={false}
            animate={{
              width: k === i && !cleared && st === 'running' ? 14 : 6,
              backgroundColor: st === 'passed' ? C.text : st === 'failed' ? C.error : st === 'running' ? '#9A9DA3' : '#D9DADD',
            }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          />
        ))}
      </span>
    </div>
  )
}

// ── The catalog choice ──────────────────────────────────────────────────────

/** Three catalog tiles fanned like a hand of cards; they spread on hover and spread wider when chosen. */
const FAN_TILE: Variants = {
  rest: (i: number) => ({ x: (i - 1) * 17, rotate: (i - 1) * 9, y: i === 1 ? -2 : 0 }),
  hover: (i: number) => ({ x: (i - 1) * 22, rotate: (i - 1) * 13, y: i === 1 ? -5 : 0 }),
  on: (i: number) => ({ x: (i - 1) * 24, rotate: (i - 1) * 15, y: i === 1 ? -6 : 1 }),
}

function Fan({ tiles }: { tiles: [string, string, string] }) {
  return (
    <span className="relative block h-[64px] w-[96px] shrink-0" aria-hidden>
      {tiles.map((src, i) => (
        <motion.span
          key={src}
          custom={i}
          variants={FAN_TILE}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          className="absolute left-1/2 top-1/2 -ml-[23px] -mt-[28px] block h-[56px] w-[46px] overflow-hidden rounded-[10px] border-2 border-white bg-[#EDEDEE] shadow-[0_3px_10px_rgba(0,4,9,0.16)]"
          style={{ zIndex: i === 1 ? 2 : 1 }}
        >
          <img src={src} alt="" className="size-full object-cover" draggable={false} />
        </motion.span>
      ))}
    </span>
  )
}

function CatalogCard({ kind, title, body, fan, i }: { kind: CatalogKind; title: string; body: string; fan: [string, string, string]; i: number }) {
  const on = useHairstyleLandingStore((s) => s.catalogKind === kind)
  const choose = useHairstyleLandingStore((s) => s.chooseCatalog)
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={on}
      onClick={() => choose(kind)}
      initial={{ opacity: 0, y: 10 }}
      animate={[on ? 'on' : 'rest', 'shown']}
      variants={{ shown: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.08 + i * 0.06, ease: EASE } } }}
      whileHover={on ? undefined : 'hover'}
      whileTap={{ scale: 0.985 }}
      className="relative flex w-full items-center gap-4 rounded-[18px] bg-white py-3.5 pl-3 pr-4 text-left transition-[box-shadow,background-color] duration-200 hover:bg-[#FAFAFB] md:py-4"
      style={{ ...FONT, boxShadow: on ? `inset 0 0 0 1.5px ${C.text}, 0 8px 22px rgba(0,4,9,0.08)` : `inset 0 0 0 1px ${HC.hairline}` }}
    >
      <Fan tiles={fan} />
      <span className="min-w-0 flex-1">
        <span className="block text-[17px] leading-[20px]" style={{ fontWeight: 450, color: C.text }}>
          {title}
        </span>
        <span className="mt-1 block text-[13px] leading-[17px]" style={{ fontWeight: 420, color: C.secondary }}>
          {body}
        </span>
      </span>
      <span
        className="flex size-[22px] shrink-0 items-center justify-center rounded-full transition-[box-shadow,background-color] duration-200"
        style={{ background: on ? C.text : '#fff', boxShadow: on ? 'none' : `inset 0 0 0 1.5px ${HC.stroke}` }}
      >
        <AnimatePresence>
          {on && (
            <motion.span key="tick" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={POP}>
              <Check size={12} strokeWidth={2.8} color="#fff" aria-hidden />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  )
}

function StatusLine({ catalogKind, verdict }: { catalogKind: CatalogKind | null; verdict: 'pass' | 'fail' | null }) {
  const starting = catalogKind && verdict === 'pass'
  const text = starting
    ? 'Starting your free style'
    : catalogKind
      ? 'Set chosen. We start the moment your photo clears.'
      : 'Pick one and your free style starts by itself.'
  return (
    <div className="relative mt-4 h-[18px] overflow-hidden text-center" aria-live="polite" style={FONT}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.p
          key={text}
          className="absolute inset-x-0 flex items-center justify-center gap-1.5 text-[13px] leading-[18px]"
          style={{ fontWeight: starting ? 450 : 420, color: starting ? C.text : C.secondary }}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {starting && <Loader2 size={13} className="animate-spin" aria-hidden />}
          {text}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

// ── The step ────────────────────────────────────────────────────────────────

function Failed({ onPick }: { onPick: () => void }) {
  const { photo, fail, catalogKind } = useHairstyleLandingStore()
  if (!fail) return null
  return (
    <div data-screen-label="Photo check failed">
      <StepHead
        eyebrow="Photo check failed"
        tone="error"
        title={
          <>
            We cannot use this pho<Serif>t</Serif>o
          </>
        }
        body="Nothing was generated and nothing was charged. One more photo and you are through."
      />
      <motion.div
        className="mt-7 flex flex-col gap-5 rounded-[20px] border p-4 sm:flex-row sm:items-start sm:p-5"
        style={{ background: HC.errorBg, borderColor: HC.errorStroke }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <div className="relative aspect-[4/5] w-[104px] shrink-0 overflow-hidden rounded-[12px] bg-[#E5E6E6]">
          <Photo src={photo} filter="saturate(.4)" label="The photo that failed" />
          <div className="absolute inset-0" style={{ background: 'rgba(219,72,72,0.16)' }} />
        </div>
        <div className="min-w-0 flex-1" style={FONT}>
          <p className="text-[18px] leading-[22px]" style={{ fontWeight: 450, color: C.text }}>
            {fail.title}
          </p>
          <p className="mt-2 text-[15px] leading-[21px]" style={{ fontWeight: 420, color: C.secondary }}>
            {fail.fix}
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {PHOTO_TIPS.map((t) => (
              <li key={t} className="flex items-start gap-2 text-[14px] leading-[18px]" style={{ fontWeight: 420, color: C.text }}>
                <span className="mt-0.5">
                  <Tick size={13} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
      <div className="mt-7 flex flex-col items-center gap-3">
        <CTA onClick={onPick}>Choose a different photo</CTA>
        <p className="text-center text-[13px] leading-[16px]" style={{ ...FONT, fontWeight: 420, color: C.secondary }}>
          {catalogKind ? 'We kept your style choice, so the next photo goes straight through.' : 'Your photo was not saved. Pick another and the checks run again.'}
        </p>
      </div>
    </div>
  )
}

export function PhotoCheck({ onPick }: { onPick: () => void }) {
  const { photo, checks, verdict, catalogKind } = useHairstyleLandingStore()
  if (verdict === 'fail') return <Failed onPick={onPick} />
  const states = rowStates(checks, verdict)

  return (
    <div data-screen-label="Photo check">
      <StepHead
        title={
          <>
            Which styles should we show y<Serif>o</Serif>u?
          </>
        }
        body="One tap sets the catalog of 40 hairstyles. We are checking your photo while you choose."
      />

      <div className="mt-7 grid items-start gap-5 md:mt-8 md:grid-cols-[208px_minmax(0,1fr)] md:gap-8">
        <div className="flex items-center gap-4 rounded-[20px] bg-[#F7F7F8] p-3 md:block md:rounded-none md:bg-transparent md:p-0">
          <ScanPhoto photo={photo} checks={checks} verdict={verdict} />
          <CheckTicker states={states} verdict={verdict} />
        </div>

        <div>
          <div role="radiogroup" aria-label="Catalog" className="flex flex-col gap-2.5">
            {CATALOG_OPTIONS.map((o, i) => (
              <CatalogCard key={o.kind} {...o} i={i} />
            ))}
          </div>
          <StatusLine catalogKind={catalogKind} verdict={verdict} />
        </div>
      </div>
    </div>
  )
}
