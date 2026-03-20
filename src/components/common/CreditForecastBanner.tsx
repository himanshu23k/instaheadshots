import { useState } from 'react'
import { Info, X } from 'lucide-react'
import { useCreditStore } from '@/store/credit-store'

interface CreditForecastBannerProps {
  stepCost: number
  isFullJourney?: boolean
}

export function CreditForecastBanner({
  stepCost,
  isFullJourney = false,
}: CreditForecastBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const balance = useCreditStore((s) => s.balance)
  const totalSpent = useCreditStore((s) => s.getTotalSpent())

  // Auto-hide after first edit is applied
  if (dismissed || totalSpent > 0) return null

  const insufficient = balance < stepCost
  const costText = isFullJourney
    ? `A full journey costs up to 4 credits.`
    : `This edit costs ${stepCost} credit${stepCost !== 1 ? 's' : ''}.`

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded text-[12px] mb-4 ${
        insufficient
          ? 'bg-ih-danger-bg border-l-[3px] border-l-ih-danger text-ih-danger-text'
          : 'bg-ih-warning border-l-[3px] border-l-ih-warning-border text-ih-warning-text'
      }`}
    >
      <Info className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="flex-1">
        You have {balance} credits. {costText}
        {insufficient && (
          <button className="underline ml-1 font-medium">
            Get more credits
          </button>
        )}
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 opacity-60 hover:opacity-100"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
