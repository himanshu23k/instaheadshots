import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import type { StationId } from '@/types/studio'

interface StationTrayProps {
  children: ReactNode
  className?: string
  station?: StationId
}

export function StationTray({ children, className, station }: StationTrayProps) {

  return (
    <div
      className={cn(
        'flex-1 min-h-0 overflow-hidden flex flex-col',
        className
      )}
      id="station-tray"
      role="tabpanel"
      aria-label={station ? `${station} station controls` : 'Looks gallery'}
      aria-labelledby={station ? `station-tab-${station}` : undefined}
    >
      <div className="pl-4 pr-3 pb-3 flex-1 min-h-0 flex flex-col">
        {/* Station content — fills remaining space, fades on station switch */}
        <div
          key={station || 'looks'}
          className="flex-1 min-h-0"
          style={{ animation: 'fade-in 0.15s ease' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

/** Horizontal scroll row for option cards (used in Setting/Style stations) */
export function TrayScrollRow({
  children,
  label,
  className,
}: {
  children: ReactNode
  label?: string
  className?: string
}) {
  return (
    <div className={className}>
      {label && (
        <p className="text-[12px] text-ih-muted font-medium mb-1.5 px-1">
          {label}
        </p>
      )}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {children}
      </div>
    </div>
  )
}
