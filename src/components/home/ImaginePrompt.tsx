import { useEffect, useRef, useState } from 'react'
import { Sparkles, Plus, Dices } from 'lucide-react'

const MAX_LEN = 500

const SUGGESTIONS = [
  'Founder shot in a sunlit boardroom',
  'Editorial portrait, dramatic side light',
  'LinkedIn-ready, navy suit, cream background',
  'Cinematic close-up, golden hour',
  'Fashion editorial, bold red wall',
  'Studio black and white, intense gaze',
  'Outdoor coffee shop, casual smile',
  'Power pose against floor-to-ceiling windows',
  'Magazine cover energy, soft shadows',
  'Tech entrepreneur, hoodie, garage backdrop',
  'Sunset rooftop, warm city lights',
  'Minimal white studio, cotton tee, gentle smile',
]

/**
 * Primary CTA — Figma "Button — All components".
 *   Default: pushed-in (translated +4/+4, no walls).
 *   Hover/focus: lifted out (translate 0, 3D embossed walls appear via .btn-3d-emboss).
 */
const PRIMARY_BTN =
  'btn-3d-emboss h-[44px] px-[24px] py-[10px] inline-flex items-center justify-center gap-2 ' +
  'bg-button-primary-default text-text-white ' +
  'translate-x-[4px] translate-y-[4px] ' +
  'hover:translate-x-0 hover:translate-y-0 ' +
  'active:translate-x-[4px] active:translate-y-[4px] ' +
  'transition-transform duration-150 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-highlight focus-visible:ring-offset-2'

/**
 * Ghost icon helper — light bounding box, slight opacity dim on hover. 44×44 per WCAG 2.5.5.
 * translate-y-[4px] matches the CTA's pushed-in default so visual bottoms align in rest state.
 */
const GHOST_ICON_BTN =
  'h-11 w-11 inline-flex items-center justify-center text-text-body border border-border-primary ' +
  'translate-y-[4px] ' +
  'hover:opacity-70 transition-opacity duration-150 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-highlight'

export function ImaginePrompt() {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSubmit = value.trim().length > 0

  // Auto-grow: reset to auto so scrollHeight reflects content, then snap.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  const submit = () => {
    if (!canSubmit) return
    console.log('[home] imagine submit:', value)
    setValue('')
  }

  const randomize = () => {
    let next = SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)]
    while (next === value && SUGGESTIONS.length > 1) {
      next = SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)]
    }
    setValue(next.slice(0, MAX_LEN))
  }

  return (
    <div
      className="w-full bg-bg-section border border-border-primary p-3 md:p-4 flex flex-col gap-2"
      style={{ boxShadow: 'var(--shadow-04)' }}
    >
      <div className="flex items-start gap-3 px-1 pt-1">
        <Sparkles className="w-5 h-5 mt-1 shrink-0 text-text-highlight" />
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, MAX_LEN))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          placeholder="Picture anything…"
          aria-label="Imagine prompt"
          maxLength={MAX_LEN}
          rows={2}
          className="flex-1 body-l md:text-18 md:leading-22 text-text-body placeholder:text-text-secondary bg-transparent outline-none border-0 resize-none py-1 min-h-[44px] max-h-[240px] overflow-y-auto"
        />
      </div>

      <div className="flex items-end justify-between gap-3 pt-1 pb-2 pl-1 pr-2">
        <button
          type="button"
          aria-label="Attach files"
          onClick={() => console.log('[home] attach')}
          className={GHOST_ICON_BTN}
        >
          <Plus className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Surprise me with a prompt"
            onClick={randomize}
            className={GHOST_ICON_BTN}
          >
            <Dices className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={submit}
            className={PRIMARY_BTN}
          >
            <img
              src="/credit.svg"
              alt=""
              aria-hidden
              className="w-[18px] h-[18px] shrink-0"
            />
            <span className="text-16 font-normal leading-22 whitespace-nowrap">
              <span className="tabular-nums">1</span>
              <span className="mx-1.5 opacity-50">|</span>
              <span>Imagine</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
