import { useEffect, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { USER_TYPE, useTryItOnStore } from '@/store/try-it-on-store'
import { CreateLook } from './CreateLook'
import { SheetHost } from './Sheet'
import { Splash } from './Splash'
import { Studio } from './Studio'
import { FONT } from './tokens'

/**
 * /try-it-on — see yourself in any outfit.
 *
 * Visuals follow Figma kpKr8Y0Wc7QtZ2FVolIySo; the Complete the Look journey
 * (slot builder, items found, tap-to-swap) follows the "Complete the Look
 * Journeys" Claude Design doc, option 4a → 2a → 1b.
 *
 * Query params for reaching every state: `?version=1|2` picks the Complete
 * the Look builder (1: slot-list sheet, 2: Doji-style Create Look page);
 * `?user_type=new|repeat` picks a
 * first-time user (intro, no history) or a returning one (16 past trials, no
 * intro); `?splash=0` skips the intro,
 * `?credits=0` starts out of credits, `?fail=1` fails the first render,
 * `?upload=fail` fails uploads.
 */
export function TryItOnPage() {
  const reset = useTryItOnStore((s) => s.reset)
  const builderOpen = useTryItOnStore((s) => s.builderOpen)
  // The intro is only for first-time users.
  const [stage, setStage] = useState<'splash' | 'studio'>(() =>
    USER_TYPE === 'new' && new URLSearchParams(window.location.search).get('splash') !== '0' ? 'splash' : 'studio',
  )

  // Each visit starts from a fresh base.
  useEffect(() => reset, [reset])

  return (
    <div className="fixed inset-0 overflow-hidden bg-white web:bg-[#F7F7F8]" style={FONT}>
      <div className="relative mx-auto h-full w-full max-w-[440px] overflow-hidden bg-black web:shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_8px_40px_rgba(0,0,0,0.06)]">
        <AnimatePresence mode="wait">
          {stage === 'splash' ? (
            <Splash key="splash" onStart={() => setStage('studio')} />
          ) : (
            <Studio key="studio" onBack={() => setStage('splash')} />
          )}
        </AnimatePresence>
        <AnimatePresence>{builderOpen && <CreateLook key="create-look" />}</AnimatePresence>
      </div>
      <SheetHost />
    </div>
  )
}
