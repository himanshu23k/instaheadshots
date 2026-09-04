/**
 * /create-profile — Figma "🍓 Redesign" 6607:9587.
 *
 * One form, two layouts. Below 1280px it is the mobile frame (6580:5102): the
 * style options are cards that carry their own photo strip, and the selected
 * one marquees. At 1280px and up it is the desktop frame (6453:4694): the style
 * options collapse to plain radios and the photos move out to the showcase
 * panel, which morphs from a shuffling deck into a grid of examples.
 */
import { ArrowLeft, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCreateProfileStore } from '@/store/create-profile-store'
import {
  ChoiceButton,
  FieldHeader,
  NameInput,
  PrimaryCta,
  RadioDial,
} from './CreateProfileFields'
import { GENDER_OPTIONS, STYLE_OPTIONS } from './create-profile-data'
import { HeadshotShowcase } from './HeadshotShowcase'
import { MobileStyleCard } from './MobileStyleCard'

const HEADING = 'Who are you creating this profile for?'
const NAME_HINT = 'This name will appear on the profile'
const GENDER_HINT = 'This helps us recommend the most suitable looks.'
const STYLE_HINT = 'The headshots will be created in the style chosen'

function TopBar({ className = '' }: { className?: string }) {
  const navigate = useNavigate()
  return (
    <div className={`flex h-15 w-full items-center justify-between ${className}`}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Go back"
        className="flex items-center justify-center rounded-md p-2 transition-opacity hover:opacity-70"
        style={{ color: 'var(--color-button-icon-black)' }}
      >
        <ArrowLeft size={24} strokeWidth={1.5} />
      </button>
      <button
        type="button"
        aria-label="Open menu"
        className="flex items-center justify-center rounded-md p-2 transition-opacity hover:opacity-70"
        style={{ color: 'var(--color-button-icon-black)' }}
      >
        <Menu size={24} strokeWidth={1.5} />
      </button>
    </div>
  )
}

export function CreateProfilePage() {
  const navigate = useNavigate()
  const { name, gender, style, setName, setGender, setStyle } = useCreateProfileStore()
  const canContinue = name.trim().length > 0 && gender !== null && style !== null

  const handleContinue = () => {
    if (!canContinue) return
    // The upload step does not exist as a route yet; the profile is held in the
    // store so whatever screen picks it up next can read it.
    navigate('/home')
  }

  const genderField = (
    <div className="flex w-full flex-col gap-6">
      <FieldHeader title="Gender" hint={GENDER_HINT} />
      <div role="radiogroup" aria-label="Gender" className="flex w-full flex-wrap items-center gap-3">
        {GENDER_OPTIONS.map((g) => (
          <ChoiceButton
            key={g.id}
            label={g.label}
            selected={gender === g.id}
            onSelect={() => setGender(g.id)}
            icon={<RadioDial checked={gender === g.id} />}
          />
        ))}
      </div>
    </div>
  )

  const nameField = (
    <div className="flex w-full flex-col gap-6">
      <FieldHeader title="Name" hint={NAME_HINT} htmlFor="create-profile-name" />
      <NameInput value={name} onChange={setName} />
    </div>
  )

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden bg-white web:bg-[#F7F7F8] web:px-6 web:pb-6"
      style={{ fontFamily: 'var(--font-greed)' }}
    >
      <div className="flex min-h-0 w-full flex-1 flex-col web:mx-auto web:max-w-[1280px] web:min-w-[744px]">
        {/* ── Header ───────────────────────────────────────────────── */}
        <TopBar className="shrink-0 px-4 web:h-16 web:px-0" />

        {/* ── Main ─────────────────────────────────────────────────── */}
        <div className="flex min-h-0 w-full flex-1 items-center gap-6">
          {/* Form column — the full page on mobile, a white card on desktop */}
          <div className="relative flex h-full min-h-0 w-full flex-col web:w-[612px] web:shrink-0 web:overflow-hidden web:rounded-xl web:bg-white">
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-28 web:p-6 web:pb-24">
              {/* Below 1280px the Figma frame is 390 wide; cap it so tablets
                  centre the form instead of stretching every field. */}
              <div className="mx-auto flex w-full max-w-[480px] flex-col web:max-w-none">
                <div className="flex w-full flex-col gap-10">
                  <h1
                    className="max-w-[302px] text-[24px] leading-[26px] tracking-[-0.288px] web:max-w-none web:text-[26px] web:leading-7 web:tracking-[-0.312px]"
                    style={{ fontWeight: 450, color: 'var(--color-text-primary)' }}
                  >
                    {HEADING}
                  </h1>

                  {nameField}
                  {genderField}
                </div>

                {/* Style — cards below 1280px, radios at 1280px and up.
                    Figma sets this gap to 24 on mobile but 40 on web. */}
                <div className="mt-6 flex w-full flex-col gap-6 web:mt-10">
                  <FieldHeader title="What kind of photos would you like?" hint={STYLE_HINT} />

                  <div
                    role="radiogroup"
                    aria-label="What kind of photos would you like?"
                    className="flex w-full flex-col gap-3 web:hidden"
                  >
                    {STYLE_OPTIONS.map((o) => (
                      <MobileStyleCard
                        key={o.id}
                        option={o}
                        gender={gender}
                        selected={style === o.id}
                        onSelect={() => setStyle(o.id)}
                      />
                    ))}
                  </div>

                  <div
                    role="radiogroup"
                    aria-label="What kind of photos would you like?"
                    className="hidden w-full flex-wrap items-center gap-3 web:flex"
                  >
                    {STYLE_OPTIONS.map((o) => (
                      <ChoiceButton
                        key={o.id}
                        label={o.label}
                        selected={style === o.id}
                        onSelect={() => setStyle(o.id)}
                        icon={<RadioDial checked={style === o.id} />}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA docker — full-bleed on mobile, docked in the card on desktop */}
            <div
              className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-white px-6 py-3 web:justify-end"
              style={{ filter: 'drop-shadow(0px -2px 6px rgba(0,0,0,0.06))' }}
            >
              {/* Below 1280px the CTA is full-bleed like the mobile frame, but
                  capped to the same column the fields sit in. */}
              <PrimaryCta
                disabled={!canContinue}
                onClick={handleContinue}
                className="w-full max-w-[480px] web:w-auto web:max-w-none"
              >
                Upload Photos
              </PrimaryCta>
            </div>
          </div>

          {/* Showcase column — desktop only */}
          <div className="hidden h-full min-w-0 flex-1 web:block">
            <HeadshotShowcase gender={gender} style={style} />
          </div>
        </div>
      </div>
    </div>
  )
}
