/**
 * Catalog + mock renders for /try-it-on.
 *
 * Every image here comes from the Figma file (kpKr8Y0Wc7QtZ2FVolIySo). There is
 * no generation backend yet, so a "try-on" resolves to one of the pre-rendered
 * looks in RENDERS — the closest one to the pieces the user picked.
 */

const A = '/try-it-on'

/** Builder slots, in the order the Complete the Look sheet lists them. */
export type Slot = 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'bag' | 'glasses' | 'hat'

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
}

// ── The two pieces the base photo is wearing ─────────────────────────────────
export const BASE_PIECES: Garment[] = [
  {
    id: 'base-tee',
    name: 'White tee',
    slot: 'top',
    image: `${A}/base.jpg`,
    look: 'product',
    source: 'base',
    crop: { position: '50% 48%', scale: 2.2 },
  },
  {
    id: 'base-jeans',
    name: 'Black jeans',
    slot: 'bottom',
    image: `${A}/base.jpg`,
    look: 'product',
    source: 'base',
    crop: { position: '50% 96%', scale: 2.2 },
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

export const garmentById = (id: string): Garment | undefined =>
  GARMENTS.find((x) => x.id === id) ?? BASE_PIECES.find((x) => x.id === id)

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
  const ids = pieces.map((p) => p.renderAs ?? p.id)
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
