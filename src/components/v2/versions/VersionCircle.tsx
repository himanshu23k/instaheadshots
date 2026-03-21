import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PinnedVersion } from '@/types/studio'

interface VersionCircleProps {
  version: PinnedVersion
  isActive: boolean
  onPreview: (id: string) => void
  onUnpin: (id: string) => void
}

export function VersionCircle({ version, isActive, onPreview, onUnpin }: VersionCircleProps) {
  return (
    <div className="relative group" role="option" aria-selected={isActive} aria-label={version.label}>
      <button
        onClick={() => onPreview(version.id)}
        className={cn(
          'w-10 h-10 rounded-full overflow-hidden border-2 transition-all shadow-sm studio-focus-visible',
          isActive
            ? 'border-ih-accent scale-110'
            : 'border-surface/80 hover:border-ih-accent/50'
        )}
        aria-label={`Preview ${version.label}`}
      >
        <img
          src={version.image}
          alt={version.label}
          className="w-full h-full object-cover"
        />
      </button>

      {/* Label */}
      <span className="block text-center text-[9px] text-ih-muted mt-0.5">
        {version.label}
      </span>

      {/* Unpin button (shows on hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onUnpin(version.id)
        }}
        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-foreground text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={`Unpin ${version.label}`}
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </div>
  )
}
