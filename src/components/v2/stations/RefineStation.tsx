import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useStudioStore } from '@/store/studio-store'
import { useCreditStore } from '@/store/credit-store'
import { useStudioRender } from '@/hooks/use-studio-render'
import { CreditActionButton } from '@/components/common/CreditActionButton'
import { cn } from '@/lib/utils'
import promptChips from '@/data/prompt-chips.json'

export function RefineStation() {
  const [showSliders, setShowSliders] = useState(false)
  const selections = useStudioStore((s) => s.stationSelections.refine)
  const updateRefine = useStudioStore((s) => s.updateRefineSelection)
  const { loading, error, applyAtStation } = useStudioRender()

  const optionId = selections.prompt || 'adjustments'
  const isFree = useCreditStore((s) =>
    s.isTransformationFree('refine', optionId)
  )

  const hasChanges =
    selections.prompt.length > 0 ||
    selections.adjustments.saturation !== 100 ||
    selections.adjustments.brightness !== 100 ||
    selections.adjustments.temperature !== 0 ||
    selections.adjustments.hue !== 0

  const handleApply = async () => {
    if (!hasChanges) return
    await applyAtStation('refine', optionId)
  }

  const handleChipClick = (chip: string) => {
    const newPrompt = selections.prompt
      ? `${selections.prompt}, ${chip.toLowerCase()}`
      : chip
    updateRefine({ prompt: newPrompt.slice(0, 300) })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable options area */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 studio-scroll">
        {/* Prompt input */}
        <div>
          <textarea
            value={selections.prompt}
            onChange={(e) => updateRefine({ prompt: e.target.value.slice(0, 300) })}
            placeholder="Describe refinements... (e.g., warmer lighting, sharper details)"
            className="w-full bg-transparent border border-ih-border rounded-[var(--radius-btn)] px-3 py-2 text-[14px] text-foreground placeholder:text-ih-disabled resize-none focus:outline-none focus:ring-2 focus:ring-ih-accent/40"
            rows={2}
          />
          <div className="flex justify-end mt-0.5">
            <span className={cn(
              'text-[11px]',
              selections.prompt.length > 280 ? 'text-ih-danger' : 'text-ih-muted'
            )}>
              {selections.prompt.length}/300
            </span>
          </div>
        </div>

        {/* Suggestion chips */}
        <div className="flex gap-1.5 flex-wrap">
          {(promptChips as string[]).map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className="px-2.5 py-1 text-[12px] rounded-[var(--radius-chip)] bg-ih-border/40 text-ih-muted hover:bg-ih-border hover:text-foreground transition-all active:scale-[0.95]"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Adjustments accordion */}
        <button
          onClick={() => setShowSliders(!showSliders)}
          className="flex items-center justify-between py-1.5 text-[12px] font-medium text-ih-muted hover:text-foreground transition-colors w-full"
        >
          <span>Adjustments</span>
          {showSliders ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showSliders && (
          <div className="space-y-2 pb-2">
            {[
              { label: 'Saturation', key: 'saturation' as const, min: 0, max: 200, default: 100 },
              { label: 'Brightness', key: 'brightness' as const, min: 50, max: 150, default: 100 },
              { label: 'Temperature', key: 'temperature' as const, min: -50, max: 50, default: 0 },
              { label: 'Hue', key: 'hue' as const, min: -180, max: 180, default: 0 },
            ].map((slider) => (
              <div key={slider.key} className="flex items-center gap-3">
                <span className="text-[12px] text-ih-muted w-20 shrink-0">{slider.label}</span>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  value={selections.adjustments[slider.key]}
                  onChange={(e) =>
                    updateRefine({
                      adjustments: {
                        ...selections.adjustments,
                        [slider.key]: Number(e.target.value),
                      },
                    })
                  }
                  className="flex-1 h-1 accent-ih-accent"
                />
                <span className="text-[11px] text-ih-muted w-8 text-right tabular-nums">
                  {selections.adjustments[slider.key]}
                </span>
              </div>
            ))}
            <button
              onClick={() =>
                updateRefine({
                  adjustments: { saturation: 100, brightness: 100, temperature: 0, hue: 0 },
                })
              }
              className="text-[11px] text-ih-muted hover:text-foreground transition-colors underline"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Apply — always visible, pinned bottom */}
      <div className="shrink-0 -mx-4 px-4 py-3 bg-[#FFFFFF]" style={{ borderTop: '1px solid #E0DDD8' }}>
        {error && (
          <p className="text-ih-danger text-[12px] mb-2">{error}</p>
        )}
        <CreditActionButton
          label="Apply Refinement"
          cost={1}
          isFree={isFree}
          disabled={!hasChanges}
          loading={loading}
          onClick={handleApply}
        />
      </div>
    </div>
  )
}
