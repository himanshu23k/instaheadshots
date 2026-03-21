import { useState, useEffect, useRef, useCallback } from 'react'
import { useStudioStore } from '@/store/studio-store'
import { useIris } from '@/hooks/use-iris'
import { useSwipe } from '@/hooks/use-swipe'
import { STATION_IDS } from '@/constants/stations'
import { StudioHeader } from './StudioHeader'
import { StudioImage } from './StudioImage'
import { StudioSidebar } from './StudioSidebar'
import { StudioTabBar } from './StudioTabBar'
import { StationTray } from './StationTray'
import { StudioGreeting } from './StudioGreeting'
import { LookStation } from './stations/LookStation'
import { SettingStation } from './stations/SettingStation'
import { StyleStation } from './stations/StyleStation'
import { RefineStation } from './stations/RefineStation'
import { RevealOverlay } from './reveal/RevealOverlay'
import { VariationsGrid } from './reveal/VariationsGrid'
import { VersionBoard } from './versions/VersionBoard'
import { PinButton } from './versions/PinButton'
import { PickYourShot } from './versions/PickYourShot'
import { FinalShot } from './FinalShot'
import { LooksGallery } from './looks/LooksGallery'
import { IrisDirectionLine } from './iris/IrisDirectionLine'
import { AskIrisPopover } from './iris/AskIrisPopover'
import type { StationId } from '@/types/studio'

const STATION_COMPONENTS: Record<StationId, React.ComponentType> = {
  look: LookStation,
  setting: SettingStation,
  style: StyleStation,
  refine: RefineStation,
}

export function StudioShell() {
  const phase = useStudioStore((s) => s.phase)
  const activeStation = useStudioStore((s) => s.activeStation)
  const ambientTint = useStudioStore((s) => s.ambientTint)
  const startPicking = useStudioStore((s) => s.startPicking)
  const pinnedCount = useStudioStore((s) => s.pinnedVersions.length)
  const revealPhase = useStudioStore((s) => s.revealPhase)
  const revealStation = useStudioStore((s) => s.revealStation)
  const setIrisReaction = useStudioStore((s) => s.setIrisReaction)
  const setIrisSuggestions = useStudioStore((s) => s.setIrisSuggestions)
  const [showLooks, setShowLooks] = useState(false)
  const [askIrisOpen, setAskIrisOpen] = useState(false)
  const [irisOverride, setIrisOverride] = useState<string | null>(null)

  const { getReaction, getNudgeSuggestions } = useIris()
  const prevRevealPhase = useRef(revealPhase)
  const setActiveStation = useStudioStore((s) => s.setActiveStation)

  // Swipe to switch stations on mobile
  const swipeToStation = useCallback(
    (direction: 'left' | 'right') => {
      if (showLooks) return
      const idx = STATION_IDS.indexOf(activeStation)
      const next = direction === 'left' ? idx + 1 : idx - 1
      if (next >= 0 && next < STATION_IDS.length) {
        setActiveStation(STATION_IDS[next])
      }
    },
    [activeStation, setActiveStation, showLooks]
  )

  const { swipeRef } = useSwipe({
    onSwipeLeft: () => swipeToStation('left'),
    onSwipeRight: () => swipeToStation('right'),
    threshold: 60,
    enabled: revealPhase === 'idle' || revealPhase === 'complete',
  })

  // Clear Iris override when user makes new selections
  const selections = useStudioStore((s) => s.stationSelections)
  useEffect(() => {
    if (irisOverride) setIrisOverride(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selections.look.faceId,
    selections.look.postureId,
    selections.setting.backgroundId,
    selections.style.outfitId,
    selections.refine.prompt,
  ])

  // Trigger Iris reaction + suggestions after reveal completes
  useEffect(() => {
    if (prevRevealPhase.current !== 'complete' && revealPhase === 'complete' && revealStation) {
      const reaction = getReaction(revealStation)
      setIrisReaction(reaction)

      const timer = setTimeout(() => {
        const suggestions = getNudgeSuggestions(revealStation)
        setIrisSuggestions(suggestions)
      }, 1500)

      return () => clearTimeout(timer)
    }
    prevRevealPhase.current = revealPhase
  }, [revealPhase, revealStation, getReaction, getNudgeSuggestions, setIrisReaction, setIrisSuggestions])

  if (phase === 'greeting') return <StudioGreeting />
  if (phase === 'picking') return <PickYourShot />
  if (phase === 'done') return <FinalShot />

  const StationComponent = STATION_COMPONENTS[activeStation]

  const handleDone = () => {
    if (pinnedCount > 0) {
      startPicking()
    } else {
      useStudioStore.getState().selectFinal('current')
    }
  }

  const handleIrisMessage = (msg: string) => {
    setIrisOverride(msg)
  }

  // Iris section (shared between mobile + desktop panel)
  const irisSection = (
    <IrisDirectionLine
      overrideMessage={irisOverride}
      rightSlot={
        <button
          onClick={() => setAskIrisOpen(!askIrisOpen)}
          className="whitespace-nowrap text-[11px] cursor-pointer transition-all hover:bg-ih-border/30 active:scale-[0.96]"
          style={{
            border: '1px solid #E0DDD8',
            borderRadius: '12px',
            padding: '4px 10px',
            color: '#6B6B6B',
            background: 'transparent',
          }}
        >
          Ask Iris
        </button>
      }
    />
  )

  return (
    <div
      className="h-screen flex flex-col transition-colors duration-400 overflow-hidden"
      style={{ backgroundColor: ambientTint }}
    >
      <StudioHeader />

      {/* ─── Mobile (<768px): stacked layout ─── */}
      <div className="flex-1 flex flex-col min-h-0 md:hidden">
        {/* Image — clean canvas, no overlays except reveal */}
        <div ref={swipeRef} className="flex-[3] min-h-0 flex flex-col">
          <StudioImage
            overlay={<><RevealOverlay /><VariationsGrid /></>}
            topRight={<VersionBoard />}
            bottomRight={<PinButton />}
          />
        </div>

        <StudioTabBar
          showLooks={showLooks}
          onLooksToggle={() => setShowLooks(!showLooks)}
          onDone={handleDone}
        />

        {/* Tray — Iris section at top, then station content */}
        <div className="flex-[2] min-h-0 flex flex-col">
          <div className="relative shrink-0">
            {irisSection}
            <AskIrisPopover
              open={askIrisOpen}
              onClose={() => setAskIrisOpen(false)}
              onIrisMessage={handleIrisMessage}
            />
          </div>
          <StationTray station={showLooks ? undefined : activeStation}>
            {showLooks ? <LooksGallery /> : <StationComponent />}
          </StationTray>
        </div>
      </div>

      {/* ─── Desktop (768px+): sidebar + panel (left) | image (right) ─── */}
      <div className="hidden md:flex flex-1 min-h-0">
        {/* Left — Sidebar + Panel */}
        <div
          className="flex shrink-0 overflow-hidden bg-[#FFFFFF]"
          style={{
            border: '1px solid #D0CCC6',
            borderRadius: '12px',
            margin: '16px',
            height: 'calc(100vh - 48px - 32px)',
          }}
        >
          <StudioSidebar onDone={handleDone} />
          <div className="w-[280px] lg:w-[340px] xl:w-[380px] flex flex-col min-h-0 bg-[#FFFFFF]">
            {/* Iris section — fixed at top of panel */}
            <div className="relative shrink-0">
              {irisSection}
              <AskIrisPopover
                open={askIrisOpen}
                onClose={() => setAskIrisOpen(false)}
                onIrisMessage={handleIrisMessage}
              />
            </div>
            {/* Station content */}
            <StationTray station={showLooks ? undefined : activeStation}>
              {showLooks ? <LooksGallery /> : <StationComponent />}
            </StationTray>
          </div>
        </div>

        {/* Right — Clean image canvas */}
        <div
          className="flex-1 flex flex-col items-center justify-center min-h-0"
          style={{ border: 'none', boxShadow: 'none', outline: 'none' }}
        >
          <StudioImage
            overlay={<><RevealOverlay /><VariationsGrid /></>}
            topRight={<VersionBoard />}
            bottomRight={<PinButton />}
          />
        </div>
      </div>
    </div>
  )
}
