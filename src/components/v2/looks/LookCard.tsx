import { Gem } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StyleLook } from '@/types/studio'

interface LookCardProps {
  look: StyleLook
  isActive: boolean
  loading: boolean
  onApply: (lookId: string) => void
}

export function LookCard({ look, isActive, loading, onApply }: LookCardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] overflow-hidden border-2 transition-colors',
        isActive ? 'border-ih-accent' : 'border-transparent hover:border-ih-border'
      )}
    >
      {/* Preview thumbnail */}
      <div className="relative aspect-[4/3]">
        <img
          src={look.preview}
          alt={look.name}
          className="w-full h-full object-cover"
        />
        {/* Cost badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 text-white text-[11px] font-medium">
          <Gem className="w-3 h-3 text-ih-accent" />
          {look.cost}
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5 bg-surface">
        <h3 className="text-[13px] font-medium text-foreground">{look.name}</h3>
        <p className="text-[11px] text-ih-muted mt-0.5 line-clamp-1">
          {look.description}
        </p>
        <button
          onClick={() => onApply(look.id)}
          disabled={loading}
          className="mt-2 w-full py-1.5 text-[12px] font-medium bg-foreground text-white rounded-[var(--radius-btn)] hover:bg-primary-cta-hover transition-colors disabled:bg-ih-disabled disabled:cursor-not-allowed"
        >
          {loading && isActive ? 'Applying...' : 'Try this look'}
        </button>
      </div>
    </div>
  )
}
