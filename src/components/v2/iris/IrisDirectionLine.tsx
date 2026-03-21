import { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react'
import { useStudioStore } from '@/store/studio-store'
import { BorderBeam } from '@/components/ui/border-beam'
import { cn } from '@/lib/utils'
import { useTypedText } from '@/hooks/use-typed-text'
import {
  buildLookGoalDescription,
  buildSettingGoalDescription,
  buildStyleGoalDescription,
  buildRefineGoalDescription,
} from '@/lib/iris-station-goal-text'
import type { StationId } from '@/types/studio'

const IRIS_AVATAR = '/iris-avatar.png'

/** Min textarea height (3rem) */
const GOAL_TEXTAREA_MIN_PX = 48

/** Max height for Iris body scroll (keeps bubble in view via sticky header; avoids clipping by fixed panel) */
const IRIS_SCROLL_BODY_CLASS =
  'max-h-[min(65vh,calc(100dvh-12rem))] min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain'

const BEAM_COLORS: Record<
  StationId,
  { from: string; to: string; from2: string; to2: string }
> = {
  look: { from: '#F0A500', to: '#FF6B35', from2: '#FFB347', to2: '#F0A500' },
  setting: { from: '#3B8FD4', to: '#6366F1', from2: '#60A5FA', to2: '#3B8FD4' },
  style: { from: '#1D9E75', to: '#14B8A6', from2: '#34D399', to2: '#1D9E75' },
  refine: { from: '#7F77DD', to: '#A855F7', from2: '#C084FC', to2: '#7F77DD' },
}

const STATION_GREETINGS: Record<string, string> = {
  look: 'Your expression sets the tone. Choose the best one.',
  setting: 'The background tells your story. Lets find the perfect one.',
  style: 'Your style is your statement. What do you want to say?',
  refine: 'God is in the details. Let me help you with that.',
}

const STATION_SUGGESTIONS: Record<StationId, string[]> = {
  look: ['Best for LinkedIn', 'Best for dating profiles', 'Most professional'],
  setting: ['Clean & minimal', 'Warm & approachable', 'Dark & editorial'],
  style: ['Business formal', 'Smart casual', 'Creative industry'],
  refine: ['Fix the lighting', 'Sharpen details', 'Soften the mood'],
}

const SUGGESTION_SELECTIONS: Record<string, { station: StationId; selection: Record<string, string> }> = {
  'Best for LinkedIn': { station: 'look', selection: { faceId: 'face-01', postureId: 'posture-straight' } },
  'Best for dating profiles': { station: 'look', selection: { faceId: 'face-11', postureId: 'posture-3q-left' } },
  'Most professional': { station: 'look', selection: { faceId: 'face-04', postureId: 'posture-straight' } },
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

const REACTIONS = [
  'Better.',
  "That's it.",
  'Strong choice.',
  "Now we're talking.",
  'Yes. That works.',
]

export function IrisDirectionLine() {
  const activeStation = useStudioStore((s) => s.activeStation) as StationId
  const stationGoal = useStudioStore((s) => s.irisGoalByStation[activeStation])
  const setIrisGoalForStation = useStudioStore((s) => s.setIrisGoalForStation)
  const irisReaction = useStudioStore((s) => s.irisReaction)
  const setIrisReaction = useStudioStore((s) => s.setIrisReaction)
  const updateLook = useStudioStore((s) => s.updateLookSelection)
  const updateSetting = useStudioStore((s) => s.updateSettingSelection)
  const updateStyle = useStudioStore((s) => s.updateStyleSelection)
  const updateRefine = useStudioStore((s) => s.updateRefineSelection)

  const goalTextareaRef = useRef<HTMLTextAreaElement>(null)

  const syncGoalTextareaHeight = useCallback(() => {
    const el = goalTextareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(el.scrollHeight, GOAL_TEXTAREA_MIN_PX)}px`
  }, [])

  useLayoutEffect(() => {
    syncGoalTextareaHeight()
  }, [stationGoal, activeStation, syncGoalTextareaHeight])

  const greeting = STATION_GREETINGS[activeStation] || STATION_GREETINGS.look

  /** Bubble shows station greeting only; goal textarea holds per-station draft copy. */
  const targetText = greeting

  /** iMessage-style: new line types in when you land on each station */
  const { displayed: typedGreeting, done: greetingTyped } = useTypedText(
    targetText,
    28
  )

  const [irisCollapsed, setIrisCollapsed] = useState(true)

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

  const beam = BEAM_COLORS[activeStation] || BEAM_COLORS.look
  const quickPicks = STATION_SUGGESTIONS[activeStation].slice(0, 3)

  const applyChip = (chip: string) => {
    const mapping = SUGGESTION_SELECTIONS[chip]
    if (mapping) {
      const { station, selection } = mapping
      if (station === 'look' && Object.keys(selection).length > 0) {
        updateLook(selection as { faceId?: string; postureId?: string })
        const look = useStudioStore.getState().stationSelections.look
        setIrisGoalForStation('look', buildLookGoalDescription(look.faceId, look.postureId))
      } else if (station === 'setting' && Object.keys(selection).length > 0) {
        updateSetting(selection as { backgroundId?: string })
        const set = useStudioStore.getState().stationSelections.setting
        setIrisGoalForStation('setting', buildSettingGoalDescription(set.backgroundId, set.customUpload))
      } else if (station === 'style' && Object.keys(selection).length > 0) {
        updateStyle(selection as { outfitId?: string })
        const st = useStudioStore.getState().stationSelections.style
        setIrisGoalForStation('style', buildStyleGoalDescription(st.outfitId, st.shopProduct))
      } else if (station === 'refine') {
        updateRefine({ prompt: chip.toLowerCase() })
        const r = useStudioStore.getState().stationSelections.refine
        setIrisGoalForStation('refine', buildRefineGoalDescription(r))
      }
    }
  }

  return (
    <section
      className={cn(
        'group relative w-full overflow-hidden text-left transition-[box-shadow,background-color,padding] duration-200',
        'border border-ih-border bg-gradient-to-b from-[#FDFCFA] to-[#F7F6F3]',
        'rounded-xl shadow-sm shadow-black/[0.04] mb-2',
        'hover:from-[#FFFFFF] hover:to-[#F9F8F6]',
        'px-5',
        irisCollapsed &&
          'cursor-pointer py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent/40 focus-visible:ring-offset-2',
        !irisCollapsed && 'py-3'
      )}
      aria-label="Assistant"
      aria-expanded={!irisCollapsed}
      role={irisCollapsed ? 'button' : undefined}
      tabIndex={irisCollapsed ? 0 : undefined}
      onClick={
        irisCollapsed
          ? () => {
              setIrisCollapsed(false)
            }
          : undefined
      }
      onKeyDown={
        irisCollapsed
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setIrisCollapsed(false)
              }
            }
          : undefined
      }
    >
      <BorderBeam
        duration={10}
        size={120}
        borderWidth={1}
        colorFrom={beam.from}
        colorTo={beam.to}
        className="from-transparent via-50%"
      />
      <BorderBeam
        duration={10}
        delay={5}
        size={120}
        borderWidth={1}
        colorFrom={beam.from2}
        colorTo={beam.to2}
        reverse
        className="from-transparent via-50%"
      />

      {irisCollapsed ? (
        <div className="relative z-[1] flex w-full min-w-0 items-center justify-start gap-2.5">
          <img
            src={IRIS_AVATAR}
            alt=""
            width={32}
            height={32}
            className="pointer-events-none shrink-0 w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
            draggable={false}
          />
          <div className="w-fit shrink-0 rounded-xl rounded-tl-sm border border-ih-border/80 bg-white px-2 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <p className="whitespace-nowrap text-[12px] font-medium leading-tight text-[#4A4A4A]">
              Need Help?
            </p>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'relative z-[1] w-full min-w-0 flex flex-col gap-2 isolate',
            IRIS_SCROLL_BODY_CLASS
          )}
        >
          {/* Sticky: avatar + bubble stay visible when chips/textarea overflow */}
          <div className="sticky top-0 z-10 flex shrink-0 gap-2.5 items-start w-full min-w-0 bg-gradient-to-b from-[#FDFCFA] to-[#F7F6F3] pb-2 border-b border-ih-border/30">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIrisCollapsed(true)
              }}
              className="shrink-0 rounded-full ring-2 ring-white shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent/50 focus-visible:ring-offset-2"
              aria-label="Collapse assistant panel"
            >
              <img
                src={IRIS_AVATAR}
                alt=""
                width={32}
                height={32}
                className="pointer-events-none block h-8 w-8 rounded-full object-cover"
                draggable={false}
              />
            </button>

            <div
              className="flex-1 min-w-0 min-h-[2.75rem] rounded-xl rounded-tl-sm border border-ih-border/80 bg-white px-2.5 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              role="status"
              aria-live="polite"
            >
              <div className="relative min-h-[2rem]">
                <p
                  className="text-[12px] italic leading-[1.35] text-[#4A4A4A] transition-opacity duration-150"
                  style={{
                    opacity: showReaction ? 0 : 1,
                  }}
                >
                  {typedGreeting}
                  {!showReaction && !greetingTyped && (
                    <span
                      className="ml-0.5 inline-block h-[12px] w-[2px] translate-y-[1px] align-middle bg-ih-muted/80"
                      style={{ animation: 'typing-cursor 0.8s step-end infinite' }}
                      aria-hidden
                    />
                  )}
                </p>
                <p
                  className="absolute left-0 top-0 right-0 text-[12px] italic leading-[1.35] text-[#4A4A4A] transition-opacity duration-150"
                  style={{ opacity: showReaction ? 1 : 0 }}
                >
                  {reactionText}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full min-w-0 flex shrink-0 flex-nowrap gap-1.5 overflow-x-auto scrollbar-hide">
            {quickPicks.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => applyChip(chip)}
                className="shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full border border-ih-border bg-[#FAFAFA] text-foreground hover:bg-ih-border/40 active:scale-[0.98] transition-colors whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="relative w-full min-w-0 shrink-0 rounded-md border border-ih-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus-within:ring-2 focus-within:ring-inset focus-within:ring-ih-accent/35">
            <textarea
              ref={goalTextareaRef}
              value={stationGoal}
              onChange={(e) => {
                const v = e.target.value
                setIrisGoalForStation(activeStation, v)
                if (activeStation === 'refine') {
                  updateRefine({ prompt: v.slice(0, 300) })
                }
              }}
              placeholder="Describe your goal or question…"
              rows={1}
              spellCheck
              className="w-full min-w-0 min-h-[3rem] border-0 bg-transparent text-[12px] leading-snug text-foreground placeholder:text-ih-muted/80 focus:outline-none focus:ring-0 rounded-md pl-2.5 pr-2.5 pt-2 pb-2.5 box-border resize-none break-words whitespace-pre-wrap"
            />
          </div>
        </div>
      )}
    </section>
  )
}
