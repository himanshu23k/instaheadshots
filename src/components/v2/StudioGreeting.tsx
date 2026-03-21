import { useMemo, useState, useEffect } from 'react'
import { useStudioStore } from '@/store/studio-store'
import { useTypedText } from '@/hooks/use-typed-text'
import { IrisAvatar } from './iris/IrisAvatar'
import greetingsData from '@/data/iris-greetings.json'

const greetings = greetingsData as string[]

export function StudioGreeting() {
  const phase = useStudioStore((s) => s.phase)
  const completeGreeting = useStudioStore((s) => s.completeGreeting)
  const sourceImage = useStudioStore((s) => s.sourceImage)
  const [showButton, setShowButton] = useState(false)

  const greeting = useMemo(
    () => greetings[Math.floor(Math.random() * greetings.length)],
    []
  )

  const { displayed, done } = useTypedText(
    phase === 'greeting' ? greeting : '',
    40
  )

  // Show button 200ms after typing completes
  useEffect(() => {
    if (!done) {
      setShowButton(false)
      return
    }
    const timer = setTimeout(() => setShowButton(true), 200)
    return () => clearTimeout(timer)
  }, [done])

  if (phase !== 'greeting') return null

  return (
    <div className="fixed inset-0 z-50 bg-[#111111] flex flex-col items-center justify-center px-6">
      {/* Photo fade-in */}
      <div
        className="max-w-[360px] w-full aspect-[3/4] rounded-[var(--radius-preview)] overflow-hidden shadow-2xl mb-8"
        style={{ animation: 'fade-in 0.6s ease, scale-bounce 0.6s ease' }}
      >
        <img
          src={sourceImage}
          alt="Your photo"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Iris greeting — wraps to 2 lines if needed */}
      <div
        className="flex items-start gap-3 max-w-[400px] w-full"
        style={{ animation: 'fade-in 0.5s ease 0.3s both' }}
      >
        <IrisAvatar className="!w-6 !h-6 shrink-0 mt-0.5" />
        <p className="text-[16px] text-white/80 leading-relaxed" style={{ whiteSpace: 'normal' }}>
          {displayed}
          {!done && (
            <span
              className="inline-block w-[2px] h-[16px] bg-white/70 ml-0.5 align-middle"
              style={{ animation: 'typing-cursor 0.8s step-end infinite' }}
            />
          )}
        </p>
      </div>

      {/* Continue button — 200ms delay after typing completes */}
      {showButton && (
        <button
          onClick={completeGreeting}
          className="mt-8 px-8 py-3 bg-ih-accent text-white text-[14px] font-medium rounded-[var(--radius-btn)] hover:bg-ih-accent/90 transition-colors"
          style={{ animation: 'fade-in 0.4s ease' }}
        >
          Let's go
        </button>
      )}
    </div>
  )
}
