import { useState } from 'react'
import { useCreditStore } from '@/store/credit-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Gem } from 'lucide-react'
import creditPacks from '@/data/credit-packs.json'
import type { CreditPack } from '@/types'

interface OutOfCreditsModalProps {
  open: boolean
  onClose: () => void
}

export function OutOfCreditsModal({ open, onClose }: OutOfCreditsModalProps) {
  const [selectedPack, setSelectedPack] = useState<string>(creditPacks[0].id)
  const addCredits = useCreditStore((s) => s.addCredits)

  const handleBuy = () => {
    const pack = (creditPacks as CreditPack[]).find((p) => p.id === selectedPack)
    if (pack) {
      addCredits(pack.credits)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[420px] bg-surface rounded-[var(--radius-modal)]">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-medium">
            You're out of credits
          </DialogTitle>
          <DialogDescription className="text-[14px] text-ih-muted">
            Get more credits to keep editing.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 mt-4">
          {(creditPacks as CreditPack[]).map((pack) => (
            <button
              key={pack.id}
              onClick={() => setSelectedPack(pack.id)}
              className={`
                flex flex-col items-center gap-2 p-3 rounded-[var(--radius-card)] border-2 transition-colors
                ${pack.id === selectedPack
                  ? 'border-ih-accent'
                  : 'border-ih-border hover:border-[#AAAAAA]'
                }
              `}
            >
              <Gem className="w-5 h-5 text-ih-accent" />
              <span className="text-[14px] font-medium">{pack.credits} Credits</span>
              <span className="text-[12px] text-ih-muted">Rs. {pack.price}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <Button
            onClick={handleBuy}
            className="w-full bg-primary-cta text-white hover:bg-primary-cta-hover"
          >
            Buy Now →
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full border-ih-border"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
