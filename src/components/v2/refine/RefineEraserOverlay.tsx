import { useCallback, useEffect } from 'react'
import { useStudioStore } from '@/store/studio-store'
import { buildRefineGoalDescription } from '@/lib/iris-station-goal-text'
import { cn } from '@/lib/utils'

/**
 * Paint-to-mark overlay on the preview when Refine station is active.
 * Coordinates are 0–100% of the image box (same convention as v1 Magic Eraser).
 */
export function RefineEraserOverlay() {
  const activeStation = useStudioStore((s) => s.activeStation)
  const revealPhase = useStudioStore((s) => s.revealPhase)
  const variationsVisible = useStudioStore((s) => s.variationsVisible)
  const eraserPoints = useStudioStore((s) => s.stationSelections.refine.eraserPoints)
  const brushSize = useStudioStore((s) => s.stationSelections.refine.brushSize)
  const updateRefine = useStudioStore((s) => s.updateRefineSelection)
  const setIrisGoalForStation = useStudioStore((s) => s.setIrisGoalForStation)

  useEffect(() => {
    if (activeStation !== 'refine') return
    const r = useStudioStore.getState().stationSelections.refine
    setIrisGoalForStation('refine', buildRefineGoalDescription(r))
  }, [activeStation, eraserPoints, setIrisGoalForStation])

  const addMark = useCallback(
    (clientX: number, clientY: number, el: HTMLDivElement) => {
      const rect = el.getBoundingClientRect()
      const w = rect.width || 1
      const h = rect.height || 1
      const x = ((clientX - rect.left) / w) * 100
      const y = ((clientY - rect.top) / h) * 100
      const prev = useStudioStore.getState().stationSelections.refine.eraserPoints
      updateRefine({
        eraserPoints: [...prev, { x, y }],
      })
    },
    [updateRefine]
  )

  if (activeStation !== 'refine') return null
  if (variationsVisible) return null
  if (revealPhase !== 'idle' && revealPhase !== 'complete') return null

  return (
    <div className="pointer-events-none absolute inset-0 z-[8]">
      <div
        role="presentation"
        className={cn(
          'pointer-events-auto absolute inset-0 cursor-crosshair touch-none',
          'select-none'
        )}
        onPointerDown={(e) => {
          if (e.button !== 0) return
          e.currentTarget.setPointerCapture(e.pointerId)
          addMark(e.clientX, e.clientY, e.currentTarget)
        }}
        onPointerMove={(e) => {
          if (!(e.buttons & 1)) return
          if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
          addMark(e.clientX, e.clientY, e.currentTarget)
        }}
      />
      {eraserPoints.map((point, i) => (
        <div
          key={i}
          className="pointer-events-none absolute rounded-full border border-white/90 bg-white/45 shadow-sm"
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
  )
}
