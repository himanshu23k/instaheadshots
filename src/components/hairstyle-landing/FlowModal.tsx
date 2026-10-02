import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { AnimatePresence, motion, useDragControls, type PanInfo } from 'motion/react'
import { X } from 'lucide-react'
import { FLOW_SCROLL_ID, SCROLL_ID, useHairstyleLandingStore, type Screen } from '@/store/hairstyle-landing-store'
import { Pay, Sampling } from './FlowScreens'
import { PhotoCheck } from './PhotoCheck'
import { C, FONT } from './tokens'

/**
 * The short steps of the flow, in a centred modal on desktop and a bottom
 * sheet on phones (the Figma sheet: 24px top radius, grabber, ✕, drag down to
 * close): the photo check and the free style generating, over the landing
 * page, then checkout over the offer page. Everything from the first
 * watermarked result on (offer, save, gallery) is its own page.
 */

const EASE = [0.32, 0.72, 0, 1] as const
type ModalScreen = 'check' | 'sampling' | 'pay'
const WIDTH: Record<ModalScreen, number> = { check: 760, sampling: 560, pay: 520 }
const isModal = (s: Screen): s is ModalScreen => s in WIDTH

const desktopQuery = '(min-width: 768px)'
function useIsDesktop() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(desktopQuery)
      m.addEventListener('change', cb)
      return () => m.removeEventListener('change', cb)
    },
    () => window.matchMedia(desktopQuery).matches,
    () => true,
  )
}

function Step({ screen, onPick }: { screen: Screen; onPick: () => void }) {
  switch (screen) {
    case 'check':
      return <PhotoCheck onPick={onPick} />
    case 'sampling':
      return <Sampling />
    case 'pay':
      return <Pay />
    default:
      return null
  }
}

function IconButton({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-[40px] items-center justify-center rounded-[12px] transition-[background-color,transform] duration-200 hover:bg-[#EDEDEE] active:scale-[0.94]"
      style={{ background: C.grey03, color: C.text }}
    >
      {children}
    </button>
  )
}

export function FlowModal({ onPick }: { onPick: () => void }) {
  const screen = useHairstyleLandingStore((s) => s.screen)
  const reset = useHairstyleLandingStore((s) => s.reset)
  const backToOffer = useHairstyleLandingStore((s) => s.backToOffer)
  const desktop = useIsDesktop()
  const drag = useDragControls()
  const open = isModal(screen)
  // Closing checkout returns to the offer; closing the early steps abandons the run.
  // The free style can't be abandoned mid-generation: no ✕, and backdrop, Escape and drag do nothing.
  const dismissible = screen !== 'sampling'
  const close = useCallback(() => {
    if (!dismissible) return
    if (screen === 'pay') backToOffer()
    else reset()
  }, [dismissible, screen, backToOffer, reset])

  // Hold the page still underneath, and close on Escape.
  useEffect(() => {
    if (!open) return
    const page = document.getElementById(SCROLL_ID)
    const prev = page?.style.overflowY ?? ''
    if (page) page.style.overflowY = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => {
      if (page) page.style.overflowY = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) close()
  }

  const body = (
    <>
      <div className="flex shrink-0 items-center justify-between px-4 pb-1 pt-4 md:px-5 md:pt-5">
        <span className="size-[40px]" />
        {dismissible ? (
          <IconButton onClick={close} label="Close">
            <X size={18} strokeWidth={1.6} />
          </IconButton>
        ) : (
          <span className="size-[40px]" />
        )}
      </div>
      <div id={FLOW_SCROLL_ID} className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-8 md:px-[40px] md:pb-[40px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
            <Step screen={screen} onPick={onPick} />
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="flow"
          className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={FONT}
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 backdrop-blur-[6px]"
            style={{ background: 'rgba(0,4,9,0.5)' }}
            onClick={close}
          />
          {desktop ? (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Hairstyle try-on"
              className="relative flex max-h-[min(880px,calc(100dvh-48px))] w-full flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(0,4,9,0.28)]"
              initial={{ opacity: 0, scale: 0.96, y: 16, maxWidth: WIDTH[screen as ModalScreen] }}
              animate={{ opacity: 1, scale: 1, y: 0, maxWidth: WIDTH[screen as ModalScreen] ?? 600 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {body}
            </motion.div>
          ) : (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Hairstyle try-on"
              className="relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-[24px] bg-white"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.45, ease: EASE }}
              drag="y"
              dragListener={false}
              dragControls={drag}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={onDragEnd}
            >
              {/* grabber: drag down to close */}
              <div
                className={dismissible ? 'flex shrink-0 cursor-grab touch-none justify-center pt-3 active:cursor-grabbing' : 'flex shrink-0 justify-center pt-3'}
                onPointerDown={dismissible ? (e) => drag.start(e) : undefined}
              >
                <span className="h-1 w-12 rounded-full transition-opacity duration-300" style={{ background: '#E1E2E5', opacity: dismissible ? 1 : 0 }} />
              </div>
              {body}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
