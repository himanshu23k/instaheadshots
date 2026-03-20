import { useState } from 'react'
import { useJourneyStore } from '@/store/journey-store'
import { useCreditStore } from '@/store/credit-store'
import { CreditIndicator } from '@/components/common/CreditIndicator'
import { BeforeAfterToggle } from '@/components/common/BeforeAfterToggle'
import { EditSummaryStrip } from './EditSummaryStrip'
import { ImagePreview } from '@/components/common/ImagePreview'
import { Button } from '@/components/ui/button'

export function FinalPreview() {
  const [previewMode, setPreviewMode] = useState<'before' | 'after'>('after')
  const originalImage = useJourneyStore((s) => s.originalImage)
  const backToEditing = useJourneyStore((s) => s.backToEditing)
  const reset = useJourneyStore((s) => s.reset)
  const appliedTransformations = useJourneyStore((s) => s.appliedTransformations)
  const totalSpent = useCreditStore((s) => s.getTotalSpent())

  // Get the last applied render result as the "final" image
  const lastApplied = Array.from(appliedTransformations.values()).pop()
  const finalImage = lastApplied?.renderResult || originalImage
  const previewSrc = previewMode === 'before' ? originalImage : finalImage

  return (
    <div className="min-h-screen bg-page flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-surface border-b border-ih-border">
        <button
          onClick={backToEditing}
          className="text-[14px] text-ih-muted hover:text-primary-cta transition-colors"
        >
          ← Back to editing
        </button>
        <h1 className="text-[22px] font-medium text-primary-cta">
          Your headshot is ready
        </h1>
        <CreditIndicator />
      </header>

      {/* Image */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="relative w-full max-w-md">
          <ImagePreview
            src={previewSrc}
            alt="Final headshot"
            className="aspect-[3/4] w-full max-h-[60vh]"
          />
          <div className="absolute top-3 right-3">
            <BeforeAfterToggle mode={previewMode} onToggle={setPreviewMode} />
          </div>
        </div>

        {/* Edit summary */}
        <div className="mt-4 w-full max-w-md">
          <EditSummaryStrip />
        </div>

        {/* Credits used */}
        <p className="text-[12px] text-ih-muted mt-4">
          {totalSpent} credit{totalSpent !== 1 ? 's' : ''} used for this headshot
        </p>

        {/* Action buttons */}
        <div className="flex gap-3 mt-6 w-full max-w-md">
          <Button
            variant="outline"
            className="flex-1 border-ih-border text-primary-cta"
            onClick={() => {
              alert('Saved to gallery! (mock)')
            }}
          >
            Save to Gallery
          </Button>
          <Button
            className="flex-1 bg-primary-cta text-white hover:bg-primary-cta-hover"
            onClick={() => {
              alert('Download started! (mock)')
            }}
          >
            Download
          </Button>
        </div>

        <Button
          variant="ghost"
          className="mt-4 text-ih-muted text-[12px]"
          onClick={reset}
        >
          Start Over
        </Button>
      </div>
    </div>
  )
}
