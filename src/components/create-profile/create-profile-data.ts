/**
 * Static data for the /create-profile route.
 *
 * The photo pools come from `public/create-profile`, which holds one folder per
 * style-and-gender combination. Both selectors drive the showcase: changing
 * gender swaps the whole pool, changing style re-slices it.
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
  },
  {
    id: 'casual',
    label: 'All casual',
    cardLabel: 'All Casuals',
  },
  {
    id: 'mix',
    label: 'Mix of both',
    cardLabel: 'A Mix of both',
  },
]

const DIR = '/create-profile'

/**
 * Filenames exactly as they sit on disk under `public/create-profile/<folder>`.
 * Some carry spaces, so URLs are built with encodeURIComponent rather than
 * written out by hand.
 */
const FILES = {
  'professional-male': [
    '2a2eacb518b35884.jpeg',
    '5cd40d64315a1c23.jpeg',
    '694bdf616ab8644b.jpeg',
    'b8c238e7a93e151b.jpeg',
    'e7a2ec7ea5189c7f.jpeg',
    'ec07d8e90b5052dc.jpeg',
    'professional 01.png',
    'professional 02.png',
    'professional 03.png',
    'professional 04.png',
    'professional 05.png',
  ],
  'professional-female': [
    '00016d5d15ccee07.jpeg',
    '1c78c5729757e8af.jpeg',
    '228545ef8747cd52.jpeg',
    '563238108a81edfb.jpeg',
    '674c44afc703577f.jpeg',
    'ba6b5ae891eb29b2.jpeg',
    'bf1c2071c3cf54f4.jpeg',
    'e4e58b27c7e00429.jpeg',
    'e9618293ffaa7761.jpeg',
    'eac8347c13f70347.jpeg',
    'fd619d4f7dae3e46.jpeg',
  ],
  'casual-male': [
    '2007951f6ca9ec14.jpeg',
    '211178fd4eee9a51.jpeg',
    '405f3342e93edfed.jpeg',
    '54791be83fbca130.jpeg',
    '82c302a2ab2c726b.jpeg',
    'a42e501aa4ccf4bd.jpeg',
    'casual 01.png',
    'casual 02.png',
    'casual 03.png',
    'casual 04.png',
    'casual 05.png',
    'fd030e3c06ee3a1c.jpeg',
  ],
  'casual-female': [
    '20bcf5e979d72454.jpeg',
    '210556acc0ae9f02.jpeg',
    '4f5aba0de2012a8d.jpeg',
    '56156a17daac2c37.jpeg',
    '5e3525c914922343.jpeg',
    '73885ea970de3938.jpeg',
    'e498b5a8d59b0a21.jpeg',
    'e90f072de2dc7e36.jpeg',
  ],
} as const

function urls(folder: keyof typeof FILES): string[] {
  return FILES[folder].map((f) => `${DIR}/${folder}/${encodeURIComponent(f)}`)
}

const MALE = {
  professional: urls('professional-male'),
  casual: urls('casual-male'),
}

const FEMALE = {
  professional: urls('professional-female'),
  casual: urls('casual-female'),
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
