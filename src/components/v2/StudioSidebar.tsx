import { Eye, Aperture, Shirt, Sparkles, CheckCircle2 } from 'lucide-react'
import { useStudioStore } from '@/store/studio-store'
import { cn } from '@/lib/utils'
import type { StationId } from '@/types/studio'
import type { LucideIcon } from 'lucide-react'

const SIDEBAR_ITEMS: { id: StationId; icon: LucideIcon; label: string }[] = [
  { id: 'look', icon: Eye, label: 'Look' },
  { id: 'setting', icon: Aperture, label: 'Setting' },
  { id: 'style', icon: Shirt, label: 'Style' },
  { id: 'refine', icon: Sparkles, label: 'Refine' },
]

interface StudioSidebarProps {
  onDone: () => void
}

export function StudioSidebar({ onDone }: StudioSidebarProps) {
  const activeStation = useStudioStore((s) => s.activeStation)
  const setActiveStation = useStudioStore((s) => s.setActiveStation)
  const revealPhase = useStudioStore((s) => s.revealPhase)

  const isLocked = revealPhase === 'processing' || revealPhase === 'revealing'

  return (
    <nav
      className={cn(
        'w-[72px] shrink-0 flex flex-col z-20 relative pt-3 pb-3 h-full',
        isLocked && 'opacity-50 pointer-events-none'
      )}
      style={{ background: '#F8F8F6', borderRight: '1px solid #E0DDD8' }}
      role="tablist"
      aria-label="Studio stations"
      aria-orientation="vertical"
    >
      {/* Station tabs — mx-2 matches Done button alignment */}
      {SIDEBAR_ITEMS.map(({ id, icon: Icon, label }) => {
        const isActive = activeStation === id
        return (
          <button
            key={id}
            id={`station-tab-${id}`}
            role="tab"
            aria-selected={isActive}
            aria-controls="station-tray"
            onClick={() => setActiveStation(id)}
            className={cn(
              'relative flex flex-col items-center justify-center gap-1 py-3.5 mx-2 transition-colors',
              isActive
                ? 'bg-[#FFFFFF] text-foreground'
                : 'text-ih-muted hover:text-foreground'
            )}
            style={isActive ? {
              marginRight: '-9px',
              paddingRight: '8px',
              borderRadius: 0,
              position: 'relative' as const,
              zIndex: 2,
            } : {
              borderRadius: '8px',
            }}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-none">
              {label}
            </span>
          </button>
        )
      })}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Done button */}
      <button
        onClick={onDone}
        className="flex flex-col items-center justify-center gap-1 py-3 mx-2 rounded-lg bg-ih-accent text-white hover:bg-ih-accent/90 transition-colors"
      >
        <CheckCircle2 className="w-5 h-5" />
        <span className="text-[10px] font-medium leading-none">Done</span>
      </button>
    </nav>
  )
}
