import { useState, useEffect, useLayoutEffect, useRef, useCallback, type CSSProperties } from 'react'
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
import { RefineEraserOverlay } from './refine/RefineEraserOverlay'
import { RevealOverlay } from './reveal/RevealOverlay'
import { VariationsGrid } from './reveal/VariationsGrid'
import { VersionBoard } from './versions/VersionBoard'
import { PinButton } from './versions/PinButton'
import { PickYourShot } from './versions/PickYourShot'
import { FinalShot } from './FinalShot'
import { LooksGallery } from './looks/LooksGallery'
import { IrisDirectionLine } from './iris/IrisDirectionLine'
import type { StationId } from '@/types/studio'
import { cn } from '@/lib/utils'

const STAGGER_STEP_MS = 80

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
  const [staggerFromGreeting, setStaggerFromGreeting] = useState(false)

  const { getReaction, getNudgeSuggestions } = useIris()
  const prevRevealPhase = useRef(revealPhase)
  const prevPhase = useRef(phase)
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

  // Must run before paint: otherwise one frame shows the full UI at opacity 1 (flash), then stagger applies.
  useLayoutEffect(() => {
    if (prevPhase.current === 'greeting' && phase === 'creating') {
      setStaggerFromGreeting(true)
    }
    prevPhase.current = phase
  }, [phase])

  const staggerStyle = (step: number): CSSProperties | undefined => {
    if (!staggerFromGreeting) return undefined
    return {
      animation: `studio-stagger-in 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${step * STAGGER_STEP_MS}ms forwards`,
      animationFillMode: 'both',
      backfaceVisibility: 'hidden',
    }
  }

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

  // Iris section (shared between mobile + desktop panel)
  const irisSection = <IrisDirectionLine />

  const studioMain = (
    <div
      className="h-screen flex flex-col transition-colors duration-400 overflow-hidden"
      style={{ backgroundColor: ambientTint }}
    >
      <div className="w-full shrink-0" style={staggerStyle(0)}>
        <StudioHeader />
      </div>

      {/* ─── Mobile (<768px): stacked layout ─── */}
      <div className="flex-1 flex flex-col min-h-0 md:hidden">
        {/* Image — clean canvas, no overlays except reveal */}
        <div ref={swipeRef} className="flex-[3] min-h-0 flex flex-col" style={staggerStyle(1)}>
          <StudioImage
            overlay={<><RevealOverlay /><VariationsGrid /></>}
            topRight={<VersionBoard />}
            bottomRight={<PinButton />}
          />
        </div>

        <div style={staggerStyle(2)}>
          <StudioTabBar
            showLooks={showLooks}
            onLooksToggle={() => setShowLooks(!showLooks)}
            onDone={handleDone}
          />
        </div>

        {/* Tray — Iris section at top, then station content */}
        <div className="flex-[2] min-h-0 flex flex-col">
          <div className="relative shrink-0" style={staggerStyle(3)}>
            <div className="relative pl-4 pr-5 pt-2">{irisSection}</div>
          </div>
          <div className="min-h-0 flex flex-1 flex-col" style={staggerStyle(4)}>
            <StationTray station={showLooks ? undefined : activeStation}>
              {showLooks ? <LooksGallery /> : <StationComponent />}
            </StationTray>
          </div>
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
            ...staggerStyle(1),
          }}
        >
          <StudioSidebar onDone={handleDone} />
          <div className="relative z-10 w-[280px] lg:w-[340px] xl:w-[380px] flex flex-col min-h-0 bg-[#FFFFFF]">
            {/* Iris section — fixed at top of panel */}
            <div className="relative shrink-0">
              <div className="relative pl-4 pr-5 pt-2">{irisSection}</div>
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
          style={{
            border: 'none',
            boxShadow: 'none',
            outline: 'none',
            ...staggerStyle(2),
          }}
        >
          <StudioImage
            overlay={
              <>
                <RevealOverlay />
                <VariationsGrid />
                <RefineEraserOverlay />
              </>
            }
            topRight={<VersionBoard />}
            bottomRight={<PinButton />}
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative min-h-screen w-full">
      <div
        className={cn(
          'relative z-0 min-h-screen w-full',
          // No CSS transition here: it fought the stagger (filter + child transforms = flicker).
          phase === 'greeting' && 'brightness-[0.9] saturate-[0.92]',
          phase === 'creating' && 'brightness-100 saturate-100'
        )}
      >
        {studioMain}
      </div>
      {phase === 'greeting' && <StudioGreeting />}
    </div>
  )
}
