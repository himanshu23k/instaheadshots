import { useJourneyStore } from '@/store/journey-store'
import { STEP_MAP } from '@/constants/steps'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function CascadeConfirmModal() {
  const pendingNavigation = useJourneyStore((s) => s.pendingNavigation)
  const confirmNavigation = useJourneyStore((s) => s.confirmNavigation)
  const cancelNavigation = useJourneyStore((s) => s.cancelNavigation)

  if (!pendingNavigation) return null

  const targetLabel = STEP_MAP[pendingNavigation.target].label
  const resetLabels = pendingNavigation.stepsToReset
    .map((id) => STEP_MAP[id].label)
    .join(', ')

  return (
    <Dialog open={true} onOpenChange={() => cancelNavigation()}>
      <DialogContent className="sm:max-w-[400px] bg-surface rounded-[var(--radius-modal)]">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-medium">
            This will reset some edits
          </DialogTitle>
          <DialogDescription className="text-[14px] text-ih-muted leading-relaxed mt-2">
            Going back to {targetLabel} will reset your{' '}
            <span className="font-medium text-primary-cta">{resetLabels}</span>.
            Credits spent on those steps will not be refunded.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={cancelNavigation}
            className="border-ih-border text-primary-cta hover:bg-gray-50"
          >
            Keep My Edits
          </Button>
          <Button
            onClick={confirmNavigation}
            className="bg-primary-cta text-white hover:bg-primary-cta-hover"
          >
            Go Back
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
