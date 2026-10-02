import { ArrowRight, Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BRAND } from './data'
import { C, EASE_PRESS, FONT, HC, SERIF } from './tokens'

/**
 * magicstudio.com sets one letter of each heading in Libre Baskerville italic
 * at 44/48 of the line ("pe|r|sonal", "wo|r|ks"). Wrap that letter in <Serif>.
 */
export function Serif({ children }: { children: React.ReactNode }) {
  return <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: '0.917em', letterSpacing: '-0.01em' }}>{children}</span>
}

/** Index-based variant, for names that come from data ("Pixie c|u|t"). */
export function SerifWord({ text, serif }: { text: string; serif?: number }) {
  if (serif == null || serif < 0 || serif >= text.length) return <>{text}</>
  return (
    <>
      {text.slice(0, serif)}
      <Serif>{text[serif]}</Serif>
      {text.slice(serif + 1)}
    </>
  )
}

/**
 * Gradient-filled text. background-clip: text only paints inside the box, so
 * the italic serif letter's overhang and descenders get padding (cancelled by
 * negative margins) or they are clipped.
 */
const CLIP_PAD = 'px-[0.09em] -mx-[0.09em] pb-[0.14em] -mb-[0.14em]'

/** Figma splash accent: black → green, used on hairstyle names. */
export function Accent({ text, serif, className }: { text: string; serif?: number; className?: string }) {
  return (
    <span
      className={cn('inline-block bg-clip-text text-transparent', CLIP_PAD, className)}
      style={{ backgroundImage: HC.accent, fontWeight: 450 }}
    >
      <SerifWord text={text} serif={serif} />
    </span>
  )
}

const DISPLAY_SIZES = {
  /** magicstudio.com h1: 48/50, −1%. */
  hero: 'text-[36px] leading-[40px] tracking-[-0.36px] md:text-[48px] md:leading-[50px] md:tracking-[-0.48px]',
  /** Section h2: 48/50 on desktop. */
  section: 'text-[32px] leading-[36px] tracking-[-0.32px] md:text-[48px] md:leading-[50px] md:tracking-[-0.48px]',
  /** "how it works": 64/66. */
  xl: 'text-[44px] leading-[48px] tracking-[-0.44px] md:text-[64px] md:leading-[66px] md:tracking-[-0.64px]',
  /** Steps inside the flow modal. */
  step: 'text-[28px] leading-[32px] tracking-[-0.28px] md:text-[32px] md:leading-[36px] md:tracking-[-0.32px]',
}

/** Display heading: Greed 420 with the magicstudio.com black → grey fill (or white on photos). */
export function Display({
  children,
  as: Tag = 'h2',
  size = 'section',
  light = false,
  className,
}: {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3'
  size?: keyof typeof DISPLAY_SIZES
  light?: boolean
  className?: string
}) {
  return (
    <Tag className={cn(DISPLAY_SIZES[size], 'text-balance', className)} style={{ ...FONT, fontWeight: 420, color: light ? '#fff' : C.text }}>
      {light ? (
        children
      ) : (
        <span className={cn('inline-block bg-clip-text text-transparent', CLIP_PAD)} style={{ backgroundImage: HC.ink }}>
          {children}
        </span>
      )}
    </Tag>
  )
}

export function Eyebrow({
  children,
  tone = 'muted',
  className,
}: {
  children: React.ReactNode
  tone?: 'muted' | 'error' | 'light'
  className?: string
}) {
  const color = tone === 'error' ? C.error : tone === 'light' ? 'rgba(255,255,255,0.6)' : C.secondary
  return (
    <p className={cn('text-[12px] uppercase leading-[14px] tracking-[0.96px]', className)} style={{ ...FONT, fontWeight: 450, color }}>
      {children}
    </p>
  )
}

/** magicstudio.com subcopy: 20/22 #66686B on desktop. */
export function Body({ children, className, light = false, size = 'lead' }: { children: React.ReactNode; className?: string; light?: boolean; size?: 'lead' | 'base' }) {
  return (
    <p
      className={cn(size === 'lead' ? 'text-[16px] leading-[20px] md:text-[20px] md:leading-[22px]' : 'text-[16px] leading-[22px]', className)}
      style={{ ...FONT, fontWeight: 420, color: light ? 'rgba(255,255,255,0.8)' : C.secondary }}
    >
      {children}
    </p>
  )
}

/** Figma price tag: grey chip, 10/12 uppercase, 0.8 tracking. */
export function Tag({ children, dark = false, className }: { children: React.ReactNode; dark?: boolean; className?: string }) {
  return (
    <span
      className={cn('inline-flex rounded-[6px] px-2 py-1 text-[10px] uppercase leading-[12px] tracking-[0.8px]', className)}
      style={{ ...FONT, fontWeight: 450, background: dark ? 'rgba(255,255,255,0.1)' : C.grey03, color: dark ? '#fff' : C.secondary }}
    >
      {children}
    </span>
  )
}

/**
 * magicstudio.com's CTA: a #131313 label block and a separate 52px chevron
 * block, both radius 12, tucked 1px together; presses to 0.97.
 */
export function CTA({
  children,
  onClick,
  tone = 'dark',
  className,
  disabled,
  type = 'button',
}: {
  children: React.ReactNode
  onClick?: () => void
  tone?: 'dark' | 'light'
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  const bg = disabled ? HC.disabled : tone === 'light' ? '#fff' : HC.cta
  const fg = tone === 'light' && !disabled ? C.text : '#fff'
  const block = cn(
    'flex items-center justify-center rounded-[12px] transition-colors duration-200',
    !disabled && (tone === 'light' ? 'group-hover:bg-[#EDEDEE]!' : 'group-hover:bg-[#2A2A2A]!'),
  )
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn('group flex w-full max-w-[340px] active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100 sm:w-auto', className)}
      style={{ ...FONT, transition: `transform 300ms ${EASE_PRESS}` }}
    >
      <span
        className={cn(block, '-mr-px flex-1 whitespace-nowrap px-7 py-[15px] text-[16px] leading-[22px] tracking-[-0.08px] md:-mr-0.5')}
        style={{ background: bg, color: fg, fontWeight: 450 }}
      >
        {children}
      </span>
      <span className={cn(block, 'size-[52px] shrink-0')} style={{ background: bg, color: fg }} aria-hidden>
        <ChevronRight size={18} strokeWidth={1.8} className="transition-transform duration-300 group-hover:translate-x-0.5" />
      </span>
    </button>
  )
}

type ButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  /** primary: #131313. ghost: #F7F7F8. secondary: white with a hairline. light: white on dark. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'light'
  /** lg 52, md 48 (magicstudio.com header), sm 40. All radius 12. */
  size?: 'lg' | 'md' | 'sm'
  arrow?: boolean
  className?: string
  type?: 'button' | 'submit'
  'aria-label'?: string
  icon?: React.ReactNode
}

export function Button({
  children,
  onClick,
  disabled,
  variant = 'primary',
  size = 'lg',
  arrow = false,
  className,
  type = 'button',
  icon,
  ...rest
}: ButtonProps) {
  const look = disabled
    ? { background: HC.disabled, border: `1px solid ${HC.disabled}`, color: '#fff' }
    : variant === 'primary'
      ? { background: HC.cta, border: `1px solid ${HC.cta}`, color: '#fff' }
      : variant === 'secondary'
        ? { background: '#fff', border: `1px solid ${HC.stroke}`, color: C.text }
        : variant === 'light'
          ? { background: '#fff', border: '1px solid #fff', color: C.text }
          : { background: C.grey03, border: `1px solid ${C.grey03}`, color: C.text }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={rest['aria-label']}
      className={cn(
        'group relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-[12px] px-6 transition-[background-color,border-color] duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100',
        size === 'lg' ? 'h-[52px] text-[16px] leading-[18px]' : size === 'md' ? 'h-12 text-[16px] leading-[18px]' : 'h-[40px] px-4 text-[14px] leading-[16px]',
        !disabled && variant === 'primary' && 'hover:bg-[#2A2A2A]!',
        !disabled && variant === 'secondary' && 'hover:border-[#000409]!',
        !disabled && variant === 'ghost' && 'hover:bg-[#EDEDEE]!',
        !disabled && variant === 'light' && 'hover:bg-[#EDEDEE]!',
        className,
      )}
      style={{ ...FONT, fontWeight: 450, transitionProperty: 'background-color, border-color, transform', transitionTimingFunction: EASE_PRESS, ...look }}
    >
      {icon}
      <span className="px-0.5">{children}</span>
      {arrow && <ArrowRight size={size === 'sm' ? 15 : 17} strokeWidth={1.6} className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />}
    </button>
  )
}

/** Row tick — used for the photo tips and check steps. */
export function Tick({ size = 14, color = C.text }: { size?: number; color?: string }) {
  return <Check size={size} strokeWidth={2} color={color} className="shrink-0" aria-hidden />
}

/**
 * A photo that fills its frame: object-fit cover, so it is cropped, never
 * stretched. `filter` grades the prototype's stand-in "generated" looks.
 */
export function Photo({
  src,
  filter,
  pos = 'center 25%',
  className,
  label,
}: {
  src: string | null
  filter?: string
  pos?: string
  className?: string
  label?: string
}) {
  if (!src) return <div className={cn('absolute inset-0 bg-[#E5E6E6]', className)} />
  return (
    <img
      src={src}
      alt={label ?? ''}
      draggable={false}
      className={cn('absolute inset-0 size-full object-cover', className)}
      style={{ objectPosition: pos, filter }}
    />
  )
}

/** magicstudio.com column: 1280 max with 80px gutters at 1440; 20px on phones. */
export function Container({ children, className, narrow }: { children: React.ReactNode; className?: string; narrow?: boolean }) {
  return <div className={cn('mx-auto w-full px-5 md:px-[40px]', narrow ? 'max-w-[760px]' : 'max-w-[1360px]', className)}>{children}</div>
}

/** Magic Studio mark + wordmark (vector, from magicstudio.com). `light` swaps the wordmark to white for dark panels. */
export function MagicStudioLogo({ height = 40, tone = 'dark', className }: { height?: number; tone?: 'dark' | 'light'; className?: string }) {
  return (
    <img
      src={tone === 'light' ? BRAND.logoLight : BRAND.logo}
      alt="Magic Studio"
      width={(height * 139) / 52}
      height={height}
      className={cn('block', className)}
    />
  )
}
