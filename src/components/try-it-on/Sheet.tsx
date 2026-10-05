import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useDragControls } from 'motion/react'
import { ArrowLeft, X } from 'lucide-react'
import { VERSION, useTryItOnStore, type SheetRoute } from '@/store/try-it-on-store'
import { Credits } from './ui'
import { C, FONT } from './tokens'
import { CollectionSheet, LinkSheet, PickSheet, TrySheet, UploadPiecesSheet, UploadSheet } from './sheets/pick-sheets'
import { BuilderSheet, FoundSheet, NotFoundSheet, SlotSheet, SwapSheet } from './sheets/builder-sheets'
import { OutfitSheet } from './sheets/outfit-sheet'
import { CompleteLookSheet } from './sheets/complete-look-sheet'
import { AttireSheet, OutfitPanelSheet } from './sheets/outfit-panel'
import { CreditsSheet, GuidelinesSheet, RedoSheet, RedoUploadSheet } from './sheets/account-sheets'

const EASE = [0.32, 0.72, 0, 1] as const

function SheetBody({ route }: { route: SheetRoute }) {
  switch (route.name) {
    case 'pick':
      return <PickSheet />
    case 'try':
      return <TrySheet route={route} />
    case 'link':
      return <LinkSheet route={route} />
    case 'upload':
      return <UploadSheet route={route} />
    case 'upload-pieces':
      return <UploadPiecesSheet route={route} />
    case 'collection':
      return <CollectionSheet route={route} />
    case 'builder':
      // v3 picks and completes in one outfit sheet, v4 in the wide asset-type sheet; v1 in the slot list.
      if (VERSION === 4) return <CompleteLookSheet route={route} />
      return VERSION === 3 ? <OutfitSheet route={route} /> : <BuilderSheet />
    case 'slot':
      return <SlotSheet route={route} />
    case 'found':
      return <FoundSheet route={route} />
    case 'not-found':
      return <NotFoundSheet route={route} />
    case 'swap':
      return <SwapSheet route={route} />
    case 'redo':
      return <RedoSheet />
    case 'redo-upload':
      return <RedoUploadSheet />
    case 'guidelines':
      return <GuidelinesSheet />
    case 'credits':
      return <CreditsSheet />
    case 'panel':
      return <OutfitPanelSheet />
    case 'attire':
      return <AttireSheet />
  }
}

/**
 * The one bottom sheet every step of the flow renders into. Steps stack (back
 * pops one, ✕ closes them all), the panel's height eases between steps instead
 * of jumping, and it can be dragged down to dismiss.
 */
export function SheetHost() {
  const sheets = useTryItOnStore((s) => s.sheets)
  const closeSheets = useTryItOnStore((s) => s.closeSheets)
  const top = sheets.at(-1)
  const depth = sheets.length
  // v4's Complete the look is Figma's 896 desktop sheet; every other step keeps the phone width.
  const wide = VERSION === 4 && top?.name === 'builder'
  const drag = useDragControls()

  // Measure the active step so the panel can animate to its height.
  const innerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | 'auto'>('auto')
  useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [top])

  // Remember whether we went deeper or back, so steps slide the right way.
  const [prevDepth, setPrevDepth] = useState(depth)
  const [direction, setDirection] = useState(1)
  if (prevDepth !== depth) {
    setPrevDepth(depth)
    setDirection(depth > prevDepth ? 1 : -1)
  }

  useEffect(() => {
    if (!top) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeSheets()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [top, closeSheets])

  return (
    <AnimatePresence>
      {top && (
        <motion.div key="sheet-layer" className="pointer-events-none fixed inset-0 z-40" style={FONT}>
          <motion.div
            className="pointer-events-auto absolute inset-0"
            style={{ background: C.overlay }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            onClick={closeSheets}
          />
          {/* v1–v3 live in a 440 phone column, so their sheets match it. v4 fills the window
              below the web breakpoint, so its sheets go edge to edge there. */}
          <div
            className={`absolute inset-x-0 bottom-0 mx-auto flex w-full justify-center ${
              wide ? 'web:max-w-[896px]' : VERSION === 4 ? 'web:max-w-[440px]' : 'max-w-[440px]'
            }`}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              className="pointer-events-auto relative w-full overflow-hidden rounded-t-[16px] bg-white"
              style={{ filter: 'drop-shadow(0px -2px 6px rgba(0,0,0,0.06))', maxHeight: '90dvh' }}
              initial={{ y: '100%' }}
              animate={{ y: 0, height }}
              exit={{ y: '100%' }}
              transition={{ y: { duration: 0.42, ease: EASE }, height: { duration: 0.32, ease: EASE } }}
              drag="y"
              dragListener={false}
              dragControls={drag}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120 || info.velocity.y > 600) closeSheets()
              }}
            >
              {/* Grab handle — Figma "Progress Bar"; dragging it pulls the sheet down. */}
              <div
                className="absolute inset-x-0 top-0 z-10 flex h-7 cursor-grab touch-none justify-center pt-3 active:cursor-grabbing"
                onPointerDown={(e) => drag.start(e)}
              >
                <span className="h-1 w-12 rounded-full" style={{ background: C.grey12 }} />
              </div>
              <div ref={innerRef} className="flex flex-col" style={{ maxHeight: '90dvh' }}>
                <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                  <motion.div
                    key={`${depth}-${top.name}`}
                    custom={direction}
                    variants={{
                      enter: (d: number) => ({ opacity: 0, x: d * 24 }),
                      center: { opacity: 1, x: 0 },
                      exit: (d: number) => ({ opacity: 0, x: d * -24 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                    className="flex min-h-0 flex-1 flex-col"
                  >
                    <SheetBody route={top} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Layout pieces every step uses ────────────────────────────────────────────

/**
 * Figma "Section Header": a row with back on the left and credits / ✕ on the
 * right, then the title (24/26, 450) and an optional subtitle under it.
 */
export function SheetHeader({
  title,
  subtitle,
  back = true,
  credits = false,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  back?: boolean
  credits?: boolean
}) {
  const popSheet = useTryItOnStore((s) => s.popSheet)
  const closeSheets = useTryItOnStore((s) => s.closeSheets)
  const value = useTryItOnStore((s) => s.credits)
  const canGoBack = useTryItOnStore((s) => s.sheets.length > 1)

  return (
    <div className="flex shrink-0 flex-col gap-4 px-6 pt-6">
      <div className="flex h-6 items-center justify-between">
        {back ? (
          <button
            type="button"
            onClick={canGoBack ? popSheet : closeSheets}
            aria-label="Back"
            className="-ml-1 p-1 transition-opacity hover:opacity-70"
          >
            <ArrowLeft size={22} strokeWidth={1.5} color={C.text} />
          </button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          {credits && (
            <>
              <Credits value={value} />
              <span className="h-4 w-px" style={{ background: C.grey12 }} aria-hidden />
            </>
          )}
          <button type="button" onClick={closeSheets} aria-label="Close" className="-mr-1 p-1 transition-opacity hover:opacity-70">
            <X size={24} strokeWidth={1.5} color={C.text} />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-[24px] leading-[26px] tracking-[-0.288px]" style={{ fontWeight: 450, color: C.text }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-[16px] leading-[18px]" style={{ fontWeight: 420, color: C.secondary }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

/** Scrollable middle of a step. */
export function SheetScroll({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6 pt-6 ${className ?? ''}`}>
      <div className="flex flex-col gap-6 pb-6">{children}</div>
    </div>
  )
}

/** Docked footer — CTA plus any secondary link, with Figma's "cta wrapper" shadow when content scrolls under it. */
export function SheetFooter({ children, shadow = false }: { children: React.ReactNode; shadow?: boolean }) {
  return (
    <div
      className="relative flex shrink-0 flex-col gap-4 bg-white px-6 pb-6 pt-3"
      style={shadow ? { boxShadow: '0 -2px 12px rgba(0,0,0,0.06)' } : undefined}
    >
      {children}
    </div>
  )
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[16px] leading-[18px]" style={{ fontWeight: 420, color: C.secondary }}>
      {children}
    </p>
  )
}

export function Divider() {
  return <div className="h-px w-full shrink-0" style={{ background: C.grey12 }} />
}
