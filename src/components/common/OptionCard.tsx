import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OptionCardProps {
  id: string
  name: string
  thumbnail: string
  selected: boolean
  onSelect: (id: string) => void
  className?: string
}

export function OptionCard({
  id,
  name,
  thumbnail,
  selected,
  onSelect,
  className,
}: OptionCardProps) {
  return (
    <button
      onClick={() => onSelect(id)}
      className={cn(
        'relative rounded-[var(--radius-card)] overflow-hidden cursor-pointer border-2 transition-colors aspect-[3/4] w-full',
        selected
          ? 'border-ih-accent'
          : 'border-transparent hover:border-[#AAAAAA]',
        className
      )}
      role="radio"
      aria-checked={selected}
      aria-label={name}
    >
      <img
        src={thumbnail}
        alt={`${name} preview`}
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
        }}
      />
      {/* Fallback */}
      <div className="absolute inset-0 flex items-center justify-center bg-skeleton-base text-ih-muted text-[12px] -z-10">
        {name}
      </div>

      {/* Label overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/55 text-white text-[12px] font-medium px-2 py-1 text-center">
        {name}
      </div>

      {/* Selected checkmark */}
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-ih-accent flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </button>
  )
}
