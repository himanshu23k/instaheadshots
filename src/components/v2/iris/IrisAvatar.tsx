import { useStudioStore } from '@/store/studio-store'
import { cn } from '@/lib/utils'
import type { IrisRole } from '@/types/studio'

// Flat single-color fills per station role
const ROLE_FILLS: Record<IrisRole, string> = {
  photographer: 'bg-amber-500',   // warm amber (Look)
  stylist: 'bg-teal-500',         // teal (Style)
  director: 'bg-blue-500',        // cool blue (Setting/Refine)
}

interface IrisAvatarProps {
  className?: string
}

/** 16px flat circular avatar. Color shifts per Iris role. No animation. */
export function IrisAvatar({ className }: IrisAvatarProps) {
  const irisRole = useStudioStore((s) => s.irisRole)
  const fill = ROLE_FILLS[irisRole]

  return (
    <div
      className={cn(
        'w-4 h-4 rounded-full shrink-0 transition-colors duration-300',
        fill,
        className
      )}
      aria-hidden="true"
    />
  )
}
