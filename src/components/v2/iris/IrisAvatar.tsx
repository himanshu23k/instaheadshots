import { useStudioStore } from '@/store/studio-store'
import { cn } from '@/lib/utils'
import type { IrisRole } from '@/types/studio'

// Flat single-color fills per station role
const ROLE_FILLS: Record<IrisRole, string> = {
  photographer: 'bg-amber-500',   // warm amber (Look)
  stylist: 'bg-teal-500',         // teal (Style)
  director: 'bg-blue-500',        // cool blue (Setting/Refine)
}

const IRIS_PHOTO = '/iris-avatar.png'

interface IrisAvatarProps {
  className?: string
  /** `role` = flat color dot by station. `photo` = Iris face image (e.g. greeting). */
  variant?: 'role' | 'photo'
}

/** Circular avatar: flat color by Iris role, or photo when `variant="photo"`. */
export function IrisAvatar({ className, variant = 'role' }: IrisAvatarProps) {
  const irisRole = useStudioStore((s) => s.irisRole)
  const fill = ROLE_FILLS[irisRole]

  if (variant === 'photo') {
    return (
      <img
        src={IRIS_PHOTO}
        alt=""
        width={24}
        height={24}
        className={cn('h-6 w-6 shrink-0 rounded-full object-cover ring-2 ring-white/15', className)}
        draggable={false}
      />
    )
  }

  return (
    <div
      className={cn(
        'h-4 w-4 shrink-0 rounded-full transition-colors duration-300',
        fill,
        className
      )}
      aria-hidden="true"
    />
  )
}
