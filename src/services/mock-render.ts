import type { StepId } from '@/types'
import type { StationId, StudioRenderResult } from '@/types/studio'

interface RenderResult {
  success: boolean
  imageUrl: string
  error?: string
}

// ── v1 step delays ────────────────────────────────────────────
const STEP_DELAYS: Record<StepId, [number, number]> = {
  face: [500, 1000],
  posture: [1500, 3000],
  background: [1500, 3000],
  outfit: [2000, 3500],
  'ai-prompt': [2000, 4000],
  edits: [800, 1500],
}

// ── v2 station delays ─────────────────────────────────────────
const STATION_DELAYS: Record<StationId, [number, number]> = {
  look: [800, 1500],
  setting: [1500, 3000],
  style: [2000, 3500],
  refine: [2000, 4000],
}

const FAILURE_RATE = 0.1

function randomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomRenderImage(): string {
  const renderIndex = Math.floor(Math.random() * 6) + 1
  const padded = String(renderIndex).padStart(2, '0')
  return `/mock/renders/render-${padded}.jpg`
}

// ── v1 render ─────────────────────────────────────────────────
export async function simulateRender(
  step: StepId,
  _optionId: string,
  signal?: AbortSignal
): Promise<RenderResult> {
  const [min, max] = STEP_DELAYS[step]
  const delay = randomDelay(min, max)

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      if (signal?.aborted) {
        reject(new DOMException('Render cancelled', 'AbortError'))
        return
      }

      if (Math.random() < FAILURE_RATE) {
        resolve({
          success: false,
          imageUrl: '',
          error: 'Something went wrong. Your credit was not charged. Try again.',
        })
        return
      }

      resolve({
        success: true,
        imageUrl: getRandomRenderImage(),
      })
    }, delay)

    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId)
        reject(new DOMException('Render cancelled', 'AbortError'))
      })
    }
  })
}

// ── v2 studio render ──────────────────────────────────────────
export async function simulateStudioRender(
  station: StationId,
  _optionId: string,
  signal?: AbortSignal
): Promise<StudioRenderResult> {
  const [min, max] = STATION_DELAYS[station]
  const delay = randomDelay(min, max)

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      if (signal?.aborted) {
        reject(new DOMException('Render cancelled', 'AbortError'))
        return
      }

      if (Math.random() < FAILURE_RATE) {
        resolve({
          success: false,
          imageUrl: '',
          revealDuration: 600,
          error: 'Something went wrong. Your credit was not charged. Try again.',
        })
        return
      }

      resolve({
        success: true,
        imageUrl: getRandomRenderImage(),
        revealDuration: 600,
      })
    }, delay)

    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId)
        reject(new DOMException('Render cancelled', 'AbortError'))
      })
    }
  })
}

// ── v2 variations render (batch) ──────────────────────────────
export async function simulateVariationsRender(
  station: StationId,
  optionIds: string[],
  signal?: AbortSignal
): Promise<StudioRenderResult[]> {
  const [min, max] = STATION_DELAYS[station]
  const delay = randomDelay(min, max + 500) // slightly longer for batch

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      if (signal?.aborted) {
        reject(new DOMException('Render cancelled', 'AbortError'))
        return
      }

      const results = optionIds.map(() => ({
        success: true,
        imageUrl: getRandomRenderImage(),
        revealDuration: 600,
      }))

      resolve(results)
    }, delay)

    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId)
        reject(new DOMException('Render cancelled', 'AbortError'))
      })
    }
  })
}

// ── v2 look render (multi-station) ────────────────────────────
export async function simulateLookRender(
  stations: StationId[],
  signal?: AbortSignal
): Promise<StudioRenderResult> {
  // Looks take longer — sum of station delays
  const totalMin = stations.reduce((s, st) => s + STATION_DELAYS[st][0], 0)
  const totalMax = stations.reduce((s, st) => s + STATION_DELAYS[st][1], 0)
  const delay = randomDelay(Math.min(totalMin, 2500), Math.min(totalMax, 4500))

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      if (signal?.aborted) {
        reject(new DOMException('Render cancelled', 'AbortError'))
        return
      }

      if (Math.random() < FAILURE_RATE) {
        resolve({
          success: false,
          imageUrl: '',
          revealDuration: 600 * stations.length,
          error: 'Something went wrong. Your credits were not charged. Try again.',
        })
        return
      }

      resolve({
        success: true,
        imageUrl: getRandomRenderImage(),
        revealDuration: 400 * stations.length,
      })
    }, delay)

    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId)
        reject(new DOMException('Render cancelled', 'AbortError'))
      })
    }
  })
}

// ── v1 product fetch (unchanged) ──────────────────────────────
export async function simulateFetchProduct(
  url: string,
  signal?: AbortSignal
): Promise<{
  success: boolean
  product?: {
    name: string
    brand: string
    price: string
    image: string
    variants: Array<{ id: string; color: string; hex: string }>
  }
  error?: string
}> {
  const isMyntra = url.includes('myntra.com')
  const isAjio = url.includes('ajio.com')

  if (!isMyntra && !isAjio) {
    return {
      success: false,
      error: 'We support Myntra and Ajio links only.',
    }
  }

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      if (signal?.aborted) {
        reject(new DOMException('Fetch cancelled', 'AbortError'))
        return
      }

      resolve({
        success: true,
        product: {
          name: 'Classic Fit Cotton Oxford Shirt',
          brand: isMyntra ? 'H&M' : 'Allen Solly',
          price: isMyntra ? '1,499' : '1,299',
          image: '/mock/outfits/outfit-01.jpg',
          variants: [
            { id: 'v1', color: 'White', hex: '#FFFFFF' },
            { id: 'v2', color: 'Light Blue', hex: '#ADD8E6' },
            { id: 'v3', color: 'Navy', hex: '#1B2B4B' },
            { id: 'v4', color: 'Pink', hex: '#FFB6C1' },
          ],
        },
      })
    }, 2000)

    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId)
        reject(new DOMException('Fetch cancelled', 'AbortError'))
      })
    }
  })
}
