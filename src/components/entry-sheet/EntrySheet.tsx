import { Image, Shirt, Eraser, ArrowRight } from 'lucide-react'
import { useJourneyStore } from '@/store/journey-store'
import { CreditIndicator } from '@/components/common/CreditIndicator'
import { Gem } from 'lucide-react'

export function EntrySheet() {
  const startJourney = useJourneyStore((s) => s.startJourney)

  const quickActions = [
    {
      icon: Image,
      label: 'Change Background',
      credit: 1,
      step: 'background' as const,
    },
    {
      icon: Shirt,
      label: 'Change Outfit',
      credit: 1,
      step: 'outfit' as const,
    },
    {
      icon: Eraser,
      label: 'Remove Objects (Eraser)',
      credit: 0,
      step: 'eraser' as const,
    },
  ]

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4">
      <div className="bg-surface rounded-[var(--radius-modal)] p-6 w-full max-w-[480px] shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[18px] font-medium">What do you want to edit?</h1>
          <CreditIndicator />
        </div>

        {/* Quick action buttons */}
        <div className="space-y-2 mb-6">
          {quickActions.map((action) => (
            <button
              key={action.step}
              onClick={() => startJourney('quick', action.step)}
              className="w-full flex items-center gap-3 px-4 py-3 border border-ih-border rounded-[var(--radius-btn)] hover:bg-gray-50 transition-colors text-left"
            >
              <action.icon className="w-5 h-5 text-ih-muted flex-shrink-0" />
              <span className="flex-1 text-[14px] text-primary-cta">
                {action.label}
              </span>
              <span className="flex items-center gap-1 text-[12px] text-ih-muted">
                {action.credit > 0 && (
                  <Gem className="w-3 h-3 text-ih-accent" />
                )}
                {action.credit} credit{action.credit !== 1 ? 's' : ''}
              </span>
              <ArrowRight className="w-4 h-4 text-ih-muted" />
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-ih-border" />
          <span className="text-[12px] text-ih-muted">or build a full look</span>
          <div className="flex-1 h-px bg-ih-border" />
        </div>

        {/* Full journey CTA */}
        <button
          onClick={() => startJourney('full')}
          className="w-full bg-primary-cta text-white rounded-[var(--radius-btn)] py-3 px-5 text-[14px] font-medium hover:bg-primary-cta-hover transition-colors"
        >
          Start Full Journey →
        </button>
        <p className="text-[12px] text-ih-muted text-center mt-2">
          Up to 4 credits — change face, posture, background, outfit & more
        </p>
      </div>
    </div>
  )
}
