import { useEffect, useRef, useState } from 'react'
import { useStudioStore } from '@/store/studio-store'
import { useTypedText } from '@/hooks/use-typed-text'
import { IrisAvatar } from './IrisAvatar'
import type { StationId } from '@/types/studio'

// Station greeting messages — rotate on each visit
const STATION_GREETINGS: Record<StationId, string[]> = {
  look: [
    'Your expression sets the tone. Choose carefully.',
    'The right angle changes everything.',
    'Let\'s find the face that tells your story.',
  ],
  setting: [
    'The background tells the story behind you.',
    'Where you are says as much as who you are.',
    'Every backdrop shifts the mood. Pick yours.',
  ],
  style: [
    'What you wear in the frame matters.',
    'Clothes shape perception before you say a word.',
    'The right outfit finishes the composition.',
  ],
  refine: [
    'Small details. Big difference.',
    'This is where good becomes great.',
    'Fine-tune until it feels right.',
  ],
}

export function IrisStationGreeting() {
  const activeStation = useStudioStore((s) => s.activeStation)
  const irisReaction = useStudioStore((s) => s.irisReaction)

  // Track visit count per station to rotate messages
  const visitCountRef = useRef<Record<string, number>>({})
  const [greeting, setGreeting] = useState('')
  const [visible, setVisible] = useState(false)
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Detect if we're on desktop (panel layout) — no auto-fade, greeting persists
  const isDesktop = useRef(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    isDesktop.current = mq.matches
    const handler = (e: MediaQueryListEvent) => { isDesktop.current = e.matches }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // On station change, pick the next greeting and start the show/fade cycle
  useEffect(() => {
    const count = visitCountRef.current[activeStation] || 0
    visitCountRef.current[activeStation] = count + 1

    const messages = STATION_GREETINGS[activeStation]
    const message = messages[count % messages.length]

    setGreeting(message)
    setVisible(true)

    // Clear previous fade timer
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)

    // On mobile, auto-fade after 6s. On desktop panel, stay visible.
    if (!isDesktop.current) {
      fadeTimerRef.current = setTimeout(() => {
        setVisible(false)
      }, 6000)
    }

    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    }
  }, [activeStation])

  const { displayed, done } = useTypedText(
    visible ? greeting : '',
    30 // 30ms per character
  )

  // Hide if a post-reveal reaction is active
  if (irisReaction) return null
  if (!visible && !displayed) return null

  return (
    <div
      className="flex items-center gap-2 px-4 py-2 shrink-0 transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <IrisAvatar />
      <p className="text-[13px] text-ih-muted italic">
        {displayed}
        {!done && displayed && (
          <span
            className="inline-block w-[1.5px] h-[13px] bg-ih-muted/60 ml-0.5 align-middle"
            style={{ animation: 'typing-cursor 0.8s step-end infinite' }}
          />
        )}
      </p>
    </div>
  )
}
