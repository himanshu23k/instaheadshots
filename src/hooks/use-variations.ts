import { useState, useCallback } from 'react'
import { useStudioStore } from '@/store/studio-store'
import { useCreditStore } from '@/store/credit-store'
import { simulateVariationsRender } from '@/services/mock-render'
import type { StationId, Variation } from '@/types/studio'

// Data sources for random option picking
import facesData from '@/data/faces.json'
import posturesData from '@/data/postures.json'
import backgroundsData from '@/data/backgrounds.json'
import outfitsData from '@/data/outfits.json'

function getRandomOptions(station: StationId, count: number = 3): string[] {
  let pool: Array<{ id: string; name: string }>
  switch (station) {
    case 'look':
      pool = [...facesData, ...posturesData]
      break
    case 'setting':
      pool = backgroundsData
      break
    case 'style':
      pool = outfitsData
      break
    case 'refine':
      pool = [
        { id: 'warm-lighting', name: 'Warm Lighting' },
        { id: 'cool-tones', name: 'Cool Tones' },
        { id: 'soft-bokeh', name: 'Soft Bokeh' },
        { id: 'lift-shadows', name: 'Lift Shadows' },
      ]
      break
  }

  // Shuffle and pick
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map((o) => o.id)
}

function getOptionLabel(_station: StationId, optionId: string): string {
  const allData = [...facesData, ...posturesData, ...backgroundsData, ...outfitsData] as Array<{ id: string; name: string }>
  return allData.find((d) => d.id === optionId)?.name || optionId
}

export function useVariations() {
  const [loading, setLoading] = useState(false)

  const showVariations = useStudioStore((s) => s.showVariations)
  const startReveal = useStudioStore((s) => s.startReveal)

  const triggerVariations = useCallback(
    async (station: StationId) => {
      const creditStore = useCreditStore.getState()
      if (!creditStore.canAfford(1)) return

      const optionIds = getRandomOptions(station, 3)
      setLoading(true)
      startReveal(station, 'variations')

      try {
        const results = await simulateVariationsRender(station, optionIds)

        // Deduct 1 credit for the batch
        creditStore.deductCredit(`${station}-variations`, optionIds.join(','))

        const variations: Variation[] = results.map((r, i) => ({
          id: `var-${Date.now()}-${i}`,
          image: r.imageUrl,
          optionId: optionIds[i],
          label: getOptionLabel(station, optionIds[i]),
        }))

        useStudioStore.getState().cancelReveal()
        showVariations(variations)
      } catch {
        useStudioStore.getState().cancelReveal()
      } finally {
        setLoading(false)
      }
    },
    [showVariations, startReveal]
  )

  return { loading, triggerVariations }
}
