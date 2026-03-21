import { Gem, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreditActionButtonProps {
  label: string
  cost: number
  isFree?: boolean
  disabled?: boolean
  loading?: boolean
  onClick: () => void
  className?: string
}

export function CreditActionButton({
  label,
  cost,
  isFree = false,
  disabled = false,
  loading = false,
  onClick,
  className,
}: CreditActionButtonProps) {
  const showCredit = cost > 0 && !isFree
  const effectiveDisabled = disabled || loading

  return (
    <button
      onClick={onClick}
      disabled={effectiveDisabled}
      className={cn(
        'w-full flex items-center rounded-[var(--radius-btn)] px-5 py-3 text-[14px] font-medium text-white transition-colors',
        effectiveDisabled
          ? 'bg-ih-disabled cursor-not-allowed'
          : 'bg-[#2D2D2D] hover:bg-primary-cta-active cursor-pointer',
        className
      )}
      aria-label={
        showCredit
          ? `${label} for ${cost} credit`
          : label
      }
    >
      {showCredit && (
        <>
          <span className="flex items-center gap-1.5">
            <Gem className="w-4 h-4 text-ih-accent" />
            <span>{cost}</span>
          </span>
          <span className="mx-3 w-px h-4 bg-white/30" aria-hidden="true" />
        </>
      )}
      {isFree && cost > 0 && (
        <>
          <span className="flex items-center gap-1 text-ih-accent text-[12px] font-medium">
            <Check className="w-3.5 h-3.5" />
            Free
          </span>
          <span className="mx-3 w-px h-4 bg-white/30" aria-hidden="true" />
        </>
      )}
      <span className="flex-1 text-right">
        {loading ? 'Applying...' : label}
      </span>
    </button>
  )
}
