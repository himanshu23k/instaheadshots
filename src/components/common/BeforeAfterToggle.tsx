interface BeforeAfterToggleProps {
  mode: 'before' | 'after'
  onToggle: (mode: 'before' | 'after') => void
}

export function BeforeAfterToggle({ mode, onToggle }: BeforeAfterToggleProps) {
  return (
    <div className="flex rounded-[var(--radius-pill)] overflow-hidden border border-ih-border w-[120px]">
      <button
        onClick={() => onToggle('before')}
        className={`flex-1 py-1 text-[12px] font-medium transition-colors ${
          mode === 'before'
            ? 'bg-primary-cta text-white'
            : 'bg-surface text-ih-muted'
        }`}
        aria-label="Show before editing"
        aria-pressed={mode === 'before'}
      >
        Before
      </button>
      <button
        onClick={() => onToggle('after')}
        className={`flex-1 py-1 text-[12px] font-medium transition-colors ${
          mode === 'after'
            ? 'bg-primary-cta text-white'
            : 'bg-surface text-ih-muted'
        }`}
        aria-label="Show after editing"
        aria-pressed={mode === 'after'}
      >
        After
      </button>
    </div>
  )
}
