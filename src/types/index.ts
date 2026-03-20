export type StepId = 'face' | 'posture' | 'background' | 'outfit' | 'ai-prompt' | 'eraser'

export type JourneyMode = 'full' | 'quick'

export type AppView = 'entry' | 'journey' | 'final'

export type RenderStatus = 'idle' | 'loading' | 'success' | 'failure' | 'cancelled' | 'timeout'

export interface Step {
  id: StepId
  label: string
  shortLabel: string
  cost: number
  dependsOn: StepId[]
}

export interface Selection {
  optionId: string
  label: string
  thumbnail?: string
  renderResult?: string
}

export interface RenderState {
  status: RenderStatus
  startedAt: number | null
  error: string | null
}

export interface CreditTransaction {
  step: StepId
  optionId: string
  amount: number
  timestamp: number
}

export interface PresetOption {
  id: string
  name: string
  category: string
  thumbnail: string
  renderResult: string
}

export interface FaceOption {
  id: string
  name: string
  album: string
  thumbnail: string
}

export interface PostureOption {
  id: string
  name: string
  description: string
  thumbnail: string
  renderResult: string
}

export interface BackgroundOption extends PresetOption {}

export interface OutfitOption extends PresetOption {}

export interface ProductInfo {
  name: string
  brand: string
  price: string
  image: string
  variants: ProductVariant[]
}

export interface ProductVariant {
  id: string
  color: string
  hex: string
}

export interface CreditPack {
  id: string
  credits: number
  price: string
}
