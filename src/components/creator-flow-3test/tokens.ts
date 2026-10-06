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
