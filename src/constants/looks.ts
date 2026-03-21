import type { StyleLook } from '@/types/studio'

export const STYLE_LOOKS: StyleLook[] = [
  {
    id: 'look-corporate',
    name: 'Corporate',
    description: 'Grey studio + navy blazer + neutral lighting',
    stations: ['setting', 'style'],
    cost: 2,
    preview: '/mock/renders/render-01.jpg',
    selections: {
      setting: { backgroundId: 'bg-grey-studio', customUpload: null },
      style: { outfitId: 'outfit-black-blazer', variantId: null, shopProduct: null },
    },
  },
  {
    id: 'look-creative',
    name: 'Creative Director',
    description: 'Brick wall + turtleneck + warm editorial tones',
    stations: ['setting', 'style', 'refine'],
    cost: 3,
    preview: '/mock/renders/render-02.jpg',
    selections: {
      setting: { backgroundId: 'bg-city-street', customUpload: null },
      style: { outfitId: 'outfit-turtleneck', variantId: null, shopProduct: null },
      refine: {
        prompt: 'Warmer lighting, editorial feel',
        adjustments: { saturation: 120, brightness: 105, temperature: 15, hue: 0 },
        eraserPoints: [],
        brushSize: 20,
      },
    },
  },
  {
    id: 'look-dating',
    name: 'Dating Ready',
    description: 'Cafe backdrop + casual shirt + soft bokeh',
    stations: ['setting', 'style'],
    cost: 2,
    preview: '/mock/renders/render-03.jpg',
    selections: {
      setting: { backgroundId: 'bg-cafe', customUpload: null },
      style: { outfitId: 'outfit-casual-shirt', variantId: null, shopProduct: null },
    },
  },
  {
    id: 'look-executive',
    name: 'Executive',
    description: 'Dark studio + charcoal suit + dramatic lighting',
    stations: ['setting', 'style'],
    cost: 2,
    preview: '/mock/renders/render-04.jpg',
    selections: {
      setting: { backgroundId: 'bg-dark-grey', customUpload: null },
      style: { outfitId: 'outfit-charcoal-suit', variantId: null, shopProduct: null },
    },
  },
  {
    id: 'look-fresh',
    name: 'Fresh Start',
    description: 'Outdoor park + casual fit + bright natural light',
    stations: ['setting', 'style', 'refine'],
    cost: 3,
    preview: '/mock/renders/render-05.jpg',
    selections: {
      setting: { backgroundId: 'bg-garden', customUpload: null },
      style: { outfitId: 'outfit-polo', variantId: null, shopProduct: null },
      refine: {
        prompt: 'Brighter, more natural lighting',
        adjustments: { saturation: 110, brightness: 115, temperature: 5, hue: 0 },
        eraserPoints: [],
        brushSize: 20,
      },
    },
  },
  {
    id: 'look-minimalist',
    name: 'Minimalist',
    description: 'White studio + clean adjustments',
    stations: ['setting', 'refine'],
    cost: 2,
    preview: '/mock/renders/render-06.jpg',
    selections: {
      setting: { backgroundId: 'bg-white-studio', customUpload: null },
      refine: {
        prompt: 'Clean, minimal look',
        adjustments: { saturation: 90, brightness: 108, temperature: -5, hue: 0 },
        eraserPoints: [],
        brushSize: 20,
      },
    },
  },
]

export const LOOK_MAP: Record<string, StyleLook> = Object.fromEntries(
  STYLE_LOOKS.map((l) => [l.id, l])
)
