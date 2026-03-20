import { cn } from '@/lib/utils'
import { ChevronDown, Wand2 } from 'lucide-react'

interface CategoryTabsProps {
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
  /** Optional action button (wizard icon) — e.g. upload, shop link */
  actionLabel?: string
  onActionClick?: () => void
  /** Whether the special action mode is currently active (upload/shop view) */
  actionActive?: boolean
}

export function CategoryTabs({
  tabs,
  activeTab,
  onTabChange,
  actionLabel,
  onActionClick,
  actionActive,
}: CategoryTabsProps) {
  // When in action mode, show a placeholder so that picking any option
  // (including the one that was active before) always fires onChange.
  const showPlaceholder = actionActive && !tabs.includes(activeTab)

  return (
    <div className="sticky top-0 z-10 bg-surface py-2 -mt-2 mb-4 flex items-center gap-2">
      <div className="relative flex-1">
        <select
          value={showPlaceholder ? '' : activeTab}
          onChange={(e) => onTabChange(e.target.value)}
          className={cn(
            'w-full appearance-none bg-surface border border-ih-border rounded-[var(--radius-btn)]',
            'px-3 py-2 pr-8 text-[14px] font-medium text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary-cta/40 focus:border-primary-cta',
            'cursor-pointer transition-colors',
            showPlaceholder && 'text-ih-muted'
          )}
        >
          {showPlaceholder && (
            <option value="" disabled>
              Select category…
            </option>
          )}
          {tabs.map((tab) => (
            <option key={tab} value={tab}>
              {tab}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ih-muted pointer-events-none" />
      </div>

      {onActionClick && (
        <button
          onClick={onActionClick}
          title={actionLabel || 'Special action'}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-btn)]',
            'border bg-surface text-[13px] font-medium',
            'transition-colors whitespace-nowrap shrink-0',
            actionActive
              ? 'border-primary-cta text-primary-cta'
              : 'border-ih-border text-ih-muted hover:border-primary-cta hover:text-primary-cta'
          )}
        >
          <Wand2 className="w-4 h-4" />
          {actionLabel && <span>{actionLabel}</span>}
        </button>
      )}
    </div>
  )
}
