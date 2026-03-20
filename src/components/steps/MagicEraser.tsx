import { useState } from 'react'
import { StepLayout } from '@/components/layout/StepLayout'
import { BeforeAfterToggle } from '@/components/common/BeforeAfterToggle'
import { Button } from '@/components/ui/button'
import { useJourneyStore } from '@/store/journey-store'
import { Info, Minus, Plus, Undo2, RotateCcw } from 'lucide-react'

interface SliderControlProps {
  label: string
  value: number
  min: number
  max: number
  defaultValue: number
  onChange: (value: number) => void
}

function SliderControl({ label, value, min, max, defaultValue, onChange }: SliderControlProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[12px] font-medium">{label}</label>
        <button
          onClick={() => onChange(defaultValue)}
          className="text-[11px] text-ih-muted hover:text-primary-cta transition-colors"
        >
          {value !== defaultValue ? 'Reset' : ''}
        </button>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-ih-muted w-6 text-right">{value}</span>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-ih-accent"
        />
      </div>
    </div>
  )
}

export function MagicEraser() {
  const [brushSize, setBrushSize] = useState(20)
  const [erasePoints, setErasePoints] = useState<Array<{ x: number; y: number }>>([])
  const [previewMode, setPreviewMode] = useState<'before' | 'after'>('after')
  const [showTip, setShowTip] = useState(true)

  // Image adjustment sliders
  const [saturation, setSaturation] = useState(100)
  const [brightness, setBrightness] = useState(100)
  const [temperature, setTemperature] = useState(0)
  const [hue, setHue] = useState(0)

  const completeStep = useJourneyStore((s) => s.completeStep)
  const finishJourney = useJourneyStore((s) => s.finishJourney)
  const originalImage = useJourneyStore((s) => s.originalImage)

  const previewSrc = previewMode === 'before' ? originalImage : originalImage

  // Build CSS filter string for the preview
  const filterStyle = previewMode === 'after'
    ? `saturate(${saturation}%) brightness(${brightness}%) hue-rotate(${hue}deg) sepia(${Math.abs(temperature)}%) ${temperature > 0 ? 'saturate(1.2)' : ''}`
    : undefined

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
    completeStep('edits')
    finishJourney()
  }

  return (
    <StepLayout
      previewSrc={previewSrc}
      previewAlt="Edits preview"
      previewOverlay={
        <div
          className="absolute inset-0 cursor-crosshair"
          onClick={handlePreviewClick}
          style={{ filter: filterStyle }}
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
      <h2 className="text-[18px] font-medium mb-1">Edits</h2>
      <p className="text-[12px] text-ih-muted mb-4">
        Adjust image settings and erase unwanted objects. This step is free.
      </p>

      {showTip && (
        <div className="flex items-center gap-2 bg-toast-bg text-white rounded-[var(--radius-alert)] px-3 py-2 text-[12px] mb-4">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            Your edits apply to the fully transformed image — background, outfit,
            and AI refinements are already applied.
          </span>
        </div>
      )}

      <div className="space-y-4">
        {/* Image adjustments */}
        <div className="space-y-3 border border-ih-border rounded-[var(--radius-card)] p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-medium">Adjustments</h3>
            {(saturation !== 100 || brightness !== 100 || temperature !== 0 || hue !== 0) && (
              <button
                onClick={() => { setSaturation(100); setBrightness(100); setTemperature(0); setHue(0) }}
                className="flex items-center gap-1 text-[11px] text-ih-muted hover:text-primary-cta transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset All
              </button>
            )}
          </div>
          <SliderControl
            label="Saturation"
            value={saturation}
            min={0}
            max={200}
            defaultValue={100}
            onChange={setSaturation}
          />
          <SliderControl
            label="Brightness"
            value={brightness}
            min={50}
            max={150}
            defaultValue={100}
            onChange={setBrightness}
          />
          <SliderControl
            label="Temperature"
            value={temperature}
            min={-50}
            max={50}
            defaultValue={0}
            onChange={setTemperature}
          />
          <SliderControl
            label="Hue"
            value={hue}
            min={-180}
            max={180}
            defaultValue={0}
            onChange={setHue}
          />
        </div>

        {/* Eraser section */}
        <div className="space-y-3 border border-ih-border rounded-[var(--radius-card)] p-3">
          <h3 className="text-[13px] font-medium">Eraser</h3>
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

          <Button
            variant="outline"
            onClick={handleUndo}
            disabled={erasePoints.length === 0}
            className="w-full border-ih-border"
          >
            <Undo2 className="w-4 h-4 mr-2" />
            Undo Last Point
          </Button>

          <p className="text-[12px] text-ih-muted">
            {erasePoints.length} point{erasePoints.length !== 1 ? 's' : ''} marked
          </p>
        </div>
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
