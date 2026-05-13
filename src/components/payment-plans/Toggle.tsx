import { cn } from '@/lib/utils'

type ToggleProps = {
  checked: boolean
  onChange: (next: boolean) => void
  ariaLabel?: string
  className?: string
}

/**
 * 40×20 pill toggle.
 * - Container has 2px inner padding all around (per Figma `--spacing/2`).
 * - Thumb is 16px and slides 20px between the two edges of the inner area,
 *   so it sits 2px from the left when OFF and 2px from the right when ON.
 * - Off: midnight @ 60%. On: faded-green #00A36D.
 */
export function Toggle({ checked, onChange, ariaLabel, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-[40px] shrink-0 cursor-pointer items-center p-0.5 rounded-[10px] transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#00A36D]/60',
        checked ? 'bg-[#00A36D]' : 'bg-[rgba(1,17,36,0.6)]',
        className,
      )}
      style={
        checked
          ? undefined
          : { boxShadow: 'inset 0 -0.35px 8px 0 rgba(0,0,0,0.06)' }
      }
    >
      <span
        className={cn(
          'block size-4 rounded-full bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  )
}
