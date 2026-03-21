import { useState, useCallback } from 'react'
import { useStudioStore } from '@/store/studio-store'
import { useCreditStore } from '@/store/credit-store'
import { simulateLookRender } from '@/services/mock-render'
import { LookCard } from './LookCard'
import { STYLE_LOOKS } from '@/constants/looks'

export function LooksGallery() {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const completeReveal = useStudioStore((s) => s.completeReveal)
  const startReveal = useStudioStore((s) => s.startReveal)
  const setActiveLook = useStudioStore((s) => s.setActiveLook)

  const handleApplyLook = useCallback(async (lookId: string) => {
    const look = STYLE_LOOKS.find((l) => l.id === lookId)
    if (!look) return

    const creditStore = useCreditStore.getState()
    if (!creditStore.canAfford(look.cost)) {
      setError('Not enough credits for this look')
      return
    }

    setLoadingId(lookId)
    setError(null)
    setActiveLook(lookId)
    startReveal('setting', 'look')

    try {
      const result = await simulateLookRender(look.stations)
      if (result.success) {
        creditStore.deductCredits('looks', lookId, look.cost)

        useStudioStore.setState({ revealPhase: 'revealing' })
        await new Promise((r) => setTimeout(r, result.revealDuration || 800))

        completeReveal(result.imageUrl)
      } else {
        setError(result.error || 'Look render failed')
        useStudioStore.getState().cancelReveal()
      }
    } catch {
      useStudioStore.getState().cancelReveal()
    } finally {
      setLoadingId(null)
    }
  }, [completeReveal, startReveal, setActiveLook])

  return (
    <div className="h-full overflow-y-auto">
      {error && (
        <p className="text-ih-danger text-[12px] mb-2">{error}</p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {STYLE_LOOKS.map((look) => (
          <LookCard
            key={look.id}
            look={look}
            isActive={loadingId === look.id}
            loading={loadingId === look.id}
            onApply={handleApplyLook}
          />
        ))}
      </div>
    </div>
  )
}
