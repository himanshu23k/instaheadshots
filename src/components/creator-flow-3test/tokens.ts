import { MAX_PHOTOS, MIN_PHOTOS, VARIETY_PHOTOS } from './use-photos'

/** Old creator flow (Figma kpKr8Y0Wc7QtZ2FVolIySo 385:3768 / 385:3769) colours. */
export const K = {
  text: '#000409',
  secondary: '#66686B',
  stroke: '#E0E1E1',
  /** The "variety" tier, past the 3 you need: the design system's neutral-80. */
  variety: '#344150',
  varietyTrack: '#E3E7EE',
  bubble: '#F3F5F9',
  bubbleStroke: '#E1E5EC',
  muted: '#99A0A7',
}

// ── Copy ──────────────────────────────────────────────────────────────────────

export function captionFor(n: number) {
  if (n === 0) return 'Add 3 photos to start'
  if (n < MIN_PHOTOS) return `Add ${MIN_PHOTOS - n} more to start`
  if (n === MIN_PHOTOS) return 'You’re ready to create!'
  if (n < 6) return 'Nice — a few more adds extra variety'
  if (n < VARIETY_PHOTOS) return `Great mix! ${VARIETY_PHOTOS - n} more for the most variety`
  if (n < MAX_PHOTOS) return 'Full variety unlocked'
  return 'Full variety · all 15 added'
}

export const countLabel = (n: number) => `${n} ${n === 1 ? 'photo' : 'photos'}`

/** ?version=2 additions: the yellow-to-mint meter and caption, and the light add tiles. */
export const K2 = {
  /** Filled segments, yellow while short of 10 and mint at 10. The 3 and 10 segments are milestones: taller and stronger. */
  segStart: { fill: '#F5D46A', strong: '#ECB92A' },
  segDone: { fill: '#9DEBD1', strong: '#4FDDB6' },
  track: '#EBEBEC',
  trackMilestone: '#D6D7D9',
  tile: '#F7F7F8',
  tileStroke: '#D9DADC',
  /**
   * The caption under the meter is yellow until the 3 minimum is met, then
   * green, deepening to mint at 10. See progressMix.
   */
  bubbleStart: { bg: '#FFF3C9', stroke: '#F2C94C', text: '#5A4100' },
  bubbleDone: { bg: '#DDF8EE', stroke: '#8FE3C4', text: '#00452F' },
}

/** ?version=2 photo ceiling: 10 is recommended, but people can keep going. */
export const V2_MAX_PHOTOS = 25

/**
 * Below 10, every line also says how many are left to reach 10. Each fits one
 * line in the mobile caption at 375px (13px text beside the avatars, ~229px).
 */
const V2_CAPTIONS: Record<number, string> = {
  0: 'Add 3 photos to start, 10 for variety',
  1: 'Great start! 2 more to create, 9 for 10',
  2: 'Just 1 more to create, 8 more to go for 10',
  3: 'You can create, but 7 more adds variety',
  4: 'Nice! 6 more for 10. Try a new outfit',
  5: 'Halfway there, 5 more to go for 10',
  6: 'Great mix! 4 more to go for 10',
  7: 'A new setting helps. 3 more to go for 10',
  8: 'Almost there, 2 more to go for 10',
  9: 'Just 1 more to go for 10',
  10: 'Full variety unlocked! Add more if you like',
}

/** Past 10, a rotating tip keeps the line changing with every upload. */
const V2_EXTRA_TIPS = [
  'more angles, more variety',
  'extra expressions help the AI',
  'new lighting adds range',
  'every outfit adds a look',
]

/** ?version=2 caption: a different line for every photo count. */
export function captionV2(n: number) {
  if (n in V2_CAPTIONS) return V2_CAPTIONS[n]
  if (n >= V2_MAX_PHOTOS) return `All ${V2_MAX_PHOTOS} added, you’re all set`
  return `${n} photos, ${V2_EXTRA_TIPS[(n - 11) % V2_EXTRA_TIPS.length]}`
}

/** Where the yellow → mint mix lands at 3 photos: past halfway, so 3 already reads green. */
const GREEN_AT_MIN = 0.55

/**
 * How far v2's colours have moved from yellow to mint: yellow below 3, green
 * from 3 (the minimum is met), deepening to mint at 10. Mixed in oklch so the
 * middle passes through lime, not grey.
 */
export function progressMix(n: number) {
  const t =
    n < MIN_PHOTOS
      ? 0
      : Math.min(1, GREEN_AT_MIN + ((1 - GREEN_AT_MIN) * (n - MIN_PHOTOS)) / (VARIETY_PHOTOS - MIN_PHOTOS))
  return (from: string, to: string) => `color-mix(in oklch, ${to} ${Math.round(t * 100)}%, ${from})`
}
