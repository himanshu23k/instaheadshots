/**
 * Catalog + mock renders for /try-it-on.
 *
 * Every image here comes from the Figma file (kpKr8Y0Wc7QtZ2FVolIySo). There is
 * no generation backend yet, so a "try-on" resolves to one of the pre-rendered
 * looks in RENDERS — the closest one to the pieces the user picked.
 */

const A = '/try-it-on'

/** Builder slots, in the order the Complete the Look sheet lists them. */
export type Slot = 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'bag' | 'glasses' | 'hat' | 'jewelry'

export const SLOT_ORDER: Slot[] = ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'bag']

export const SLOT_LABEL: Record<Slot, string> = {
  top: 'Top',
  bottom: 'Bottom',
  dress: 'Dress',
  outerwear: 'Outerwear',
  shoes: 'Shoes',
  bag: 'Bag',
  glasses: 'Glasses',
  hat: 'Hat',
  jewelry: 'Jewelry',
}

export type PieceSource = 'base' | 'catalog' | 'link' | 'upload'

export type CollectionTag = 'casual' | 'professional' | 'occasional'

export type Garment = {
  id: string
  name: string
  slot: Slot
  image: string
  /** Product shots sit on white; mannequin cut-outs sit on the #F0F0F0 tile. */
  look: 'mannequin' | 'product'
  source: PieceSource
  tags?: CollectionTag[]
  /** For pieces crops of a bigger photo (base pieces, items found in a photo). */
  crop?: { position: string; scale: number }
  /** Catalog piece to render with — link/upload pieces borrow the closest one. */
  renderAs?: string
  /** A full studio photo rather than a cut-out: it covers its tile instead of sitting inside it. */
  fill?: boolean
  /** A whole outfit (an uploaded reference photo): the pre-rendered pieces it stands in for. */
  renderPieces?: string[]
}

// ── The two pieces the base photo is wearing ─────────────────────────────────
export const BASE_PIECES: Garment[] = [
  // Figma 3380:166586 "Mannequin": the base outfit's own pieces, shot like the catalog.
  { id: 'base-tee', name: 'White tee', slot: 'top', image: `${A}/v4/m-base-tee.jpg`, look: 'mannequin', source: 'base', fill: true },
  {
    id: 'base-jeans',
    name: 'Black jeans',
    slot: 'bottom',
    image: `${A}/v4/m-base-trousers.jpg`,
    look: 'mannequin',
    source: 'base',
    fill: true,
  },
]

const g = (
  id: string,
  name: string,
  slot: Slot,
  file: string,
  tags: CollectionTag[] = [],
  look: Garment['look'] = 'mannequin',
): Garment => ({ id, name, slot, image: `${A}/${file}`, look, source: 'catalog', tags })

export const GARMENTS: Garment[] = [
  g('denim-jacket', 'Denim Jacket', 'outerwear', 'g-denim-jacket.png', ['casual']),
  g('strips-shrug', 'Strips Shrug', 'top', 'g-strips-shrug.png', ['casual']),
  g('checks-shirt', 'Checks Blue Shirt', 'top', 'g-checks-shirt.png', ['casual', 'professional']),
  g('leather-jacket', 'Leather Jacket', 'outerwear', 'g-leather-jacket.png', ['casual', 'occasional']),
  g('brown-jacket', 'Brown Jacket', 'outerwear', 'g-brown-jacket.png', ['casual']),
  g('denim-jeans', 'Denim Blue Jeans', 'bottom', 'g-denim-jeans.png', ['casual']),
  g('office-pants', 'Office Pants', 'bottom', 'g-office-pants.png', ['professional']),
  g('mini-skirt', 'Mini Denim Skirt', 'bottom', 'g-mini-skirt.png', ['casual', 'occasional']),
  g('grey-joggers', 'Grey Joggers', 'bottom', 'g-grey-pants.png', ['casual']),
  g('knitwear', 'Knitwear', 'top', 'g-knitwear.png', ['casual', 'professional']),
  g('blue-sweatshirt', 'Blue SweatShirt', 'top', 'p-blue-sweatshirt.jpg', ['casual'], 'product'),
  g('brown-blazer', 'Brown Blazer', 'outerwear', 'p-brown-blazer.jpg', ['professional'], 'product'),
  g('denim-dress', 'Denim Dress', 'dress', 'p-denim-dress.jpg', ['occasional', 'casual'], 'product'),
]

/**
 * v4's catalog — Figma 3380:166586 ("🍍 assets"), every piece on a studio
 * mannequin. There are no renders of these yet, so each borrows the nearest
 * piece that has one (`renderAs`) for the pre-rendered result.
 */
const v4 = (
  id: string,
  name: string,
  slot: Slot,
  renderAs?: string,
): Garment => ({ id, name, slot, image: `${A}/v4/${id}.jpg`, look: 'mannequin', source: 'catalog', renderAs, fill: true })

export const V4_GARMENTS: Garment[] = [
  v4('t-white-tee', 'White Tee', 'top', 'base-tee'),
  v4('t-purple-corset', 'Purple Corset', 'top', 'checks-shirt'),
  v4('t-black-cami', 'Black Satin Cami', 'top', 'checks-shirt'),
  v4('t-blue-shirt', 'Light Blue Shirt', 'top', 'checks-shirt'),
  v4('t-white-shirt', 'White Shirt', 'top', 'checks-shirt'),
  v4('t-sage-tee', 'Sage Tee', 'top', 'base-tee'),
  v4('t-sage-puff', 'Sage Puff Sleeve Top', 'top', 'checks-shirt'),
  v4('l-grey-hoodie', 'Grey Zip Hoodie', 'outerwear', 'leather-jacket'),
  v4('l-denim-jacket', 'Denim Jacket', 'outerwear', 'denim-jacket'),
  v4('l-camel-blazer', 'Camel Blazer', 'outerwear', 'leather-jacket'),
  v4('l-cream-cardigan', 'Cream Cardigan', 'outerwear', 'leather-jacket'),
  v4('l-olive-overshirt', 'Olive Overshirt', 'outerwear', 'leather-jacket'),
  v4('b-white-palazzo', 'White Palazzo', 'bottom', 'denim-jeans'),
  v4('b-light-jeans', 'Light Wash Jeans', 'bottom', 'denim-jeans'),
  v4('b-black-trousers', 'Black Wide Trousers', 'bottom', 'denim-jeans'),
  v4('b-beige-skirt', 'Beige Pleated Skirt', 'bottom', 'denim-jeans'),
  v4('b-denim-shorts', 'Denim Shorts', 'bottom', 'denim-jeans'),
  v4('d-black-slip', 'Black Slip Dress', 'dress', 'denim-dress'),
  v4('d-red-dress', 'Red One-Shoulder Dress', 'dress', 'denim-dress'),
  v4('d-yellow-maxi', 'Yellow Tiered Maxi', 'dress', 'denim-dress'),
  v4('d-mustard-kurta', 'Mustard Kurta', 'dress', 'denim-dress'),
  v4('d-indigo-kurta', 'Indigo Print Kurta', 'dress', 'denim-dress'),
  v4('d-lehenga', 'Lehenga Set', 'dress', 'denim-dress'),
  v4('s-white-sneakers', 'White Sneakers', 'shoes'),
  v4('s-black-pumps', 'Black Pumps', 'shoes'),
  v4('s-suede-boots', 'Tan Suede Boots', 'shoes'),
  v4('s-brown-loafers', 'Brown Loafers', 'shoes'),
  v4('a-black-shoulder-bag', 'Black Shoulder Bag', 'bag'),
  v4('a-canvas-tote', 'Canvas Tote', 'bag'),
  v4('a-tan-handbag', 'Tan Top-Handle Bag', 'bag'),
  v4('a-gold-potli', 'Gold Potli', 'bag'),
  { ...v4('a-tortoise-sunglasses', 'Tortoise Sunglasses', 'glasses'), image: `${A}/v4/a-tortoise-sunglasses.png` },
  v4('a-green-cap', 'Green Cap', 'hat'),
  v4('a-gold-earrings', 'Gold Earrings', 'jewelry'),
  v4('a-gold-pendant', 'Gold Pendant', 'jewelry'),
  v4('a-silver-watch', 'Silver Watch', 'jewelry'),
]

/** v4 Top Picks on the base — Figma 3390:237585 (Purple Corset, Grey Zipper, Black Dress). */
export const V4_TOP_PICKS = ['t-purple-corset', 'l-grey-hoodie', 'd-black-slip']

export const garmentById = (id: string): Garment | undefined =>
  GARMENTS.find((x) => x.id === id) ?? V4_GARMENTS.find((x) => x.id === id) ?? BASE_PIECES.find((x) => x.id === id)

/** "Suggested for you" on the very first pick — Figma 370:45070. */
export const FIRST_SUGGESTIONS = ['denim-jacket', 'strips-shrug', 'checks-shirt']

/** Browse our collection — Figma 370:70760, in Figma's order. */
export const COLLECTION = [
  'blue-sweatshirt',
  'brown-blazer',
  'knitwear',
  'denim-dress',
  'mini-skirt',
  'grey-joggers',
  'checks-shirt',
  'leather-jacket',
  'office-pants',
  'denim-jeans',
]

export const COLLECTION_FILTERS: { id: 'all' | CollectionTag; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'casual', label: 'Casual' },
  { id: 'professional', label: 'Professional' },
  { id: 'occasional', label: 'Occasional' },
]

/** Builder suggestions per slot — "Suggested for this look". */
export const SLOT_SUGGESTIONS: Record<Slot, string[]> = {
  top: ['checks-shirt', 'blue-sweatshirt', 'strips-shrug', 'knitwear'],
  bottom: ['denim-jeans', 'office-pants', 'mini-skirt', 'grey-joggers'],
  dress: ['denim-dress'],
  outerwear: ['leather-jacket', 'denim-jacket', 'brown-jacket', 'brown-blazer'],
  shoes: [],
  bag: [],
  glasses: [],
  hat: [],
  jewelry: [],
}

// ── Paste a product link ─────────────────────────────────────────────────────
export type LinkProduct = {
  title: string
  store: string
  photos: { id: string; label: string; image: string }[]
  /** What we pull out of the product's model shot, for the builder flow. */
  items: FoundItem[]
}

export type FoundItem = Garment & { found: { x: number; y: number; w: number; h: number } }

const TEDDY: Garment = {
  id: 'teddy-jacket',
  name: 'Teddy Jacket',
  slot: 'outerwear',
  image: `${A}/l-teddy-flat.jpg`,
  look: 'product',
  source: 'link',
}

export const ZARA_TEDDY: LinkProduct = {
  title: 'Teddy jacket from Zara, $128',
  store: 'Zara',
  photos: [
    { id: 'model', label: 'On Model', image: `${A}/l-teddy-model.jpg` },
    { id: 'flat', label: 'Flat', image: `${A}/l-teddy-flat.jpg` },
    { id: 'detail', label: 'Detail', image: `${A}/l-teddy-detail.jpg` },
  ],
  items: [
    { ...TEDDY, found: { x: 15, y: 17, w: 65, h: 48 } },
    {
      id: 'zara-knit',
      name: 'Red Knit',
      slot: 'top',
      image: `${A}/l-teddy-model.jpg`,
      look: 'product',
      source: 'link',
      renderAs: 'knitwear',
      found: { x: 25, y: 62, w: 45, h: 26 },
    },
    {
      id: 'zara-trousers',
      name: 'White Trousers',
      slot: 'bottom',
      image: `${A}/l-teddy-model.jpg`,
      look: 'product',
      source: 'link',
      renderAs: 'denim-jeans',
      found: { x: 22, y: 76, w: 48, h: 24 },
    },
  ],
}

/**
 * v4 "Uploads/Product Links" (Figma 3380:166586): one product per page, shot flat.
 * Which one a link finds is picked from the link itself, so different links
 * find different products; a link to the teddy jacket still finds it.
 */
const flatProduct = (
  id: string,
  title: string,
  store: string,
  name: string,
  slot: Slot,
  renderAs: string,
): LinkProduct => {
  const image = `${A}/v4/${id}.jpg`
  return {
    title,
    store,
    photos: [{ id: 'flat', label: 'Flat', image }],
    items: [{ id, name, slot, image, look: 'product', source: 'link', renderAs, found: { x: 8, y: 6, w: 84, h: 88 } }],
  }
}

export const LINK_PRODUCTS: LinkProduct[] = [
  flatProduct('p-linen-shirt', 'Linen shirt from COS, $89', 'COS', 'Linen Shirt', 'top', 'checks-shirt'),
  flatProduct('p-sage-puff-top', 'Puff sleeve top from Mango, $46', 'Mango', 'Sage Puff Sleeve Top', 'top', 'checks-shirt'),
  flatProduct('p-sage-midi-skirt', 'Linen midi skirt from Mango, $59', 'Mango', 'Sage Midi Skirt', 'bottom', 'denim-jeans'),
  flatProduct('p-rust-overshirt', 'Corduroy overshirt from Arket, $99', 'Arket', 'Rust Overshirt', 'outerwear', 'leather-jacket'),
  flatProduct('p-brown-trousers', 'Wide trousers from & Other Stories, $119', '& Other Stories', 'Brown Wide Trousers', 'bottom', 'denim-jeans'),
]

/** Words in a link that point at one product: its store, or what it is. */
const LINK_HINTS: [RegExp, string][] = [
  [/teddy|zara/, 'teddy'],
  [/cos\.|linen-?shirt|shirt/, 'p-linen-shirt'],
  [/skirt/, 'p-sage-midi-skirt'],
  [/mango|puff|top/, 'p-sage-puff-top'],
  [/arket|overshirt|jacket/, 'p-rust-overshirt'],
  [/stories|trouser|pant/, 'p-brown-trousers'],
]

export function productForLink(url: string): LinkProduct {
  const u = url.toLowerCase()
  const hint = LINK_HINTS.find(([re]) => re.test(u))?.[1]
  if (hint === 'teddy') return ZARA_TEDDY
  const hinted = LINK_PRODUCTS.find((p) => p.items[0].id === hint)
  if (hinted) return hinted
  let h = 0
  for (const ch of url) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return LINK_PRODUCTS[h % LINK_PRODUCTS.length]
}

/** Links that fail, so the error states in Figma (370:56843, 370:56872) can be reached. */
export function classifyLink(url: string): 'ok' | 'invalid' | 'blocked' {
  const u = url.trim().toLowerCase()
  // Figma's blocked example is "https://h&m/product-teddyjacket", so check stores first.
  if (u.includes('h&m') || u.includes('hm.com')) return 'blocked'
  if (!u || /\s/.test(u) || !/[a-z0-9-]+\.[a-z]{2,}/.test(u)) return 'invalid'
  return 'ok'
}

// ── Upload a photo ───────────────────────────────────────────────────────────
export type UploadSample = {
  id: string
  label: string
  image: string
  items: FoundItem[]
}

const photoItem = (
  id: string,
  name: string,
  slot: Slot,
  found: FoundItem['found'],
  renderAs?: string,
): FoundItem => ({ id, name, slot, image: '', look: 'product', source: 'upload', renderAs, found })

/** Real-life photos from Figma 3380:166586 "Uploads/Product Links"; boxes are percent of the photo. */
/**
 * v6: an uploaded photo taken as one whole outfit, not split into pieces. It
 * fills the dress slot (so it covers top and bottoms) and renders as the
 * closest pre-made look to everything in the photo.
 */
export function outfitFromPhoto(sample: UploadSample, image: string): Garment {
  return {
    id: `outfit-${sample.id}`,
    name: 'Outfit from your photo',
    slot: 'dress',
    image,
    look: 'product',
    source: 'upload',
    fill: true,
    renderPieces: sample.items.map((it) => it.renderAs).filter((id): id is string => !!id),
  }
}

export const V4_UPLOAD_SAMPLES: UploadSample[] = [
  {
    id: 'mirror-overshirt',
    label: 'Mirror selfie',
    image: `${A}/v4/u-mirror-overshirt.jpg`,
    items: [
      photoItem('up-olive-overshirt', 'Olive Overshirt', 'outerwear', { x: 34, y: 23, w: 26, h: 29 }, 'leather-jacket'),
      photoItem('up-cream-trousers', 'Cream Trousers', 'bottom', { x: 36, y: 40, w: 24, h: 47 }, 'denim-jeans'),
      photoItem('up-white-sneakers', 'White Sneakers', 'shoes', { x: 42, y: 80, w: 18, h: 11 }),
    ],
  },
  {
    id: 'street-duo',
    label: 'Street photo',
    image: `${A}/v4/u-street-duo.jpg`,
    items: [
      photoItem('up-rust-jacket', 'Rust Jacket', 'outerwear', { x: 30, y: 27, w: 23, h: 26 }, 'leather-jacket'),
      photoItem('up-brown-trousers', 'Brown Trousers', 'bottom', { x: 35, y: 42, w: 17, h: 47 }, 'denim-jeans'),
      photoItem('up-green-knit', 'Green Knit', 'top', { x: 52, y: 27, w: 20, h: 24 }, 'knitwear'),
      photoItem('up-brown-bag', 'Brown Shoulder Bag', 'bag', { x: 62, y: 43, w: 12, h: 10 }),
    ],
  },
  {
    id: 'mirror-jeans',
    label: 'Tee and jeans',
    image: `${A}/v4/u-mirror-jeans.jpg`,
    items: [
      photoItem('up-oversized-tee', 'Oversized Tee', 'top', { x: 34, y: 27, w: 26, h: 23 }, 'base-tee'),
      photoItem('up-light-jeans', 'Light Wash Jeans', 'bottom', { x: 38, y: 46, w: 20, h: 43 }, 'denim-jeans'),
      photoItem('up-white-trainers', 'White Trainers', 'shoes', { x: 38, y: 82, w: 16, h: 12 }),
    ],
  },
]

export const UPLOAD_SAMPLES: UploadSample[] = [
  {
    id: 'street',
    label: 'Street photo',
    image: `${A}/u-coffee.jpg`,
    items: [
      {
        id: 'up-sweater',
        name: 'Grey Sweater',
        slot: 'top',
        image: `${A}/u-coffee.jpg`,
        look: 'product',
        source: 'upload',
        renderAs: 'knitwear',
        found: { x: 25, y: 20, w: 50, h: 35 },
      },
      {
        id: 'up-plaid-skirt',
        name: 'Plaid Skirt',
        slot: 'bottom',
        image: `${A}/u-coffee.jpg`,
        look: 'product',
        source: 'upload',
        renderAs: 'mini-skirt',
        found: { x: 42, y: 50, w: 28, h: 18 },
      },
      {
        id: 'up-mary-janes',
        name: 'Mary Janes',
        slot: 'shoes',
        image: `${A}/u-coffee.jpg`,
        look: 'product',
        source: 'upload',
        found: { x: 48, y: 83, w: 30, h: 12 },
      },
    ],
  },
  {
    id: 'mirror',
    label: 'Mirror selfie',
    image: `${A}/u-mirror.jpg`,
    items: [
      {
        id: 'up-white-tee',
        name: 'White Tee',
        slot: 'top',
        image: `${A}/u-mirror.jpg`,
        look: 'product',
        source: 'upload',
        renderAs: 'base-tee',
        found: { x: 5, y: 20, w: 80, h: 42 },
      },
      {
        id: 'up-pink-shorts',
        name: 'Pink Shorts',
        slot: 'bottom',
        image: `${A}/u-mirror.jpg`,
        look: 'product',
        source: 'upload',
        renderAs: 'mini-skirt',
        found: { x: 25, y: 62, w: 57, h: 28 },
      },
    ],
  },
]

// ── Pre-rendered looks ───────────────────────────────────────────────────────
export type Render = {
  image: string
  /** Waist-up keeps the base framing; adding a bottom switches to full body. */
  framing: 'waist' | 'full'
  pieces: string[]
  /** Where each piece sits in the photo, for tap-to-swap (percent of the card). */
  hotspots?: Partial<Record<Slot, { x: number; y: number }>>
}

export const BASE_RENDER: Render = {
  image: `${A}/base.jpg`,
  framing: 'waist',
  pieces: ['base-tee', 'base-jeans'],
}

export const RENDERS: Render[] = [
  BASE_RENDER,
  { image: `${A}/r-checks-shirt.jpg`, framing: 'waist', pieces: ['checks-shirt', 'base-jeans'] },
  { image: `${A}/r-teddy.jpg`, framing: 'waist', pieces: ['base-tee', 'teddy-jacket', 'base-jeans'] },
  { image: `${A}/r-sweatshirt.jpg`, framing: 'waist', pieces: ['blue-sweatshirt', 'base-jeans'] },
  {
    image: `${A}/r-leather-shirt.jpg`,
    framing: 'waist',
    pieces: ['checks-shirt', 'leather-jacket', 'base-jeans'],
  },
  {
    image: `${A}/r-checks-shirt-jeans.jpg`,
    framing: 'full',
    pieces: ['checks-shirt', 'denim-jeans'],
    hotspots: { top: { x: 50, y: 30 }, bottom: { x: 46, y: 66 } },
  },
  {
    image: `${A}/r-teddy-jeans.jpg`,
    framing: 'full',
    pieces: ['base-tee', 'teddy-jacket', 'denim-jeans'],
    hotspots: { outerwear: { x: 54, y: 30 }, bottom: { x: 46, y: 68 } },
  },
  {
    image: `${A}/r-sweatshirt-jeans.jpg`,
    framing: 'full',
    pieces: ['blue-sweatshirt', 'denim-jeans'],
    hotspots: { top: { x: 50, y: 28 }, bottom: { x: 46, y: 66 } },
  },
  {
    image: `${A}/r-denim-dress.jpg`,
    framing: 'full',
    pieces: ['denim-dress'],
    hotspots: { dress: { x: 50, y: 52 } },
  },
  {
    image: `${A}/r-denim-dress-jacket.jpg`,
    framing: 'full',
    pieces: ['denim-dress', 'denim-jacket'],
    hotspots: { outerwear: { x: 34, y: 26 }, dress: { x: 52, y: 62 } },
  },
]

/**
 * Pick the pre-rendered look closest to `pieces`. Link/upload pieces stand in
 * for their `renderAs` catalog piece. Exact matches win; otherwise the look
 * sharing the most pieces, preferring the framing the outfit implies.
 */
export function resolveRender(pieces: Garment[]): Render {
  const ids = pieces.flatMap((p) => p.renderPieces ?? [p.renderAs ?? p.id])
  const wantsFull = pieces.some((p) => p.slot === 'dress' || (p.slot === 'bottom' && p.source !== 'base'))
  const score = (r: Render) => {
    const shared = r.pieces.filter((id) => ids.includes(id)).length
    const extra = r.pieces.length - shared
    const exact = shared === ids.length && extra === 0 ? 100 : 0
    const framing = (r.framing === 'full') === wantsFull ? 3 : 0
    return exact + shared * 10 - extra * 4 + framing
  }
  return [...RENDERS].sort((a, b) => score(b) - score(a))[0]
}

// ── Generation copy ──────────────────────────────────────────────────────────
/** Staged loader from Figma 370:45210 → 370:47723. */
export const GENERATING_STEPS = ['Matching your outfit', 'Almost there', 'Adjusting Lighting']

/** "What didn't look right?" — Figma 370:58464. */
export const REDO_REASONS = [
  "Don't look like me",
  "Don't look realistic",
  'Body proportions look off',
  'I look too young or too old',
  "I don't like the outfits",
  "I don't like the backdrops",
  'Wrong hair color',
  'Wrong hairstyle',
  'My glasses are missing',
  "I don't wear glasses",
]

/** Buy credits — Figma 370:58382. Prices in rupees. */
export const CREDIT_PACKS = [
  { id: 'c10', credits: 10, price: 800, strike: null as number | null, perCredit: 72 },
  { id: 'c20', credits: 20, price: 3600, strike: 4000, perCredit: 72 },
  { id: 'c100', credits: 100, price: 4000, strike: 8000, perCredit: 40, best: true },
  { id: 'c200', credits: 200, price: 11200, strike: 16000, perCredit: 72 },
]

/** Splash carousel — Figma 370:84274. */
export const SPLASH_LOOKS = [
  { model: `${A}/s-tank.png`, left: `${A}/s-denim-dress-garment.png`, right: `${A}/s-pink-garment.png` },
  { model: `${A}/s-pink.png`, left: `${A}/s-pink-garment.png`, right: `${A}/s-brown-dress-garment.jpg` },
  { model: `${A}/s-brown-dress.png`, left: `${A}/s-pink-garment.png`, right: `${A}/s-denim-dress-garment.png` },
]

/** What the new piece does to the photo, worded as in Figma. */
export function framingHint(pieces: Garment[], added: Garment[]): string | null {
  if (added.some((p) => p.slot === 'dress'))
    return 'Replaces your top and bottoms. This photo will be full body, so you can see the whole outfit.'
  const wasWaistUp = !pieces.some((p) => p.slot === 'dress' || (p.slot === 'bottom' && p.source !== 'base'))
  if (wasWaistUp && added.some((p) => p.slot === 'bottom'))
    return 'Completes your look by adding a bottom. This photo will be full body, so you can see the whole outfit.'
  const layered = added.find((p) => p.slot === 'outerwear')
  if (layered) {
    const under = pieces.find((p) => p.slot === 'dress') ?? pieces.find((p) => p.slot === 'top')
    if (under && under.source !== 'base') return `This will get added onto your ${under.name}`
  }
  return null
}

/**
 * v4 "Complete the look" tabs (Figma 3396:15993), one per kind of attire tile,
 * each covering the builder slots it holds. `icon` is that type's art from
 * Figma 3380:218932, shown wherever the type has nothing picked yet; Dress and
 * Shoes have none there, so they fall back to the attire grid's ghost art.
 */
export type LookTab = 'top' | 'layer' | 'bottom' | 'dress' | 'shoes' | 'accessories'

export const LOOK_TABS: { id: LookTab; label: string; slots: Slot[]; icon?: string; upload: string }[] = [
  { id: 'top', label: 'Top', slots: ['top'], icon: `${A}/type-top.png`, upload: 'Upload a top' },
  { id: 'layer', label: 'Layer', slots: ['outerwear'], icon: `${A}/type-layer.png`, upload: 'Upload a layer' },
  { id: 'bottom', label: 'Bottoms', slots: ['bottom'], icon: `${A}/type-bottom.png`, upload: 'Upload bottoms' },
  { id: 'dress', label: 'Dress', slots: ['dress'], upload: 'Upload a dress' },
  { id: 'shoes', label: 'Shoes', slots: ['shoes'], upload: 'Upload shoes' },
  {
    id: 'accessories',
    label: 'Accessories',
    slots: ['bag', 'glasses', 'hat', 'jewelry'],
    icon: `${A}/type-accessories.png`,
    upload: 'Upload an accessory',
  },
]

export const lookTabFor = (slot: Slot): LookTab => LOOK_TABS.find((t) => t.slots.includes(slot))!.id

/** What a tab is wearing; accessories show the first one picked. */
export function pieceInTab(pieces: Partial<Record<Slot, Garment>>, tab: LookTab): Garment | undefined {
  const def = LOOK_TABS.find((t) => t.id === tab)!
  return def.slots.map((s) => pieces[s]).find((p): p is Garment => !!p)
}

/**
 * First tab still on your base — where completing the look picks up. A dress
 * stands in for top and bottoms, and either of those rules the dress out.
 */
export function firstEmptyTab(pieces: Partial<Record<Slot, Garment>>): LookTab {
  const covered = (t: LookTab) =>
    (!!pieces.dress && (t === 'top' || t === 'bottom')) || (t === 'dress' && !!(pieces.top || pieces.bottom))
  return LOOK_TABS.find((t) => !pieceInTab(pieces, t.id) && !covered(t.id))?.id ?? 'top'
}

/**
 * v3 "Style me": whole outfits whose pieces go together. The first few match a
 * pre-rendered look exactly, so trying them on shows the real result.
 */
export const STYLE_COMBOS: { id: string; name: string; pieces: string[] }[] = [
  { id: 'weekend-check', name: 'Weekend Check', pieces: ['checks-shirt', 'denim-jeans'] },
  { id: 'denim-on-denim', name: 'Denim on Denim', pieces: ['denim-dress', 'denim-jacket'] },
  { id: 'blue-crew', name: 'Blue Crew', pieces: ['blue-sweatshirt', 'denim-jeans'] },
  { id: 'check-and-leather', name: 'Check & Leather', pieces: ['checks-shirt', 'leather-jacket'] },
  { id: 'sunday-dress', name: 'Sunday Dress', pieces: ['denim-dress'] },
  { id: 'office-ready', name: 'Office Ready', pieces: ['knitwear', 'office-pants', 'brown-blazer'] },
  { id: 'night-out', name: 'Night Out', pieces: ['strips-shrug', 'mini-skirt', 'leather-jacket'] },
  { id: 'easy-layers', name: 'Easy Layers', pieces: ['blue-sweatshirt', 'grey-joggers', 'brown-jacket'] },
]
