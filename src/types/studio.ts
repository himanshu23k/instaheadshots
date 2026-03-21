import type { ProductInfo } from './index'

// ── Station & Navigation ──────────────────────────────────────
export type StationId = 'look' | 'setting' | 'style' | 'refine'
export type RevealPhase = 'idle' | 'processing' | 'revealing' | 'complete'
export type RevealType = 'single' | 'look' | 'variations'
export type StudioPhase = 'greeting' | 'creating' | 'picking' | 'done'
export type IrisRole = 'photographer' | 'stylist' | 'director'

// ── Station Definitions ───────────────────────────────────────
export interface Station {
  id: StationId
  label: string
  shortLabel: string
  icon: string        // lucide icon name
  cost: number        // credits per render (0 for Look station face select)
  ambientTint: string // page background color when active
  irisRole: IrisRole
  irisGreeting: string
}

// ── Selections ────────────────────────────────────────────────
export interface Adjustments {
  saturation: number   // 0-200
  brightness: number   // 50-150
  temperature: number  // -50 to 50
  hue: number          // -180 to 180
}

export interface EraserPoint {
  x: number
  y: number
}

export interface LookSelections {
  faceId: string | null
  postureId: string | null
}

export interface SettingSelections {
  backgroundId: string | null
  customUpload: string | null
}

export interface StyleSelections {
  outfitId: string | null
  variantId: string | null
  shopProduct: ProductInfo | null
}

export interface RefineSelections {
  prompt: string
  adjustments: Adjustments
  eraserPoints: EraserPoint[]
  brushSize: number
}

export interface StationSelections {
  look: LookSelections
  setting: SettingSelections
  style: StyleSelections
  refine: RefineSelections
}

// ── Version Board ─────────────────────────────────────────────
export interface PinnedVersion {
  id: string
  image: string
  timestamp: number
  label: string
  stationSelections: StationSelections
}

// ── Variations ────────────────────────────────────────────────
export interface Variation {
  id: string
  image: string
  optionId: string
  label: string
}

// ── Style Looks ───────────────────────────────────────────────
export interface StyleLook {
  id: string
  name: string
  description: string
  stations: StationId[]     // which stations this look applies
  cost: number              // 2-3 credits
  preview: string           // thumbnail image
  selections: Partial<StationSelections>
}

// ── Iris ──────────────────────────────────────────────────────
export interface IrisSuggestion {
  id: string
  text: string
  station?: StationId       // which station to navigate to (if tappable)
  optionId?: string         // which option to pre-select
  type: 'nudge' | 'pairing' | 'look' | 'variations' | 'pin'
}

export interface IrisReactionEntry {
  station: StationId
  reactions: string[]
}

// ── Render ────────────────────────────────────────────────────
export interface StudioRenderResult {
  success: boolean
  imageUrl: string
  revealDuration?: number
  error?: string
}
