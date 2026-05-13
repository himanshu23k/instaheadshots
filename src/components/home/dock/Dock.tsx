import { useRef, useState } from 'react'
import { BottomNav } from './BottomNav'
import { CTAButton } from './CTAButton'
import { ToolsMenu } from './ToolsMenu'
import { Backdrop } from './Backdrop'

export function Dock() {
  const [toolsOpen, setToolsOpen] = useState(false)
  const ctaRef = useRef<HTMLButtonElement | null>(null)

  return (
    <>
      <Backdrop visible={toolsOpen} onClick={() => setToolsOpen(false)} />

      <div className="fixed bottom-[18px] inset-x-0 z-40 mx-auto w-full max-w-[440px] px-5 pointer-events-none">
        <div className="flex items-center justify-between gap-3">
          <BottomNav />
          <div className="relative pointer-events-auto">
            <ToolsMenu
              open={toolsOpen}
              onClose={() => setToolsOpen(false)}
              returnFocusRef={ctaRef}
            />
            <CTAButton
              ref={ctaRef}
              open={toolsOpen}
              onClick={() => setToolsOpen((v) => !v)}
            />
          </div>
        </div>
      </div>
    </>
  )
}
