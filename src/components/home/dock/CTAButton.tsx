import { forwardRef } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onClick: () => void
}

export const CTAButton = forwardRef<HTMLButtonElement, Props>(function CTAButton(
  { open, onClick },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={open ? 'Close tools menu' : 'Open tools menu'}
      aria-expanded={open}
      aria-haspopup="menu"
      className={cn(
        'relative z-40 w-[60px] h-[60px] bg-button-primary-default',
        'flex items-center justify-center pointer-events-auto',
        'transition-colors hover:bg-button-primary-hover active:bg-button-primary-hover',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-highlight focus-visible:ring-offset-2',
      )}
      style={{ boxShadow: 'var(--shadow-03)' }}
    >
      <Plus
        className="w-6 h-6 text-text-white transition-transform duration-200"
        style={{ transform: open ? 'rotate(45deg)' : 'rotate(0)' }}
      />
    </button>
  )
})
