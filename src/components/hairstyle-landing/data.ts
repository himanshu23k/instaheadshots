/**
 * Content for /hairstyle-landing. Copy, prices and the 40-style catalogs come
 * from the "Magic Studio Try-On v3" Claude Design flow; the splash imagery is
 * the Figma handover file (qcHjho1pUqaNeuYZpfsrG9, MWEB/WEB - Hairstyle).
 */

const A = '/hairstyle-landing'

export type CatalogKind = 'women' | 'men' | 'both'
export type SplashGender = 'women' | 'men'

export const WOMEN = [
  'Curtain bangs', 'Blunt bob', 'Wolf cut', 'Honey balayage', 'Long layers', 'Beach waves', 'Sleek ponytail',
  'Pixie cut', 'Shoulder lob', 'Braided crown', 'Copper red', 'Shag with fringe', 'Ash blonde', 'Half up twist',
  'Soft perm curls', 'French bob', 'Butterfly cut', 'Space buns', 'Low chignon', 'Money piece', 'Platinum blonde',
  'Micro fringe', 'Hime cut', 'Feathered layers', 'Slicked bun', 'Deep side part', 'Voluminous blowout',
  'Face framing highlights', 'Boho braids', 'Bixie cut', 'Jellyfish cut', 'Long ringlets', 'Wet look waves',
  'Chocolate brunette', 'Twin french braids', 'Layered curtain', 'Textured pixie', 'Beachy ombre', 'Top knot',
  'Peekaboo colour',
]

export const MEN = [
  'Textured crop', 'Buzz cut', 'Mid taper fade', 'Classic side part', 'Curly top', 'Slick back', 'Crew cut',
  'Modern quiff', 'Fringe flow', 'Undercut', 'Man bun', 'Short waves', 'Comb over', 'Long tousled', 'Faded caesar',
  'High and tight', 'Pompadour', 'Curtain fringe', 'Low drop fade', 'Shoulder length', 'Twists', 'Afro shape up',
  'Beard fade combo', 'Ivy league', 'Messy fringe', 'Wolf shag', 'Half ponytail', 'Skin fade line up',
  'Blowout taper', 'Bleached crop', 'Silver grey', 'Layered mullet', 'Loose curls', 'Slick side part',
  'Wavy mid length', 'Braided cornrows', 'Spiky short', 'Grown out fade', 'Textured mullet', 'Buzzed fringe',
]

/** Twenty of each, interleaved, so a mixed catalog is still forty. */
const BOTH = WOMEN.slice(0, 20).flatMap((w, i) => [w, MEN[i]])

export function styleNames(kind: CatalogKind | null): string[] {
  return kind === 'men' ? MEN : kind === 'both' ? BOTH : WOMEN
}

/** Catalog tiles are model shots, not the user. The Figma wig mockups stand in until per-style renders exist. */
const WOMEN_TILES = ['wt-pixie', 'wt-braided-waves', 'wt-updo', 'wt-long-straight', 'wt-waves', 'wt-long-waves']
const MEN_TILES = ['mt-fade', 'mt-afro', 'mt-wavy', 'mt-textured', 'mt-quiff']

export function catalogTile(kind: CatalogKind | null, index: number): string {
  const men = kind === 'men' || (kind === 'both' && index % 2 === 1)
  const list = men ? MEN_TILES : WOMEN_TILES
  const i = kind === 'both' ? Math.floor(index / 2) : index
  return `${A}/${list[i % list.length]}.jpg`
}

/**
 * Generated styles are faked in the prototype: the user's own photo with a
 * per-style grade, so each tile reads as a different take.
 */
export const LOOK_FX = [
  { filter: 'none', pos: 'center 30%' },
  { filter: 'saturate(1.12) contrast(1.04)', pos: 'center 22%' },
  { filter: 'saturate(.74) brightness(1.05)', pos: 'center 40%' },
  { filter: 'contrast(1.1) brightness(.97) saturate(1.06)', pos: 'center 34%' },
  { filter: 'sepia(.18) saturate(1.08)', pos: 'center 26%' },
  { filter: 'saturate(1.2) hue-rotate(-6deg)', pos: 'center 36%' },
  { filter: 'brightness(1.06) contrast(1.02)', pos: 'center 28%' },
  { filter: 'saturate(.9) sepia(.1)', pos: 'center 44%' },
  { filter: 'contrast(1.14) saturate(1.02)', pos: 'center 24%' },
  { filter: 'brightness(.96) saturate(1.14)', pos: 'center 38%' },
  { filter: 'sepia(.24) brightness(1.03)', pos: 'center 32%' },
  { filter: 'saturate(1.06) hue-rotate(4deg)', pos: 'center 20%' },
  { filter: 'contrast(1.06) brightness(1.02)', pos: 'center 42%' },
  { filter: 'saturate(.8) contrast(1.08)', pos: 'center 30%' },
  { filter: 'brightness(1.04) sepia(.14)', pos: 'center 26%' },
]

export const SAMPLE_MSGS = ['Reading your photo', 'Finding your features', 'Trying the first style on you']

/** One offer: every style in the catalog, unlocked together, shown against a struck-through list price. */
export const PRICE = 9
export const LIST_PRICE = 20

export const CHECKS = ['Face', 'Lighting', 'Quality'] as const

export type CheckFailure = { step: 0 | 1 | 2; title: string; fix: string }

export const FAILURES: Record<'face' | 'light' | 'small', CheckFailure> = {
  face: {
    step: 0,
    title: 'We could not get a clear read on the face',
    fix: 'This photo is cropped very long, so the face is hard to lock onto. Use a photo where your head and shoulders sit in the frame, facing the camera.',
  },
  light: {
    step: 1,
    title: 'The light is too uneven to work with',
    fix: 'One side of the face is much darker than the other, so the styles would come out blotchy. Try a photo taken facing a window or in flat daylight.',
  },
  small: {
    step: 2,
    title: 'This photo is too small to use',
    fix: 'It is under 500 pixels on its shortest side, which comes out soft. Send the original from your camera roll rather than a screenshot or a forwarded copy.',
  },
}

export const PHOTO_TIPS = [
  'Face fills a good part of the frame, looking at the camera',
  'Even light, no heavy shadow across the face',
  'The original file, not a screenshot or a forwarded copy',
]

/** The three catalogs, each previewed by a fan of three catalog tiles. */
type CatalogOption = { kind: CatalogKind; title: string; body: string; fan: [string, string, string] }
export const CATALOG_OPTIONS: CatalogOption[] = (
  [
  { kind: 'women', title: "Women's styles", body: 'Bobs, layers, waves, colour.', fan: ['wt-braided-waves', 'wt-pixie', 'wt-updo'] },
  { kind: 'men', title: "Men's styles", body: 'Crops, fades, quiffs, curls.', fan: ['mt-afro', 'mt-fade', 'mt-quiff'] },
  { kind: 'both', title: 'Both', body: 'A mixed catalog of forty.', fan: ['wt-waves', 'mt-fade', 'wt-pixie'] },
  ] satisfies CatalogOption[]
).map((o) => ({ ...o, fan: o.fan.map((t) => `${A}/${t}.jpg`) as [string, string, string] }))

/** What each photo check says while it runs, once it passes, and when it fails. */
export const CHECK_COPY: { running: string; passed: string; failed: string }[] = [
  { running: 'Looking for your face', passed: 'Face found', failed: 'No clear face' },
  { running: 'Checking the light', passed: 'Even light', failed: 'Uneven light' },
  { running: 'Checking sharpness', passed: 'Sharp enough', failed: 'Too small' },
]

/** "Your photo is yours" cards, after magicstudio.com's privacy row. */
export const PROMISES: { title: string; body: string; tint: string; icon: 'gift' | 'user' | 'trash' }[] = [
  {
    title: 'One style free',
    body: 'See a real hairstyle on your own face before you decide anything. You owe nothing if you stop there.',
    tint: 'linear-gradient(160deg, #EEF4FF 0%, #FFFFFF 70%)',
    icon: 'gift',
  },
  {
    title: 'No account needed',
    body: 'Upload, preview and check out as a guest. Create an account later only if you want your photos on every device.',
    tint: 'linear-gradient(160deg, #FFF0F7 0%, #FFFFFF 70%)',
    icon: 'user',
  },
  {
    title: 'Deleted if you do not buy',
    body: 'Your upload is used only for your styles. It is never shared, never sold, and never used to train anything.',
    tint: 'linear-gradient(160deg, #ECFBF6 0%, #FFFFFF 70%)',
    icon: 'trash',
  },
]

export const STEPS = [
  {
    n: '01',
    title: 'Upload one photo',
    body: 'Any clear photo of your face. We check it on the spot and tell you if it will not work.',
  },
  {
    n: '02',
    title: 'See one style free',
    body: 'We generate one style on your photo and show it to you before you pay for anything.',
  },
  {
    n: '03',
    title: 'Unlock all forty for $9',
    body: 'Every style in the catalog, generated after payment and landing in your gallery one by one.',
  },
]

/**
 * Magic Studio's Trustpilot standing and the six reviews magicstudio.com
 * shows, each linked to its Trustpilot page. These are real reviews of the
 * product, so the section never carries invented quotes.
 */
export const TRUSTPILOT = { rating: '5\u00a0/\u00a05', count: '17,062' }

export const REVIEWS = [
  { href: 'https://www.trustpilot.com/reviews/67e054a2c50c5ca9a0befe06', quote: 'Wow! My headshots are amazing. They look like I went to a photo studio.', name: 'P. Lee' },
  { href: 'https://www.trustpilot.com/reviews/67c65239f12073e4297701bc', quote: 'The shots came out amazing. I would have spent a fortune with a photographer to get this quality.', name: 'Jeff Mere' },
  { href: 'https://www.trustpilot.com/reviews/69aadc78aaa0c70fb3931a42', quote: 'Fast. Simple. Outstanding quality. I was simply blown away.', name: 'Sharon Keif' },
  { href: 'https://www.trustpilot.com/reviews/6a272097aa95ca6a5d3f93d8', quote: 'Shockingly good results. I look like the best version of myself.', name: 'Melody Todd' },
  { href: 'https://www.trustpilot.com/reviews/69f269a2fbc9ea8dbdcb0daf', quote: 'Seriously blown away by the quality and speed to create high-resolution photographs.', name: 'Lauren L.' },
  { href: 'https://www.trustpilot.com/reviews/69f63c5caddd1a6db039384a', quote: 'Amazing, true to person images nearly instantly. Not sure I\u2019ll ever hire a real photographer again!', name: 'Patricia Miser' },
]

export const FAQ = [
  {
    q: 'How many photos do I upload?',
    a: 'One. A single clear photo of your face carries every style in the catalog. The full photoshoot is the separate product that trains on more photos of you.',
  },
  {
    q: 'What does the free style include?',
    a: 'One real hairstyle generated on your own photo, shown watermarked so you can judge the likeness. It is included clean in whatever you buy after, and you owe nothing if you stop there.',
  },
  {
    q: 'What if a style does not look like me?',
    a: 'You can regenerate a style up to 2 times at no cost from your gallery. All purchases are final and there are no refunds, so the regenerations are how we make it right.',
  },
  {
    q: 'How long does a set take?',
    a: 'The free style takes a few seconds. Everything you buy is generated after payment and arrives style by style, usually inside a couple of minutes.',
  },
  {
    q: 'What happens to my photo?',
    a: 'If you do not buy, your upload is deleted. If you do, it is kept only to generate your styles and your regenerations, and it is never used to train anything.',
  },
]

/**
 * The Figma splash motion (hairstylist-motion.vercel.app): five styles on the
 * wheel, picks at index 2 then 3, and the photo for each beat. Women's swatches
 * come in blonde and ash (the wheel recolours on its second turn); men's have
 * one shade. `serif` is the letter Figma sets in Libre Baskerville.
 */
type SplashMotion = {
  models: { base: string; pick1: string; pick2: string }
  thumb: (style: number) => { blonde: string; ash: string }
  /** Caption reel: first pick, second pick, then the next style peeking below. */
  reel: { name: string; serif?: number }[]
}

const WOMEN_WHEEL = ['messy-bun', 'straight', 'pixie-cut', 'princess-braids', 'wolf-cut']
const MEN_WHEEL = ['mt-wavy', 'mt-textured', 'mt-fade', 'mt-afro', 'mt-quiff']

export const SPLASH_MOTION: Record<SplashGender, SplashMotion> = {
  women: {
    models: { base: `${A}/w-original.jpg`, pick1: `${A}/w-pixie.jpg`, pick2: `${A}/w-braids.jpg` },
    thumb: (i) => ({
      blonde: `${A}/splash/${WOMEN_WHEEL[i]}-blonde.png`,
      ash: `${A}/splash/${WOMEN_WHEEL[i]}-ash.png`,
    }),
    reel: [
      { name: 'Pixie cut', serif: 6 },
      { name: 'Princess braids', serif: 11 },
      { name: 'Wolf cut', serif: 6 },
    ],
  },
  men: {
    models: { base: `${A}/m-original.jpg`, pick1: `${A}/m-lowfade.jpg`, pick2: `${A}/m-afro.jpg` },
    thumb: (i) => ({ blonde: `${A}/${MEN_WHEEL[i]}.jpg`, ash: `${A}/${MEN_WHEEL[i]}.jpg` }),
    reel: [
      { name: 'Low fade', serif: 5 },
      { name: 'Afro', serif: 2 },
      { name: 'Quiff', serif: 2 },
    ],
  },
}

/** "How it works" polaroids: the upload, the free style, the set — for whichever photo the hero shows. */
export const STEP_PHOTOS: Record<SplashGender, [string, string, string]> = {
  women: [`${A}/w-original.jpg`, `${A}/w-pixie.jpg`, `${A}/w-braids.jpg`],
  men: [`${A}/m-original.jpg`, `${A}/m-lowfade.jpg`, `${A}/m-afro.jpg`],
}

/** "Same face, forty looks": the upload, then real renders from it. */
export const LOOKBOOK: Record<SplashGender, { name: string; photo: string; before?: boolean }[]> = {
  women: [
    { name: 'Her upload', photo: `${A}/w-original.jpg`, before: true },
    { name: 'Pixie cut', photo: `${A}/w-pixie.jpg` },
    { name: 'Princess braids', photo: `${A}/w-braids.jpg` },
  ],
  men: [
    { name: 'His upload', photo: `${A}/m-original.jpg`, before: true },
    { name: 'Low fade', photo: `${A}/m-lowfade.jpg` },
    { name: 'Afro', photo: `${A}/m-afro.jpg` },
  ],
}

/** Magic Studio brand assets, from magicstudio.com. */
export const BRAND = {
  logo: `${A}/brand/studio-logo.svg`,
  logoLight: `${A}/brand/studio-logo-light.svg`,
  logoMark3d: `${A}/brand/logo-wink-320.webp`,
  signage: `${A}/brand/signage-web.svg`,
  footerGlow: `${A}/brand/gradient-blob.webp`,
  reviews: {
    laurel: `${A}/brand/reviews/laurel.svg`,
    stars: `${A}/brand/reviews/trustpilot-stars.svg`,
    wordmarkInk: `${A}/brand/reviews/trustpilot-type-ink.svg`,
    wordmarkWhite: `${A}/brand/reviews/trustpilot-type-white.svg`,
    glow: `${A}/brand/reviews/glow.webp`,
    scribble: `${A}/brand/reviews/scribble.svg`,
  },
}

/** Used when a state is opened straight from the URL (?screen=…) without an upload. */
export const DEMO_PHOTO = `${A}/w-original.jpg`
