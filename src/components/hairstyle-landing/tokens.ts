import { C, FONT } from '@/components/try-it-on/tokens'

export { C, FONT }

/**
 * Design language from magicstudio.com (measured from the live page): Greed at
 * 420 for display type with a black → grey gradient fill, one Libre
 * Baskerville letter per heading, #131313 split CTAs at radius 12, #F7F7F8
 * secondary buttons, 30px photo radius, a #171717 footer.
 */
export const HC = {
  ...C,
  /** magicstudio.com heading fill. */
  ink: 'linear-gradient(to right, #000409, #484848)',
  cta: '#131313',
  ctaHover: '#2A2A2A',
  muted: 'rgba(0,4,9,0.4)',
  hairline: '#E9EAEB',
  stroke: '#E7E8EA',
  dark: '#171717',
  darkCard: '#1E1E1E',
  /** Brand rainbow, from the Magic Studio mark and the Figma loader. */
  rainbow: 'linear-gradient(90deg, #14DBDB 0%, #36C97E 18%, #FC81F1 48%, #FFA755 84%, #E3F86E 100%)',
  /** Figma splash accent on hairstyle names ("Pixie cut", "to react"). */
  accent: 'linear-gradient(95.57deg, #070600 5.45%, #12844D 100.28%)',
  green: '#12844D',
  disabled: '#B5B8BF',
  errorBg: '#FDF2F2',
  errorStroke: '#F4D5D5',
  sky: 'linear-gradient(180deg, #0E6E97 0%, #1B8DB8 46%, #4BB2D6 100%)',
}

export const SERIF = "'Libre Baskerville', Georgia, serif"

/** magicstudio.com's press easing (cta-button: active:scale-[0.97]). */
export const EASE_PRESS = 'cubic-bezier(0.23, 1, 0.32, 1)'
