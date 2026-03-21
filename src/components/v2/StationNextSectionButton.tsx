import { ArrowRight } from 'lucide-react'
import { STATION_MAP } from '@/constants/stations'
import type { StationId } from '@/types/studio'
import { cn } from '@/lib/utils'

type StationNextSectionButtonProps = {
  /** Show after a successful apply in this station */
  show: boolean
  nextStationId: StationId | null
  onGoNext: () => void
}

/**
 * Secondary square control to move to the next studio station after applying.
 */
export function StationNextSectionButton({ show, nextStationId, onGoNext }: StationNextSectionButtonProps) {
  if (!show || !nextStationId) return null

  return (
    <button
      type="button"
      onClick={onGoNext}
      className={cn(
        'flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-btn)]',
        'border border-ih-border bg-white text-foreground shadow-sm',
        'transition-colors hover:bg-ih-border/35 hover:border-ih-muted active:scale-[0.98]',
        'animate-in fade-in-0 zoom-in-95 duration-200'
      )}
      aria-label={`Continue to ${STATION_MAP[nextStationId].shortLabel}`}
    >
      <ArrowRight className="h-5 w-5 text-ih-muted" strokeWidth={2} aria-hidden />
    </button>
  )
}
