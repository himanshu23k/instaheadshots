import { useEffect, useState, useMemo, useRef } from 'react'
import { useStudioStore } from '@/store/studio-store'
import facesData from '@/data/faces.json'
import posturesData from '@/data/postures.json'
import backgroundsData from '@/data/backgrounds.json'
import outfitsData from '@/data/outfits.json'
import type { FaceOption, PostureOption, BackgroundOption, OutfitOption } from '@/types'
import type { ReactNode } from 'react'

const faces = facesData as FaceOption[]
const postures = posturesData as PostureOption[]
const backgrounds = backgroundsData as BackgroundOption[]
const outfits = outfitsData as OutfitOption[]

// Iris dot colors per active station
const DOT_COLORS: Record<string, string> = {
  look: '#F0A500',
  setting: '#3B8FD4',
  style: '#1D9E75',
  refine: '#7F77DD',
}

// Station greetings
const STATION_GREETINGS: Record<string, string> = {
  look: 'Your expression sets the tone.',
  setting: 'The background tells your story.',
  style: 'What you wear in the frame matters.',
  refine: 'Small details. Big difference.',
}

// Contextual messages based on selection progress
function getContextualMessage(
  station: string,
  faceId: string | null,
  postureId: string | null,
  backgroundId: string | null,
  outfitId: string | null,
): string | null {
  if (station === 'look') {
    if (faceId && postureId) return 'That combination has presence.'
    if (faceId) return 'Good choice. Now pick a stance.'
    if (postureId) return 'Nice stance. Pick an expression to match.'
  }
  if (station === 'setting') {
    if (backgroundId) return 'That backdrop works. Apply it or keep browsing.'
  }
  if (station === 'style') {
    if (outfitId) return 'Sharp. Apply it or try another.'
  }
  return null
}

/**
 * Builds a natural-language instruction from current selections.
 */
function buildInstruction(
  faceId: string | null,
  postureId: string | null,
  backgroundId: string | null,
  outfitId: string | null,
  prompt: string,
): string {
  const parts: string[] = []

  const face = faceId ? faces.find((f) => f.id === faceId) : null
  const posture = postureId ? postures.find((p) => p.id === postureId) : null
  const bg = backgroundId ? backgrounds.find((b) => b.id === backgroundId) : null
  const outfit = outfitId ? outfits.find((o) => o.id === outfitId) : null

  if (face) parts.push(`Give me the ${face.name} look`)
  if (posture) {
    parts.push(parts.length > 0 ? `, ${posture.name} stance` : `Give me a ${posture.name} stance`)
  }
  if (bg) parts.push(` on a ${bg.name} backdrop`)
  if (outfit) parts.push(` wearing ${outfit.name}`)
  if (prompt && prompt.trim().length > 0) {
    const words = prompt.trim().split(/\s+/)
    const preview = words.slice(0, 4).join(' ')
    const suffix = words.length > 4 ? '...' : ''
    parts.push(` and ${preview}${suffix}`)
  }

  return parts.join('')
}

const REACTIONS = [
  'Better.',
  "That's it.",
  'Strong choice.',
  'Now we\'re talking.',
  'Yes. That works.',
]

interface IrisDirectionLineProps {
  rightSlot?: ReactNode
  overrideMessage?: string | null
}

export function IrisDirectionLine({ rightSlot, overrideMessage }: IrisDirectionLineProps) {
  const activeStation = useStudioStore((s) => s.activeStation)
  const selections = useStudioStore((s) => s.stationSelections)
  const irisReaction = useStudioStore((s) => s.irisReaction)
  const setIrisReaction = useStudioStore((s) => s.setIrisReaction)

  const instruction = useMemo(
    () =>
      buildInstruction(
        selections.look.faceId,
        selections.look.postureId,
        selections.setting.backgroundId,
        selections.style.outfitId,
        selections.refine.prompt,
      ),
    [
      selections.look.faceId,
      selections.look.postureId,
      selections.setting.backgroundId,
      selections.style.outfitId,
      selections.refine.prompt,
    ],
  )

  const contextual = getContextualMessage(
    activeStation,
    selections.look.faceId,
    selections.look.postureId,
    selections.setting.backgroundId,
    selections.style.outfitId,
  )

  const hasSelections = instruction.length > 0
  const greeting = STATION_GREETINGS[activeStation] || STATION_GREETINGS.look

  // Priority: override > contextual > instruction > greeting
  const targetText = overrideMessage || contextual || (hasSelections ? instruction : greeting)

  // ── Fade transition state ──
  const [displayedText, setDisplayedText] = useState(targetText)
  const [fading, setFading] = useState(false)
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (targetText === displayedText) return

    // Start fade out
    setFading(true)
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)

    fadeTimerRef.current = setTimeout(() => {
      setDisplayedText(targetText)
      setFading(false)
    }, 150)

    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    }
  }, [targetText, displayedText])

  // ── Reaction overlay ──
  const [showReaction, setShowReaction] = useState(false)
  const [reactionText, setReactionText] = useState('')
  const reactionTimerRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    reactionTimerRef.current.forEach(clearTimeout)
    reactionTimerRef.current = []

    if (!irisReaction) return

    const reaction = REACTIONS[Math.floor(Math.random() * REACTIONS.length)]
    setReactionText(reaction)
    setShowReaction(true)

    const hideTimer = setTimeout(() => setShowReaction(false), 2000)
    const clearTimer = setTimeout(() => setIrisReaction(null), 2200)
    reactionTimerRef.current = [hideTimer, clearTimer]

    return () => reactionTimerRef.current.forEach(clearTimeout)
  }, [irisReaction, setIrisReaction])

  const dotColor = DOT_COLORS[activeStation] || DOT_COLORS.look

  return (
    <div
      className="relative shrink-0 flex items-center gap-2.5"
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid #E0DDD8',
        background: '#FFFFFF',
        minHeight: '48px',
      }}
    >
      {/* Iris dot */}
      <div
        className="shrink-0 rounded-full transition-colors duration-300"
        style={{ width: '8px', height: '8px', backgroundColor: dotColor }}
        aria-hidden="true"
      />

      {/* Message text */}
      <div className="relative flex-1 min-w-0 overflow-hidden">
        <p
          className="text-[12px] italic leading-[1.4] transition-opacity duration-150"
          style={{
            color: '#4A4A4A',
            opacity: showReaction ? 0 : fading ? 0 : 1,
          }}
        >
          {displayedText}
        </p>

        {/* Reaction overlay */}
        <p
          className="absolute inset-0 flex items-center text-[12px] italic leading-[1.4] transition-opacity duration-150"
          style={{
            color: '#4A4A4A',
            opacity: showReaction ? 1 : 0,
          }}
          role="status"
          aria-live="polite"
        >
          {reactionText}
        </p>
      </div>

      {/* Right slot — Ask Iris button */}
      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </div>
  )
}
