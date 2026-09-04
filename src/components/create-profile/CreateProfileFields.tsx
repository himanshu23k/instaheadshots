/**
 * Form primitives for /create-profile, built to Figma 6607:9587.
 *
 * The project's shadcn Input/Button are the compact 32px generics used by the
 * V1 studio; this screen is on the newer Figma system (48px controls, Greed
 * Standard VF, `--color-*` semantic tokens), so these are local to the route.
 */

/** Radio dial — 16px ring, filled black with a 6.4px white dot when on. */
export function RadioDial({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className="relative block size-4 shrink-0 rounded-full"
      style={
        checked
          ? { background: 'var(--color-button-primary-default)' }
          : {
              background: 'var(--color-bg-section)',
              border: '1.2px solid var(--color-border-primary)',
            }
      }
    >
      {checked && (
        <span className="absolute left-1/2 top-1/2 block size-[6.4px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
      )}
    </span>
  )
}

/** 48px pill used for both the gender radios and the desktop style radios. */
export function ChoiceButton({
  selected,
  onSelect,
  label,
  role = 'radio',
  icon,
  className = '',
}: {
  selected: boolean
  onSelect: () => void
  label: string
  role?: 'radio'
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onSelect}
      className={`flex h-12 min-w-0 flex-1 items-center gap-2 rounded-lg bg-white p-3.5 text-left transition-[border-color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-neon-green)] ${className}`}
      style={{
        border: selected
          ? '1.5px solid var(--color-border-secondary)'
          : '1px solid var(--color-border-primary)',
      }}
    >
      {icon}
      <span
        className="body-l truncate"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {label}
      </span>
    </button>
  )
}

/** Label + helper text pair that heads each field group. */
export function FieldHeader({
  title,
  hint,
  htmlFor,
}: {
  title: string
  hint: string
  /** When the group is a single control, ties the title to it as its label. */
  htmlFor?: string
}) {
  const Title = htmlFor ? 'label' : 'p'
  return (
    <div className="flex w-full flex-col gap-3">
      <Title
        htmlFor={htmlFor}
        className="text-[20px] leading-[22px] tracking-[-0.2px] web:text-[22px] web:leading-6 web:tracking-[-0.22px]"
        style={{ fontFamily: 'var(--font-greed)', fontWeight: 450, color: 'var(--color-text-primary)' }}
      >
        {title}
      </Title>
      <p
        className="text-[14px] leading-4 web:text-[16px] web:leading-[18px]"
        style={{ fontFamily: 'var(--font-greed)', fontWeight: 420, color: 'var(--color-text-secondary)' }}
      >
        {hint}
      </p>
    </div>
  )
}

/** 48px text input (Figma I6453:4705;80:97). */
export function NameInput({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <input
      id="create-profile-name"
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter a name"
      autoComplete="name"
      className="body-l h-12 w-full rounded-lg bg-white p-3.5 outline-none transition-[border-color] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-border-secondary)]"
      style={{
        border: '1px solid var(--color-border-primary)',
        color: 'var(--color-text-primary)',
      }}
    />
  )
}

/** Primary CTA in the docked footer. */
export function PrimaryCta({
  children,
  disabled,
  onClick,
  className = '',
}: {
  children: React.ReactNode
  disabled?: boolean
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-lg px-6 py-2.5 transition-[background-color,opacity] disabled:cursor-not-allowed ${className}`}
      style={{
        background: disabled
          ? 'var(--color-button-primary-disabled)'
          : 'var(--color-button-primary-default)',
      }}
    >
      <span
        className="relative px-0.5 text-[16px] leading-[18px]"
        style={{ fontFamily: 'var(--font-greed)', fontWeight: 450, color: 'var(--color-text-white)' }}
      >
        {children}
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ boxShadow: 'inset 0px 2px 2px 0px rgba(255,255,255,0.25)' }}
      />
    </button>
  )
}
