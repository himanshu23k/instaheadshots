import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { useStudioStore } from '@/store/studio-store'
import type { StationId } from '@/types/studio'

// Per-station suggestion chips
const STATION_SUGGESTIONS: Record<StationId, string[]> = {
  look: ['Best for LinkedIn', 'Best for dating profiles', 'Most professional'],
  setting: ['Clean & minimal', 'Warm & approachable', 'Dark & editorial'],
  style: ['Business formal', 'Smart casual', 'Creative industry'],
  refine: ['Fix the lighting', 'Sharpen details', 'Soften the mood'],
}

// Map suggestion chips to pre-selectable options per station
const SUGGESTION_SELECTIONS: Record<string, { station: StationId; selection: Record<string, string> }> = {
  'Best for LinkedIn': { station: 'look', selection: { faceId: 'face-confident', postureId: 'posture-straight' } },
  'Best for dating profiles': { station: 'look', selection: { faceId: 'face-friendly', postureId: 'posture-3q-left' } },
  'Most professional': { station: 'look', selection: { faceId: 'face-confident', postureId: 'posture-straight' } },
  'Clean & minimal': { station: 'setting', selection: { backgroundId: 'bg-white-studio' } },
  'Warm & approachable': { station: 'setting', selection: { backgroundId: 'bg-garden' } },
  'Dark & editorial': { station: 'setting', selection: { backgroundId: 'bg-dark-studio' } },
  'Business formal': { station: 'style', selection: { outfitId: 'outfit-navy-blazer' } },
  'Smart casual': { station: 'style', selection: { outfitId: 'outfit-casual-shirt' } },
  'Creative industry': { station: 'style', selection: { outfitId: 'outfit-turtleneck' } },
  'Fix the lighting': { station: 'refine', selection: {} },
  'Sharpen details': { station: 'refine', selection: {} },
  'Soften the mood': { station: 'refine', selection: {} },
}

const USECASE_RESPONSES: Record<string, string> = {
  linkedin: 'For LinkedIn — confident pose, neutral backdrop, dark blazer. Classic and clean.',
  vc: 'For a VC pitch — confident pose, neutral backdrop, dark blazer.',
  dating: 'For dating — friendly expression, warm backdrop, casual outfit. Approachable wins.',
  corporate: 'Corporate headshot — straight on, white studio, navy blazer. Clean and authoritative.',
  creative: 'Creative field — relaxed lean, editorial backdrop, turtleneck. Show personality.',
  default: 'Got it. I\'d go with a confident look on a clean backdrop. Let me highlight some options.',
}

interface AskIrisPopoverProps {
  open: boolean
  onClose: () => void
  onIrisMessage: (message: string) => void
}

export function AskIrisPopover({ open, onClose, onIrisMessage }: AskIrisPopoverProps) {
  const [usecaseInput, setUsecaseInput] = useState('')
  const activeStation = useStudioStore((s) => s.activeStation)
  const updateLook = useStudioStore((s) => s.updateLookSelection)
  const updateSetting = useStudioStore((s) => s.updateSettingSelection)
  const updateStyle = useStudioStore((s) => s.updateStyleSelection)
  const updateRefine = useStudioStore((s) => s.updateRefineSelection)
  const popoverRef = useRef<HTMLDivElement>(null)

  const suggestions = STATION_SUGGESTIONS[activeStation]

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const handleChipClick = (chip: string) => {
    const mapping = SUGGESTION_SELECTIONS[chip]
    if (mapping) {
      const { station, selection } = mapping
      if (station === 'look' && Object.keys(selection).length > 0) {
        updateLook(selection as { faceId?: string; postureId?: string })
      } else if (station === 'setting' && Object.keys(selection).length > 0) {
        updateSetting(selection as { backgroundId?: string })
      } else if (station === 'style' && Object.keys(selection).length > 0) {
        updateStyle(selection as { outfitId?: string })
      } else if (station === 'refine') {
        updateRefine({ prompt: chip.toLowerCase() })
      }
    }
    onIrisMessage(`${chip} — I've highlighted my pick. See if it works for you.`)
    onClose()
  }

  const handleUsecaseSubmit = () => {
    if (!usecaseInput.trim()) return
    const lower = usecaseInput.toLowerCase()

    let response = USECASE_RESPONSES.default
    for (const [key, val] of Object.entries(USECASE_RESPONSES)) {
      if (key !== 'default' && lower.includes(key)) {
        response = val
        break
      }
    }

    onIrisMessage(response)
    setUsecaseInput('')
    onClose()
  }

  return (
    <div
      ref={popoverRef}
      className="absolute left-0 right-0 z-20"
      style={{
        top: '100%',
        background: '#FFFFFF',
        border: '1px solid #E0DDD8',
        borderTop: 'none',
        borderRadius: '0 0 12px 12px',
        padding: '12px 16px',
        boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 w-4 h-4 flex items-center justify-center text-ih-muted hover:text-foreground transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Section A: Suggestions */}
      <p className="text-[12px] text-ih-muted font-medium mb-2">
        Suggested for your {activeStation}
      </p>
      <div className="flex gap-2 flex-wrap">
        {suggestions.map((chip) => (
          <button
            key={chip}
            onClick={() => handleChipClick(chip)}
            className="px-3 py-1.5 text-[12px] cursor-pointer transition-all hover:bg-ih-border/60 active:scale-[0.96]"
            style={{
              border: '1px solid #E0DDD8',
              borderRadius: '16px',
              background: '#FAFAFA',
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Section B: Freeform */}
      <p className="text-[12px] text-ih-muted font-medium mt-3 mb-2">
        Ask about your usecase
      </p>
      <input
        type="text"
        value={usecaseInput}
        onChange={(e) => setUsecaseInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleUsecaseSubmit()
        }}
        placeholder="e.g. I need this for a VC pitch deck..."
        className="w-full text-[13px] focus:outline-none focus:ring-2 focus:ring-ih-accent/40"
        style={{
          border: '1px solid #E0DDD8',
          borderRadius: '6px',
          padding: '8px 12px',
        }}
      />
    </div>
  )
}
