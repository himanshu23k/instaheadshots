import facesData from '@/data/faces.json'
import posturesData from '@/data/postures.json'
import backgroundsData from '@/data/backgrounds.json'
import outfitsData from '@/data/outfits.json'
import type { FaceOption, PostureOption, BackgroundOption, OutfitOption, ProductInfo } from '@/types'
import type { RefineSelections } from '@/types/studio'

const faces = facesData as FaceOption[]
const postures = posturesData as PostureOption[]
const backgrounds = backgroundsData as BackgroundOption[]
const outfits = outfitsData as OutfitOption[]

/** Human-readable look goal from current face + posture ids (Iris textarea). */
export function buildLookGoalDescription(
  faceId: string | null | undefined,
  postureId: string | null | undefined
): string {
  const faceName = faceId ? faces.find((f) => f.id === faceId)?.name : null
  const postureName = postureId ? postures.find((p) => p.id === postureId)?.name : null
  const parts: string[] = []
  if (faceName) parts.push(`Expression: ${faceName}`)
  if (postureName) parts.push(`Posture: ${postureName}`)
  return parts.length ? `${parts.join('. ')}.` : ''
}

export function buildSettingGoalDescription(
  backgroundId: string | null | undefined,
  customUpload: string | null | undefined
): string {
  if (customUpload) return 'Background: Custom upload.'
  if (backgroundId) {
    const name = backgrounds.find((b) => b.id === backgroundId)?.name
    return name ? `Background: ${name}.` : ''
  }
  return ''
}

export function buildStyleGoalDescription(
  outfitId: string | null | undefined,
  shopProduct: ProductInfo | null
): string {
  if (shopProduct) {
    const brand = shopProduct.brand ? ` (${shopProduct.brand})` : ''
    return `Outfit: ${shopProduct.name}${brand}.`
  }
  if (outfitId) {
    const name = outfits.find((o) => o.id === outfitId)?.name
    return name ? `Outfit: ${name}.` : ''
  }
  return ''
}

export function buildRefineGoalDescription(r: RefineSelections): string {
  const parts: string[] = []
  if (r.prompt.trim()) parts.push(r.prompt.trim())
  const adj: string[] = []
  if (r.adjustments.saturation !== 100) adj.push(`saturation ${r.adjustments.saturation}%`)
  if (r.adjustments.brightness !== 100) adj.push(`brightness ${r.adjustments.brightness}%`)
  if (r.adjustments.temperature !== 0) {
    adj.push(`temperature ${r.adjustments.temperature > 0 ? '+' : ''}${r.adjustments.temperature}`)
  }
  if (r.adjustments.hue !== 0) adj.push(`hue ${r.adjustments.hue}°`)
  if (adj.length) parts.push(`Adjustments: ${adj.join(', ')}.`)
  if (r.eraserPoints.length > 0) {
    parts.push(`Magic eraser: ${r.eraserPoints.length} mark${r.eraserPoints.length === 1 ? '' : 's'}.`)
  }
  return parts.join(' ')
}
