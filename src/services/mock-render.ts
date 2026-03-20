import type { StepId } from '@/types'

interface RenderResult {
  success: boolean
  imageUrl: string
  error?: string
}

const STEP_DELAYS: Record<StepId, [number, number]> = {
  face: [500, 1000],
  posture: [1500, 3000],
  background: [1500, 3000],
  outfit: [2000, 3500],
  'ai-prompt': [2000, 4000],
  edits: [800, 1500],
}

const FAILURE_RATE = 0.1 // 10% chance of failure

function randomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Simulates an AI render with realistic delays, failure chance, and cancellation support.
 */
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

      // Random failure
      if (Math.random() < FAILURE_RATE) {
        resolve({
          success: false,
          imageUrl: '',
          error: 'Something went wrong. Your credit was not charged. Try again.',
        })
        return
      }

      // Pick a "rendered" result image (cycle through available renders)
      const renderIndex = Math.floor(Math.random() * 6) + 1
      const padded = String(renderIndex).padStart(2, '0')

      resolve({
        success: true,
        imageUrl: `/mock/renders/render-${padded}.jpg`,
      })
    }, delay)

    // Handle abort
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId)
        reject(new DOMException('Render cancelled', 'AbortError'))
      })
    }
  })
}

/**
 * Simulates fetching product info from Myntra/Ajio URL.
 */
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
  // Validate domain
  const isMyntra = url.includes('myntra.com')
  const isAjio = url.includes('ajio.com')

  if (!isMyntra && !isAjio) {
    return {
      success: false,
      error: 'We support Myntra and Ajio links only.',
    }
  }

  // Simulate fetch delay
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
