import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type CollapsibleSlidePanelProps = {
  open: boolean
  children: ReactNode
  /** Classes on the clipping wrapper (e.g. padding when open) */
  innerClassName?: string
}

/**
 * Smooth height collapse using CSS grid rows (avoids abrupt mount/unmount).
 * Uses minmax(0,1fr) so the row can shrink below content min-size; padding on the
 * clipping wrapper is only applied when open so nothing leaks when collapsed.
 */
export function CollapsibleSlidePanel({ open, children, innerClassName }: CollapsibleSlidePanelProps) {
  return (
    <div
      className={cn(
        'grid min-h-0 transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
        open ? 'grid-rows-[minmax(0,1fr)]' : 'grid-rows-[0fr]'
      )}
    >
      <div
        className={cn(
          'min-h-0 overflow-hidden overflow-clip',
          open ? innerClassName : 'p-0',
          !open && 'pointer-events-none select-none'
        )}
      >
        {children}
      </div>
    </div>
  )
}
