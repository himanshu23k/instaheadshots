import { useState } from 'react'
import { StepLayout } from '@/components/layout/StepLayout'
import { BeforeAfterToggle } from '@/components/common/BeforeAfterToggle'
import { Button } from '@/components/ui/button'
import { useJourneyStore } from '@/store/journey-store'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Info, Minus, Plus, Undo2 } from 'lucide-react'

export function MagicEraser() {
  const [brushSize, setBrushSize] = useState(20)
  const [erasePoints, setErasePoints] = useState<Array<{ x: number; y: number }>>([])
  const [previewMode, setPreviewMode] = useState<'before' | 'after'>('after')
  const [showTip, setShowTip] = useState(true)

  const completeStep = useJourneyStore((s) => s.completeStep)
  const finishJourney = useJourneyStore((s) => s.finishJourney)
  const originalImage = useJourneyStore((s) => s.originalImage)

  const previewSrc = previewMode === 'before' ? originalImage : originalImage

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setErasePoints((prev) => [...prev, { x, y }])
    setShowTip(false)
  }

  const handleUndo = () => {
    setErasePoints((prev) => prev.slice(0, -1))
  }

  const handleFinish = () => {
    completeStep('eraser')
    finishJourney()
  }

  return (
    <StepLayout
      previewSrc={previewSrc}
      previewAlt="Magic eraser preview"
      previewOverlay={
        <div
          className="absolute inset-0 cursor-crosshair"
          onClick={handlePreviewClick}
        >
          {erasePoints.map((point, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/50 border border-white/80 pointer-events-none"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                width: brushSize,
                height: brushSize,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
      }
      previewTopRight={
        <BeforeAfterToggle mode={previewMode} onToggle={setPreviewMode} />
      }
    >
      <h2 className="text-[18px] font-medium mb-1">Magic Eraser</h2>
      <p className="text-[12px] text-ih-muted mb-4">
        Click on the preview to erase unwanted objects. This step is free.
      </p>

      {showTip && (
        <Tooltip open>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 bg-toast-bg text-white rounded-[var(--radius-alert)] px-3 py-2 text-[12px] mb-4">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                You're erasing from your fully edited image — background, outfit,
                and AI refinements are already applied.
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">First-visit tip</TooltipContent>
        </Tooltip>
      )}

      <div className="space-y-4">
        {/* Brush size */}
        <div>
          <label className="text-[12px] font-medium mb-2 block">
            Brush Size: {brushSize}px
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBrushSize((s) => Math.max(5, s - 5))}
              className="p-1 border border-ih-border rounded-[var(--radius-btn)] hover:bg-gray-50"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="range"
              min={5}
              max={50}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="flex-1 accent-ih-accent"
            />
            <button
              onClick={() => setBrushSize((s) => Math.min(50, s + 5))}
              className="p-1 border border-ih-border rounded-[var(--radius-btn)] hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Undo */}
        <Button
          variant="outline"
          onClick={handleUndo}
          disabled={erasePoints.length === 0}
          className="w-full border-ih-border"
        >
          <Undo2 className="w-4 h-4 mr-2" />
          Undo Last Erase
        </Button>

        {/* Erase count */}
        <p className="text-[12px] text-ih-muted">
          {erasePoints.length} point{erasePoints.length !== 1 ? 's' : ''} erased
        </p>
      </div>

      <div className="mt-6 sticky bottom-0 bg-surface pt-2 pb-1">
        <Button
          onClick={handleFinish}
          className="w-full bg-primary-cta text-white hover:bg-primary-cta-hover py-3"
        >
          Finish →
        </Button>
      </div>
    </StepLayout>
  )
}
