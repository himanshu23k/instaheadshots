import { useCreditStore } from '@/store/credit-store'
import { useJourneyStore } from '@/store/journey-store'
import { STEP_MAP } from '@/constants/steps'
import type { StepId } from '@/types'

interface UseCreditReturn {
  balance: number
  cost: number
  isFree: boolean
  canAfford: boolean
  deduct: () => void
  checkAndDeduct: () => boolean // returns false if out of credits (shows modal)
}

export function useCredit(step: StepId, optionId: string | null): UseCreditReturn {
  const balance = useCreditStore((s) => s.balance)
  const isTransformationFree = useCreditStore((s) => s.isTransformationFree)
  const deductCredit = useCreditStore((s) => s.deductCredit)
  const canAffordCheck = useCreditStore((s) => s.canAfford)
  const setShowOutOfCredits = useJourneyStore((s) => s.setShowOutOfCredits)

  const stepDef = STEP_MAP[step]
  const cost = stepDef.cost
  const isFree = optionId ? isTransformationFree(step, optionId) : false
  const effectiveCost = isFree ? 0 : cost
  const canAfford = canAffordCheck(effectiveCost)

  const deduct = () => {
    if (optionId && !isFree && cost > 0) {
      deductCredit(step, optionId)
    }
  }

  const checkAndDeduct = (): boolean => {
    if (isFree || cost === 0) {
      return true
    }
    if (!canAfford) {
      setShowOutOfCredits(true)
      return false
    }
    if (optionId) {
      deductCredit(step, optionId)
    }
    return true
  }

  return { balance, cost: effectiveCost, isFree, canAfford, deduct, checkAndDeduct }
}
