import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { SCROLL_ID, START_SCREEN, useHairstyleLandingStore, type Screen } from '@/store/hairstyle-landing-store'
import { FlowModal } from './FlowModal'
import { Gallery, Offer, SaveScreen } from './FlowScreens'
import { Footer, Landing } from './Landing'
import { Button, Container, MagicStudioLogo } from './ui'
import { FONT } from './tokens'

/**
 * /hairstyle-landing — the standalone hairstyle try-on funnel.
 *
 * Flow and copy follow the "Magic Studio Try-On v3" Claude Design file; the
 * page's design language follows magicstudio.com; components and imagery
 * follow the Figma handover (qcHjho1pUqaNeuYZpfsrG9: MWEB 157:8466, WEB
 * 169:21446).
 *
 * The photo check and the free style generating run in a modal over the
 * landing page. From the first watermarked result on, each step is its own
 * page: the offer (with checkout in a modal over it), then save, then the
 * gallery. See hairstyle-landing-store for the query params that reach each
 * state.
 */

type Page = 'landing' | 'offer' | 'save' | 'gallery'
function pageFor(screen: Screen): Page {
  if (screen === 'offer' || screen === 'pay') return 'offer'
  if (screen === 'save' || screen === 'gallery') return screen
  return 'landing'
}
export function HairstyleLandingPage() {
  const screen = useHairstyleLandingStore((s) => s.screen)
  const upload = useHairstyleLandingStore((s) => s.upload)
  const reset = useHairstyleLandingStore((s) => s.reset)
  const jumpTo = useHairstyleLandingStore((s) => s.jumpTo)
  const fileRef = useRef<HTMLInputElement>(null)
  const howRef = useRef<HTMLElement>(null)
  const page = pageFor(screen)

  useEffect(() => {
    if (START_SCREEN) jumpTo(START_SCREEN)
    // Each visit starts fresh.
    return reset
  }, [jumpTo, reset])

  // A new page starts at its top.
  useEffect(() => {
    document.getElementById(SCROLL_ID)?.scrollTo({ top: 0 })
  }, [page])

  const pickFile = () => fileRef.current?.click()

  return (
    // App renders every route inside a fixed, overflow-hidden frame, so the page scrolls itself.
    <div id={SCROLL_ID} className="fixed inset-0 overflow-y-auto overflow-x-clip bg-white" style={FONT}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          upload(f)
        }}
      />

      {/* magicstudio.com header: logo left, #F7F7F8 button right, 48 tall. */}
      <div className="relative z-20 bg-white">
        <Container>
          <header className="flex h-[72px] items-center justify-between gap-4 md:h-[88px]">
            <a href="/hairstyle-landing" aria-label="Magic Studio — hairstyle try-on" className="inline-flex items-center">
              <MagicStudioLogo className="h-8 w-auto md:h-[40px]" />
            </a>
            {/* Once a photo is in, the pages carry no header action: the flow moves forward from the page itself. */}
            {page === 'landing' && (
              <Button variant="ghost" size="md" onClick={() => howRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                How it works
              </Button>
            )}
          </header>
        </Container>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {page === 'landing' ? (
          <motion.main key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <Landing onPick={pickFile} howRef={howRef} />
          </motion.main>
        ) : (
          <motion.main
            key={page}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Result pages: the landing's header and footer, the step in between. */}
            <div className="relative z-10 rounded-b-[32px] bg-white pb-[96px] md:rounded-b-[48px] md:pb-[120px]">
              <Container className="pt-6 md:pt-[40px]">
                {page === 'offer' && <Offer onPick={pickFile} />}
                {page === 'save' && <SaveScreen />}
                {page === 'gallery' && <Gallery />}
              </Container>
            </div>
            {/* Result pages keep only the dark band and the giant wordmark. */}
            <Footer wordmarkOnly />
          </motion.main>
        )}
      </AnimatePresence>

      <FlowModal onPick={pickFile} />
    </div>
  )
}
