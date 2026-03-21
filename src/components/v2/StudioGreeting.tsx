import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { useStudioStore } from '@/store/studio-store'
import { useTypedText } from '@/hooks/use-typed-text'
import { IrisAvatar } from './iris/IrisAvatar'
import { cn } from '@/lib/utils'
import greetingsData from '@/data/iris-greetings.json'

const greetings = greetingsData as string[]

/** Inner content fade — must match CSS duration below */
const CONTENT_FADE_MS = 400
/** Solid blank beat before the studio shell appears */
const BLANK_HOLD_MS = 480

export function StudioGreeting() {
  const phase = useStudioStore((s) => s.phase)
  const completeGreeting = useStudioStore((s) => s.completeGreeting)
  const sourceImage = useStudioStore((s) => s.sourceImage)
  const [showButton, setShowButton] = useState(false)
  const [exiting, setExiting] = useState(false)
  const completedRef = useRef(false)
  const blankTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const greeting = useMemo(
    () => greetings[Math.floor(Math.random() * greetings.length)],
    []
  )

  const { displayed, done } = useTypedText(
    phase === 'greeting' ? greeting : '',
    40
  )

  const finish = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    if (blankTimerRef.current) {
      clearTimeout(blankTimerRef.current)
      blankTimerRef.current = null
    }
    completeGreeting()
  }, [completeGreeting])

  // Show button 200ms after typing completes
  useEffect(() => {
    if (!done) {
      setShowButton(false)
      return
    }
    const timer = setTimeout(() => setShowButton(true), 200)
    return () => clearTimeout(timer)
  }, [done])

  // Fallback if inner opacity transition or blank hold never completes
  useEffect(() => {
    if (!exiting) return
    const t = setTimeout(
      () => finish(),
      CONTENT_FADE_MS + BLANK_HOLD_MS + 250
    )
    return () => clearTimeout(t)
  }, [exiting, finish])

  useEffect(
    () => () => {
      if (blankTimerRef.current) clearTimeout(blankTimerRef.current)
    },
    []
  )

  if (phase !== 'greeting') return null

  const handleLetsGo = () => {
    if (exiting) return
    setExiting(true)
  }

  const handleInnerTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    if (e.propertyName !== 'opacity') return
    if (!exiting || completedRef.current) return
    blankTimerRef.current = setTimeout(() => {
      blankTimerRef.current = null
      finish()
    }, BLANK_HOLD_MS)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--color-page)]">
      {/* Outer stays opaque: blank screen after inner fades out, before studio mounts */}
      <div
        className={cn(
          'flex min-h-full flex-col items-center px-6 pb-10 pt-[max(8vh,2.5rem)]',
          'transition-opacity duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
          exiting && 'pointer-events-none opacity-0'
        )}
        onTransitionEnd={handleInnerTransitionEnd}
      >
        {/* Top-aligned stack so the photo never shifts when text wraps or the CTA mounts */}
        <div className="flex w-full max-w-[400px] flex-col items-center">
          {/* Photo fade-in — shrink-0 keeps aspect box from moving */}
          <div
            className="mb-8 aspect-[3/4] w-full max-w-[360px] shrink-0 overflow-hidden rounded-[var(--radius-preview)] shadow-2xl"
            style={{ animation: 'fade-in 0.6s ease, scale-bounce 0.6s ease' }}
          >
            <img
              src={sourceImage}
              alt="Your photo"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Incoming speech bubble — min height keeps layout stable when copy wraps */}
          <div
            className="flex w-full min-h-[4.5rem] items-start gap-3"
            style={{ animation: 'fade-in 0.5s ease 0.3s both' }}
          >
            <IrisAvatar variant="photo" className="!h-6 !w-6 mt-1 shrink-0" />
            <div className="min-h-[4.5rem] min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-ih-border bg-[var(--color-surface)] px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <p
                className="text-[16px] leading-relaxed text-[var(--color-primary-cta)]"
                style={{ whiteSpace: 'normal' }}
              >
                {displayed}
                {!done && (
                  <span
                    className="ml-0.5 inline-block h-[16px] w-[2px] align-middle bg-ih-muted/80"
                    style={{ animation: 'typing-cursor 0.8s step-end infinite' }}
                  />
                )}
              </p>
            </div>
          </div>

          {/* Reserve CTA height so the button fade-in doesn’t reflow layout above */}
          <div className="mt-8 flex min-h-[45px] w-full items-center justify-center">
            {showButton && (
              <button
                type="button"
                disabled={exiting}
                onClick={handleLetsGo}
                className="rounded-[var(--radius-btn)] bg-ih-accent px-8 py-3 text-[14px] font-medium text-white transition-colors hover:bg-ih-accent/90 disabled:pointer-events-none disabled:opacity-60"
                style={{ animation: 'fade-in 0.4s ease' }}
              >
                Let's go
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
