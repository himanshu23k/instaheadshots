/**
 * Static data for the /create-profile route.
 *
 * The photo pools are drawn from the project's existing `/public/mock` library
 * plus the four headshots exported from the Figma frame (6607:9587). They are
 * split by gender first, then by style, because both selectors drive the
 * showcase: changing gender swaps the whole pool, changing style re-slices it.
 */

export type GenderId = 'male' | 'female' | 'other'
export type StyleId = 'professional' | 'casual' | 'mix'

/** Nothing picked yet — the photo pools treat this the same as `other`. */
export type GenderChoice = GenderId | null

export type GenderOption = { id: GenderId; label: string }
export type StyleOption = {
  id: StyleId
  /** Desktop radio label (Figma 6453:4728 / 4736 / 4747). */
  label: string
  /** Mobile card label (Figma 6588:5248 / 5239 / 5265). */
  cardLabel: string
  /** Exported Figma icon, rendered verbatim from public/icons. */
  icon: string
  /** Natural size of the exported SVG leaf, in px. */
  iconSize: { w: number; h: number }
  /** Offset of the leaf inside its 16x16 box, in px. */
  iconOffset: { x: number; y: number }
}

export const GENDER_OPTIONS: GenderOption[] = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Other' },
]

export const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'professional',
    label: 'All professional',
    cardLabel: 'All Professional',
    icon: '/icons/style-professional.svg',
    iconSize: { w: 14.2889, h: 13.4 },
    iconOffset: { x: 0.86, y: 0.86 },
  },
  {
    id: 'casual',
    label: 'All casual',
    cardLabel: 'All Casuals',
    icon: '/icons/style-casual.svg',
    iconSize: { w: 15.6208, h: 13.6373 },
    iconOffset: { x: 0.19, y: 1.51 },
  },
  {
    id: 'mix',
    label: 'Mix of both',
    cardLabel: 'A Mix of both',
    icon: '/icons/style-mix.svg',
    iconSize: { w: 14.289, h: 14.2892 },
    iconOffset: { x: 0.86, y: 0.41 },
  },
]

// Only head-and-shoulders frames are listed. The /mock/outfits set is flat-lay
// and full-body product shots — at tile size the face disappears, so it is out.
const MALE = {
  professional: [
    '/mock/faces/face-04.jpg',
    '/mock/faces/face-09.jpg',
    '/mock/renders/render-05.jpg',
    '/mock/renders/render-01.jpg',
    '/mock/faces/category-professional.avif',
    '/mock/faces/face-02.jpg',
  ],
  casual: [
    '/mock/create-profile/male-garden-shirt.jpg',
    '/mock/faces/face-06.jpg',
    '/mock/create-profile/male-navy-sweater.jpg',
    '/mock/renders/render-03.jpg',
    '/mock/faces/face-11.jpg',
    '/mock/faces/category-social.avif',
    '/mock/faces/face-07.jpg',
  ],
}

const FEMALE = {
  professional: [
    '/mock/create-profile/female-rooftop-black.jpg',
    '/mock/renders/render-02.jpg',
    '/mock/faces/face-08.jpg',
    '/mock/renders/render-06.jpg',
  ],
  casual: [
    '/mock/renders/render-04.jpg',
    '/mock/faces/face-10.jpg',
    '/mock/faces/face-12.jpg',
  ],
}

/** Interleave two lists so "mix" alternates professional / casual. */
function interleave(a: string[], b: string[]): string[] {
  const out: string[] = []
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i]) out.push(a[i])
    if (b[i]) out.push(b[i])
  }
  return out
}

/**
 * gender -> style -> photos.
 *
 * `other` is deliberately the interleaved union of both pools: with no stated
 * gender we show the widest range rather than defaulting to one.
 */
export const PHOTOS: Record<GenderId, Record<StyleId, string[]>> = {
  male: {
    professional: MALE.professional,
    casual: MALE.casual,
    mix: interleave(MALE.professional, MALE.casual),
  },
  female: {
    professional: FEMALE.professional,
    casual: FEMALE.casual,
    mix: interleave(FEMALE.professional, FEMALE.casual),
  },
  other: {
    professional: interleave(MALE.professional, FEMALE.professional),
    casual: interleave(MALE.casual, FEMALE.casual),
    mix: interleave(
      interleave(MALE.professional, FEMALE.professional),
      interleave(MALE.casual, FEMALE.casual),
    ),
  },
}

/**
 * Resolve a possibly-unmade choice to a photo pool. With no gender picked we
 * show the widest range rather than defaulting to one — which is the same pool
 * `other` uses, an interleave of both sets.
 */
function pool(gender: GenderChoice): GenderId {
  return gender ?? 'other'
}

/** Every photo for a gender, style-ordered — used to top up short pools. */
function allFor(gender: GenderChoice): string[] {
  const g = PHOTOS[pool(gender)]
  return [...new Set([...g.professional, ...g.casual])]
}

/**
 * Exactly `count` photos for a gender + style, without repeating an image.
 *
 * The desktop grid is a fixed 3x2, but some style pools hold fewer than six
 * mock photos. Rather than repeat a tile, we top up from the rest of that
 * gender's library — the grid stays style-weighted and stays six distinct faces.
 * Only if the whole gender pool is smaller than `count` do images repeat.
 */
export function photosFor(gender: GenderChoice, style: StyleId, count: number): string[] {
  const primary = PHOTOS[pool(gender)][style]
  const out = primary.slice(0, count)
  if (out.length < count) {
    for (const src of allFor(gender)) {
      if (out.length >= count) break
      if (!out.includes(src)) out.push(src)
    }
  }
  while (out.length < count && out.length > 0) out.push(out[out.length % primary.length])
  return out
}

/** The three hero photos behind the un-selected desktop state. */
export function heroPhotosFor(gender: GenderChoice): string[] {
  return photosFor(gender, 'mix', 3)
}
