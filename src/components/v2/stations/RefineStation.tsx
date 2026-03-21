import type { CSSProperties } from 'react'
import { Droplets, Sun, Thermometer, Palette, RotateCcw, Eraser, Undo2 } from 'lucide-react'
import { useStudioStore } from '@/store/studio-store'
import { useCreditStore } from '@/store/credit-store'
import { useStudioRender } from '@/hooks/use-studio-render'
import { CreditActionButton } from '@/components/common/CreditActionButton'
import { buildRefineGoalDescription } from '@/lib/iris-station-goal-text'
import { cn } from '@/lib/utils'
import type { Adjustments } from '@/types/studio'

const SLIDER_CONFIG: {
  label: string
  hint: string
  key: keyof Adjustments
  min: number
  max: number
  default: number
  Icon: typeof Droplets
  format: (v: number) => string
  low: string
  high: string
}[] = [
  {
    key: 'saturation',
    label: 'Saturation',
    hint: 'How vivid colors appear',
    min: 0,
    max: 200,
    default: 100,
    Icon: Droplets,
    format: (v) => `${v}%`,
    low: 'Muted',
    high: 'Vivid',
  },
  {
    key: 'brightness',
    label: 'Brightness',
    hint: 'Overall light level',
    min: 50,
    max: 150,
    default: 100,
    Icon: Sun,
    format: (v) => `${v}%`,
    low: 'Dim',
    high: 'Bright',
  },
  {
    key: 'temperature',
    label: 'Temperature',
    hint: 'Warm vs cool cast',
    min: -50,
    max: 50,
    default: 0,
    Icon: Thermometer,
    format: (v) => (v === 0 ? '0' : v > 0 ? `+${v}` : `${v}`),
    low: 'Cool',
    high: 'Warm',
  },
  {
    key: 'hue',
    label: 'Hue',
    hint: 'Shift color balance',
    min: -180,
    max: 180,
    default: 0,
    Icon: Palette,
    format: (v) => `${v}°`,
    low: '−180°',
    high: '+180°',
  },
]

const BRUSH_DATUM = 20

/** Filled segment between default (datum) and current value — native range has no fill without this. */
function refineTrackFillFromDatum(
  min: number,
  max: number,
  value: number,
  datum: number
): string {
  const span = max - min
  if (span <= 0) {
    return 'linear-gradient(to right, rgb(224 221 216 / 0.5) 0%, rgb(224 221 216 / 0.5) 100%)'
  }
  const pct = (v: number) => ((v - min) / span) * 100
  const pD = pct(datum)
  const pV = pct(value)
  const lo = Math.min(pD, pV)
  const hi = Math.max(pD, pV)
  const dim = 'rgb(224 221 216 / 0.5)'
  const fill = 'var(--color-ih-accent)'
  return `linear-gradient(to right, ${dim} 0%, ${dim} ${lo}%, ${fill} ${lo}%, ${fill} ${hi}%, ${dim} ${hi}%, ${dim} 100%)`
}

export function RefineStation() {
  const selections = useStudioStore((s) => s.stationSelections.refine)
  const updateRefine = useStudioStore((s) => s.updateRefineSelection)
  const setIrisGoalForStation = useStudioStore((s) => s.setIrisGoalForStation)
  const { loading, error, applyAtStation } = useStudioRender()

  const syncRefineIris = () => {
    const r = useStudioStore.getState().stationSelections.refine
    setIrisGoalForStation('refine', buildRefineGoalDescription(r))
  }

  const optionId = selections.prompt || 'adjustments'
  const hasPrompt = selections.prompt.trim().length > 0
  const freeFromRepeat = useCreditStore((s) =>
    s.isTransformationFree('refine', optionId)
  )
  /** Slider-only applies are free; prompt-based uses credits (repeat same option may be free). */
  const applyIsFree = !hasPrompt || freeFromRepeat
  const applyCost = hasPrompt ? 1 : 0

  const hasChanges =
    selections.prompt.length > 0 ||
    selections.adjustments.saturation !== 100 ||
    selections.adjustments.brightness !== 100 ||
    selections.adjustments.temperature !== 0 ||
    selections.adjustments.hue !== 0 ||
    selections.eraserPoints.length > 0

  const handleApply = async () => {
    if (!hasChanges) return
    await applyAtStation('refine', optionId)
  }

  const resetSlider = (key: keyof Adjustments, defaultValue: number) => {
    updateRefine({
      adjustments: {
        ...selections.adjustments,
        [key]: defaultValue,
      },
    })
    syncRefineIris()
  }

  const allAtDefault =
    selections.adjustments.saturation === 100 &&
    selections.adjustments.brightness === 100 &&
    selections.adjustments.temperature === 0 &&
    selections.adjustments.hue === 0

  const eraserCount = selections.eraserPoints.length

  return (
    <div className="flex h-full flex-col">
      <div className="studio-scroll min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-2.5">
          {SLIDER_CONFIG.map((slider) => {
            const value = selections.adjustments[slider.key]
            const isDefault = value === slider.default
            const { Icon } = slider

            return (
              <div
                key={slider.key}
                className={cn(
                  'rounded-lg border border-ih-border/90 bg-white/90 px-2.5 py-2.5',
                  'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
                  !isDefault && 'border-ih-accent/25 ring-1 ring-ih-accent/10'
                )}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex items-start gap-2">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#FAFAFA] text-ih-muted ring-1 ring-ih-border/60">
                      <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-foreground">{slider.label}</p>
                      <p className="text-[10px] leading-tight text-ih-muted">{slider.hint}</p>
                    </div>
                  </div>
                  <output
                    className={cn(
                      'shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums',
                      isDefault
                        ? 'bg-transparent text-ih-muted'
                        : 'bg-ih-accent-bg text-[#0a7a52]'
                    )}
                    htmlFor={`refine-slider-${slider.key}`}
                  >
                    {slider.format(value)}
                  </output>
                </div>

                <input
                  id={`refine-slider-${slider.key}`}
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  value={value}
                  aria-label={`${slider.label}, ${slider.hint}`}
                  style={
                    {
                      '--range-track-fill': refineTrackFillFromDatum(
                        slider.min,
                        slider.max,
                        value,
                        slider.default
                      ),
                    } as CSSProperties
                  }
                  onChange={(e) => {
                    updateRefine({
                      adjustments: {
                        ...selections.adjustments,
                        [slider.key]: Number(e.target.value),
                      },
                    })
                    syncRefineIris()
                  }}
                  className={cn(
                    'refine-range-slider h-2 w-full cursor-pointer rounded-full',
                    'accent-[var(--color-ih-accent)]',
                    '[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[var(--color-ih-accent)] [&::-webkit-slider-thumb]:shadow-sm',
                    '[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[var(--color-ih-accent)]'
                  )}
                />

                <div className="mt-1.5 flex items-center justify-between text-[10px] font-medium text-ih-muted/90">
                  <span>{slider.low}</span>
                  {isDefault ? (
                    <span className="text-ih-border">Default</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => resetSlider(slider.key, slider.default)}
                      className="font-semibold text-ih-accent underline decoration-ih-accent/40 underline-offset-2 transition-colors hover:text-[#0a7a52]"
                    >
                      Reset
                    </button>
                  )}
                  <span>{slider.high}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-3 border-t border-ih-border/60 pt-3">
          <button
            type="button"
            disabled={allAtDefault}
            onClick={() => {
              updateRefine({
                adjustments: { saturation: 100, brightness: 100, temperature: 0, hue: 0 },
              })
              syncRefineIris()
            }}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-[var(--radius-btn)] border border-ih-border bg-white px-3 py-2 text-[12px] font-medium text-foreground transition-colors',
              'hover:bg-ih-border/25 hover:border-ih-muted/40',
              'disabled:pointer-events-none disabled:opacity-40'
            )}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Reset all sliders
          </button>
        </div>

        <div className="mt-4 border-t border-ih-border/60 pt-3">
          <div className="mb-2 flex items-start gap-2">
            <Eraser className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ih-muted" aria-hidden />
            <div className="min-w-0">
              <h3 className="text-[13px] font-semibold tracking-tight text-[var(--color-primary-cta)]">
                Magic eraser
              </h3>
              <p className="mt-0.5 text-[11px] leading-snug text-ih-muted">
                Paint on the preview to mark spots; drag to brush. Use brush size and undo below.
              </p>
            </div>
          </div>

          <div className="mb-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={eraserCount === 0}
              onClick={() => {
                updateRefine({ eraserPoints: selections.eraserPoints.slice(0, -1) })
                syncRefineIris()
              }}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-[var(--radius-btn)] border border-ih-border bg-white px-2.5 py-1.5 text-[11px] font-medium text-foreground',
                'hover:bg-ih-border/25 disabled:pointer-events-none disabled:opacity-40'
              )}
            >
              <Undo2 className="h-3 w-3" aria-hidden />
              Undo
            </button>
            <button
              type="button"
              disabled={eraserCount === 0}
              onClick={() => {
                updateRefine({ eraserPoints: [] })
                syncRefineIris()
              }}
              className={cn(
                'inline-flex items-center rounded-[var(--radius-btn)] border border-ih-border bg-white px-2.5 py-1.5 text-[11px] font-medium text-foreground',
                'hover:bg-ih-border/25 disabled:pointer-events-none disabled:opacity-40'
              )}
            >
              Clear all marks
            </button>
            {eraserCount > 0 && (
              <span className="text-[10px] text-ih-muted tabular-nums">{eraserCount} mark{eraserCount === 1 ? '' : 's'}</span>
            )}
          </div>

          <div className="rounded-lg border border-ih-border/90 bg-white/90 px-2.5 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-[12px] font-medium text-foreground">Brush size</span>
              <span className="text-[11px] font-semibold tabular-nums text-ih-muted">{selections.brushSize}px</span>
            </div>
            <input
              type="range"
              min={8}
              max={56}
              value={selections.brushSize}
              aria-label="Eraser brush size"
              style={
                {
                  '--range-track-fill': refineTrackFillFromDatum(
                    8,
                    56,
                    selections.brushSize,
                    BRUSH_DATUM
                  ),
                } as CSSProperties
              }
              onChange={(e) => updateRefine({ brushSize: Number(e.target.value) })}
              className={cn(
                'refine-range-slider h-2 w-full cursor-pointer rounded-full',
                'accent-[var(--color-ih-accent)]',
                '[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[var(--color-ih-accent)] [&::-webkit-slider-thumb]:shadow-sm',
                '[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[var(--color-ih-accent)]'
              )}
            />
          </div>
        </div>
      </div>

      <div className="shrink-0 -mx-4 bg-[#FFFFFF] px-4 py-3" style={{ borderTop: '1px solid #E0DDD8' }}>
        {error && (
          <p className="mb-2 text-[12px] text-ih-danger">{error}</p>
        )}
        <CreditActionButton
          label="Apply Refinement"
          cost={applyCost}
          isFree={applyIsFree}
          disabled={!hasChanges}
          loading={loading}
          onClick={handleApply}
        />
      </div>
    </div>
  )
}
