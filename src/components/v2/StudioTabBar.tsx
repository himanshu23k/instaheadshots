import { Eye, Aperture, Shirt, Sparkles, BookOpen } from 'lucide-react'
import { useStudioStore } from '@/store/studio-store'
import { cn } from '@/lib/utils'
import type { StationId } from '@/types/studio'
import type { LucideIcon } from 'lucide-react'

const STATION_ICONS: Record<StationId, LucideIcon> = {
  look: Eye,
  setting: Aperture,
  style: Shirt,
  refine: Sparkles,
}

const STATION_LABELS: Record<StationId, string> = {
  look: 'Look',
  setting: 'Setting',
  style: 'Style',
  refine: 'Refine',
}

interface StudioTabBarProps {
  showLooks: boolean
  onLooksToggle: () => void
  onDone: () => void
}

/** Mobile-only bottom tab bar (<768px). Desktop uses StudioSidebar. */
export function StudioTabBar({ showLooks, onLooksToggle, onDone }: StudioTabBarProps) {
  const activeStation = useStudioStore((s) => s.activeStation)
  const setActiveStation = useStudioStore((s) => s.setActiveStation)
  const revealPhase = useStudioStore((s) => s.revealPhase)

  const isLocked = revealPhase === 'processing' || revealPhase === 'revealing'

  return (
    <nav
      className={cn(
        'h-14 flex items-center justify-around px-1 bg-surface/90 backdrop-blur-md border-t border-ih-border/50 shrink-0 z-20',
        isLocked && 'opacity-50 pointer-events-none'
      )}
      role="tablist"
      aria-label="Studio stations"
    >
      {(['look', 'setting', 'style', 'refine'] as StationId[]).map((stationId) => {
        const Icon = STATION_ICONS[stationId]
        const isActive = activeStation === stationId && !showLooks
        return (
          <button
            key={stationId}
            id={`station-tab-${stationId}`}
            role="tab"
            aria-selected={isActive}
            onClick={() => {
              setActiveStation(stationId)
              if (showLooks) onLooksToggle()
            }}
            className={cn(
              'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all active:scale-[0.92] min-w-[44px]',
              isActive ? 'text-ih-accent bg-ih-accent-bg' : 'text-ih-muted'
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-none">
              {STATION_LABELS[stationId]}
            </span>
          </button>
        )
      })}

      <button
        onClick={onLooksToggle}
        className={cn(
          'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all active:scale-[0.92] min-w-[44px]',
          showLooks ? 'text-ih-accent bg-ih-accent-bg' : 'text-ih-muted'
        )}
      >
        <BookOpen className="w-5 h-5" />
        <span className="text-[10px] font-medium leading-none">Looks</span>
      </button>

      <button
        onClick={onDone}
        className="px-4 py-2 bg-ih-accent text-white text-[12px] font-medium rounded-full active:scale-[0.95] transition-transform"
      >
        Done
      </button>
    </nav>
  )
}
