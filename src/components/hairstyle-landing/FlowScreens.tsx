import { useNavigate } from 'react-router-dom'
import { Download, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TileCheck } from '@/components/try-it-on/ui'
import { useAllDone, useHairstyleLandingStore } from '@/store/hairstyle-landing-store'
import { LIST_PRICE, LOOK_FX, PRICE, SAMPLE_MSGS, catalogTile, styleNames } from './data'
import { Loader } from './SplashHero'
import { Body, Button, CTA, Display, Eyebrow, Photo, Serif } from './ui'
import { C, FONT, HC } from './tokens'

/**
 * The steps that run in the flow modal / sheet after an upload. Each one is a
 * plain column; FlowModal owns the surface, the header and the scrolling.
 */

export function StepHead({
  eyebrow,
  tone,
  title,
  body,
  align = 'center',
  page = false,
}: {
  /** A status line above the title ("Photo check failed", "Payment received"). Steps are not numbered. */
  eyebrow?: string
  tone?: 'error'
  title: React.ReactNode
  body?: React.ReactNode
  align?: 'center' | 'left'
  /** Full-page steps (offer, save) get the section-sized heading. */
  page?: boolean
}) {
  return (
    <div className={cn('flex flex-col', align === 'center' ? 'items-center text-center' : 'items-start text-left')}>
      {eyebrow && <Eyebrow tone={tone}>{eyebrow}</Eyebrow>}
      <Display size={page ? 'section' : 'step'} className={cn(eyebrow && 'mt-3', page ? 'max-w-[24ch]' : 'max-w-[22ch]')}>
        {title}
      </Display>
      {body && (
        <Body size={page ? 'lead' : 'base'} className="mt-3 max-w-[44ch]">
          {body}
        </Body>
      )}
    </div>
  )
}

// ── 02 · Generating the free style ───────────────────────────────────────────

export function Sampling() {
  const photo = useHairstyleLandingStore((s) => s.photo)
  const step = useHairstyleLandingStore((s) => s.sampleStep)
  return (
    <div data-screen-label="Generating free style" className="pb-2 text-center">
      <StepHead
        title={
          <>
            Making your free st<Serif>y</Serif>le
          </>
        }
        body="A few seconds. Nothing is charged."
      />
      {/* Same loader as the splash: veil, rainbow rim with travelling rays, drifting dot grid. */}
      <div className="relative mx-auto mt-9 w-[220px]">
        <div className="relative aspect-[348/446] overflow-hidden rounded-[12px] border border-white bg-[#E5E6E6] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)]">
          <Photo src={photo} filter="blur(9px)" />
        </div>
        <Loader style={{ left: '-3.448%', top: '-2.69%', width: '106.9%', height: '114.57%' }} />
      </div>
      <p className="mt-7 flex min-h-[1.4em] items-center justify-center gap-2 text-[16px] leading-[20px]" style={{ ...FONT, fontWeight: 450, color: C.text }} aria-live="polite">
        <Loader2 size={14} className="animate-spin" aria-hidden />
        {SAMPLE_MSGS[Math.min(step, SAMPLE_MSGS.length - 1)]}
      </p>
    </div>
  )
}

// ── 03 · Free style + the one offer ──────────────────────────────────────────

function Watermarked({ photo }: { photo: string | null }) {
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-[#E5E6E6]">
      <Photo src={photo} pos={LOOK_FX[0].pos} filter={LOOK_FX[0].filter} label="Your free style" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden>
        <div className="flex -rotate-[24deg] flex-col gap-7 opacity-45">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className="whitespace-nowrap text-[12px] uppercase tracking-[0.24em] text-white" style={{ ...FONT, fontWeight: 450 }}>
              Magic Studio sample · Magic Studio sample
            </span>
          ))}
        </div>
      </div>
      <span className="absolute left-3 top-3 rounded-[10px] bg-white/90 px-2.5 py-1.5 text-[12px] leading-[14px] backdrop-blur-md" style={{ ...FONT, fontWeight: 450, color: C.text }}>
        Your free style
      </span>
    </div>
  )
}

/** Every style in the set, all included: a preview, not a picker. */
function IncludedGrid({ className }: { className?: string }) {
  const { catalogKind, photo } = useHairstyleLandingStore()
  const names = styleNames(catalogKind)
  return (
    <div className={cn('scrollbar-hide overflow-y-auto overscroll-contain rounded-[16px] p-2.5', className)} style={{ background: C.grey03 }}>
      <div className="grid grid-cols-4 gap-x-2 gap-y-3 sm:grid-cols-5">
        {names.map((name, i) => {
          const owned = i === 0
          return (
            <div key={name} className="flex min-w-0 flex-col items-center gap-1.5">
              <span
                className="relative block aspect-square w-full overflow-hidden rounded-[10px] bg-white"
                style={{ boxShadow: owned ? `0 0 0 1.5px ${C.text}` : `0 0 0 1px ${HC.hairline}` }}
              >
                {owned ? (
                  <Photo src={photo} pos="center 22%" />
                ) : (
                  <img alt="" src={catalogTile(catalogKind, i)} className="absolute inset-0 size-full object-cover" loading="lazy" />
                )}
                <TileCheck on className="right-1 top-1" />
              </span>
              <span className="w-full truncate text-center text-[11px] leading-[14px]" style={{ ...FONT, fontWeight: 420, color: owned ? C.text : C.secondary }}>
                {owned ? 'Yours' : name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Offer({ onPick }: { onPick: () => void }) {
  const { photo, catalogKind, checkout } = useHairstyleLandingStore()
  const names = styleNames(catalogKind)
  const total = names.length
  return (
    <div data-screen-label="Free sample and offer">
      <StepHead
        page
        title={
          <>
            That&apos;s you. <span className="whitespace-nowrap">Thirty-nine</span> more to g<Serif>o</Serif>.
          </>
        }
        body="This one is real and it is free. It stays watermarked here and arrives clean with the rest."
      />

      {/* Desktop: the photo column sets the row's height; the right column is pinned to it, so the
          unlock button lines up with the bottom of the photo and the styles grid fills the space between. */}
      <div className="mx-auto mt-8 grid max-w-[1040px] gap-6 md:mt-12 md:grid-cols-[minmax(0,420px)_minmax(0,1fr)] md:gap-12">
        <div className="mx-auto w-full max-w-[420px]">
          <Watermarked photo={photo} />
          <div className="mt-3 flex items-center justify-between gap-3" style={FONT}>
            <span className="text-[14px] leading-[18px]" style={{ fontWeight: 450, color: C.text }}>
              {names[0]}
            </span>
            <button type="button" onClick={onPick} className="text-[13px] leading-[16px] underline underline-offset-[3px] transition-colors hover:text-[#000409]" style={{ fontWeight: 420, color: C.secondary }}>
              Different photo
            </button>
          </div>
        </div>

        <div className="flex flex-col md:relative">
          <div className="flex flex-col md:absolute md:inset-0">
          <IncludedGrid className="max-h-[400px] md:max-h-none md:min-h-0 md:flex-1" />

          <div className="mt-6 hidden shrink-0 md:block">
            <OfferCta total={total} onClick={checkout} />
          </div>
          </div>
        </div>
      </div>

      {/* Phones: docked to the bottom of the sheet, like the Figma CTA footer. */}
      <div className="sticky bottom-0 z-10 -mx-5 mt-6 bg-white px-5 pb-4 pt-3 shadow-[0_-10px_18px_-10px_rgba(0,4,9,0.14)] md:hidden">
        <OfferCta total={total} onClick={checkout} />
      </div>
    </div>
  )
}

/** "$20 $9": the list price struck through, then the offer price. */
function Price({ muted = 'rgba(255,255,255,0.55)' }: { muted?: string }) {
  return (
    <>
      <s className="mr-1.5 decoration-[1.5px]" style={{ color: muted, fontWeight: 420 }} aria-label={`was $${LIST_PRICE}`}>
        ${LIST_PRICE}
      </s>
      <span aria-label={`now $${PRICE}`}>${PRICE}</span>
    </>
  )
}

/** The unlock block: the button, then what is included (and that the tiles are models), read as one unit. */
function OfferCta({ total, onClick }: { total: number; onClick: () => void }) {
  return (
    <div className="flex flex-col gap-2.5" style={FONT}>
      <CTA onClick={onClick} className="max-w-none sm:w-full">
        Unlock all {total} · <Price />
      </CTA>
      {/* What is included and what the tiles show, in one line. */}
      <p className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-0.5 text-[13px] leading-[16px]">
        <span style={{ fontWeight: 450, color: C.text }}>All {total} styles included</span>
        <span style={{ fontWeight: 420, color: C.secondary }}>Catalog photos are of models, not you</span>
      </p>
    </div>
  )
}

// ── 03b · Payment ────────────────────────────────────────────────────────────

export function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.7H9v3.3h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5z" />
      <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.2-3.8H.8v2.3A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.8 10.7a5.4 5.4 0 0 1 0-3.4V5H.8a9 9 0 0 0 0 8l3-2.3z" />
      <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3L15 2.3A9 9 0 0 0 .8 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6z" />
    </svg>
  )
}

function AppleMark() {
  return (
    <svg width="14" height="17" viewBox="0 0 14 17" fill="currentColor" aria-hidden>
      <path d="M11.4 8.9c0-1.6 1.1-2.5 1.2-2.6-.7-1-1.7-1.1-2.1-1.1-1.1-.1-2 .6-2.5.6-.5 0-1.3-.6-2.2-.6C4.4 5.2 3.2 6 2.6 7.2c-1.3 2.3-.3 5.7 1 7.5.6.9 1.3 1.9 2.3 1.8.9 0 1.2-.6 2.3-.6s1.4.6 2.3.6c1 0 1.6-.9 2.2-1.8.4-.6.6-1 .8-1.6-2.1-.8-2.1-3.4-2.1-4.2zM9.5 3.6c.5-.6.8-1.4.7-2.3-.8 0-1.7.5-2.2 1.1-.5.6-.9 1.4-.7 2.2.9.1 1.8-.4 2.2-1z" />
    </svg>
  )
}

export function Pay() {
  const { photo, catalogKind, pay } = useHairstyleLandingStore()
  const total = styleNames(catalogKind).length
  return (
    <div data-screen-label="Payment">
      <StepHead
        eyebrow="Checkout"
        title={
          <>
            Unlock all {total} for <Price muted={HC.muted} />
          </>
        }
        body="Guest checkout. No account needed."
      />
      <div className="mt-7 flex items-center gap-3.5 rounded-[16px] border p-3" style={{ borderColor: HC.hairline, ...FONT }}>
        <div className="relative aspect-[4/5] w-12 shrink-0 overflow-hidden rounded-[8px] bg-[#E5E6E6]">
          <Photo src={photo} />
        </div>
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] leading-[20px]" style={{ fontWeight: 450, color: C.text }}>
            {total} hairstyle photos of you
          </span>
          <span className="mt-0.5 block text-[13px] leading-[16px]" style={{ fontWeight: 420, color: C.secondary }}>
            Includes your free style, clean
          </span>
        </span>
        <span className="shrink-0 text-[24px] leading-[26px] tracking-[-0.24px]" style={{ fontWeight: 450, color: C.text }}>
          <Price muted={HC.muted} />
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-2.5">
        <Button onClick={pay} icon={<AppleMark />} className="w-full">
          Pay ${PRICE} with Apple Pay
        </Button>
        <Button variant="secondary" onClick={pay} icon={<GoogleMark />} className="w-full">
          Google Pay
        </Button>
        <div className="flex gap-2.5">
          <Button variant="secondary" onClick={pay} className="flex-1">
            UPI
          </Button>
          <Button variant="secondary" onClick={pay} className="flex-1">
            Card
          </Button>
        </div>
      </div>
      <p className="mt-5 text-center text-[13px] leading-[19px]" style={{ ...FONT, fontWeight: 420, color: C.secondary }}>
        All {total} styles are generated after payment, one by one, in about two minutes. All purchases are final; no refunds.
      </p>
    </div>
  )
}

// ── 04 · Save or continue as guest ───────────────────────────────────────────

function GenerationBar() {
  const order = useHairstyleLandingStore((s) => s.order)
  const done = useHairstyleLandingStore((s) => s.tileState.filter((t) => t === 'done').length)
  const total = order.length
  const allDone = total > 0 && done >= total
  return (
    <div className="mx-auto mt-6 max-w-[420px]">
      <div className="h-1 overflow-hidden rounded-full" style={{ background: HC.stroke }}>
        <div className="h-full rounded-full transition-[width] duration-500" style={{ width: total ? `${Math.round((done / total) * 100)}%` : '0%', background: HC.rainbow }} />
      </div>
      <p className="mt-2.5 text-center text-[13px] leading-[16px]" style={{ ...FONT, fontWeight: 420, color: C.secondary }} aria-live="polite">
        {allDone ? 'Every style is ready' : `${done} of ${total} styles ready`}
      </p>
    </div>
  )
}

export function SaveScreen() {
  const { email, setEmail, save } = useHairstyleLandingStore()
  const emailOk = /.+@.+\..+/.test(email.trim())
  return (
    <div data-screen-label="Save or continue" className="mx-auto max-w-[860px]">
      <StepHead
        page
        eyebrow="Payment received"
        title={
          <>
            Where should your photos li<Serif>v</Serif>e?
          </>
        }
        body="Your styles are being generated while you choose. This does not hold anything up."
      />
      <GenerationBar />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 md:mt-12 md:gap-4">
        <div className="flex flex-col rounded-[20px] bg-white p-5" style={{ boxShadow: `inset 0 0 0 1.5px ${C.text}`, ...FONT }}>
          <p className="text-[18px] leading-[22px]" style={{ fontWeight: 450, color: C.text }}>
            Create a free account
          </p>
          <p className="mt-2 text-[14px] leading-[19px]" style={{ fontWeight: 420, color: C.secondary }}>
            Photos saved to your profile, on any device. One tap to log in later.
          </p>
          <div className="mt-auto flex flex-col gap-2.5 pt-5">
            <Button variant="secondary" size="md" onClick={() => save('account')} icon={<GoogleMark />}>
              Continue with Google
            </Button>
            <Button variant="secondary" size="md" onClick={() => save('account')}>
              Sign up with email
            </Button>
          </div>
        </div>

        <form
          className="flex flex-col rounded-[20px] p-5"
          style={{ background: C.grey03, ...FONT }}
          onSubmit={(e) => {
            e.preventDefault()
            if (emailOk) save('guest')
          }}
        >
          <p className="text-[18px] leading-[22px]" style={{ fontWeight: 450, color: C.text }}>
            Continue as guest
          </p>
          <p className="mt-2 text-[14px] leading-[19px]" style={{ fontWeight: 420, color: C.secondary }}>
            We email you a link to your photos so they are never lost.
          </p>
          <label className="sr-only" htmlFor="hl-email">
            Email
          </label>
          <input
            id="hl-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
            className="mt-5 h-12 w-full rounded-[12px] border bg-white px-4 text-[16px] leading-[18px] outline-none transition-[border-color] focus:border-[#000409]"
            style={{ borderColor: HC.stroke, color: C.text, fontWeight: 420 }}
          />
          <Button type="submit" size="md" disabled={!emailOk} className="mt-2.5 w-full">
            Email me the link
          </Button>
          <p className="mt-2.5 min-h-[1.2em] text-[12.5px] leading-[16px]" style={{ fontWeight: 420, color: C.secondary }}>
            {emailOk ? 'We send the link the moment the set is done.' : 'We need an email so the photos are never lost.'}
          </p>
        </form>
      </div>
    </div>
  )
}

// ── Gallery ──────────────────────────────────────────────────────────────────

function fileName(n: string) {
  return 'magic-studio-' + n.toLowerCase().replace(/\s+/g, '-') + '.png'
}

export function Gallery() {
  const navigate = useNavigate()
  const s = useHairstyleLandingStore()
  const allDone = useAllDone()
  const names = styleNames(s.catalogKind)
  const total = s.order.length
  const done = s.tileState.filter((t) => t === 'done').length

  const downloadAll = () => {
    if (!allDone || !s.photo) return
    s.order.forEach((idx, pos) =>
      setTimeout(() => {
        const a = document.createElement('a')
        a.href = s.photo!
        a.download = fileName(names[idx])
        document.body.appendChild(a)
        a.click()
        a.remove()
      }, pos * 140),
    )
    s.markDownloadedAll()
  }

  const note = allDone
    ? s.savedAs === 'account'
      ? 'Saved to your profile. Download any style, or take the whole set.'
      : `Sent to ${s.email.trim()}. Download any style, or take the whole set.`
    : 'Styles are landing one by one. You can download the finished ones already.'

  return (
    <div data-screen-label="Gallery">
      <div className="flex flex-col items-center text-center">
        <Eyebrow>{allDone ? 'Unlocked · full quality' : `Unlocking · ${done} of ${total}`}</Eyebrow>
        <Display as="h1" className="mt-3">
          Forty versions of y<Serif>o</Serif>u
        </Display>
        <Body size="base" className="mt-3 max-w-[44ch]">
          {note}
        </Body>
        <Button onClick={downloadAll} disabled={!allDone} size="md" className="mt-5" icon={allDone ? <Download size={16} strokeWidth={1.6} aria-hidden /> : undefined}>
          {!allDone ? 'Download all when ready' : s.downloadedAll ? 'All downloaded' : `Download all ${total}`}
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:mt-12 md:grid-cols-4 md:gap-4 xl:grid-cols-5">
        {s.order.map((idx, pos) => {
          const fx = LOOK_FX[(idx + (s.tileShift[idx] ?? 0)) % LOOK_FX.length]
          const st = s.tileState[pos] ?? 'queued'
          const isDone = st === 'done'
          return (
            <figure key={`${idx}-${pos}`} className="flex min-w-0 flex-col">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] bg-[#E5E6E6]">
                <Photo src={s.photo} pos={fx.pos} filter={isDone ? fx.filter : `${fx.filter} blur(11px) saturate(.85)`} className="transition-[filter] duration-500" />
                {isDone && (
                  <a
                    href={s.photo ?? '#'}
                    download={fileName(names[idx])}
                    aria-label={`Download ${names[idx]}`}
                    className="absolute bottom-2 right-2 inline-flex size-9 items-center justify-center rounded-[10px] bg-white/90 backdrop-blur-md transition-colors hover:bg-white"
                    style={{ color: C.text }}
                  >
                    <Download size={15} strokeWidth={1.8} aria-hidden />
                  </a>
                )}
              </div>
              <figcaption className="mt-2 truncate text-[13px] leading-[16px]" style={{ ...FONT, fontWeight: 450, color: isDone ? C.text : C.secondary }}>
                {names[idx]}
              </figcaption>
            </figure>
          )
        })}
      </div>

      {/* Upsell, in the footer's dark-with-rainbow language */}
      <div className="relative mt-12 overflow-hidden rounded-[24px] p-6 md:mt-16 md:rounded-[32px] md:p-12" style={{ background: HC.cta }}>
        <div aria-hidden className="pointer-events-none absolute -bottom-[40px] left-[10%] right-[10%] h-20 rounded-full opacity-50 blur-[30px]" style={{ background: HC.rainbow }} />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-[560px]">
            <Display size="section" light>
              Loved these? Get the full photosh<Serif>o</Serif>ot.
            </Display>
            <Body size="base" light className="mt-3">
              A trained model of your face generates 50 professional, social and dating photos. Free to preview.
            </Body>
          </div>
          <CTA tone="light" onClick={() => navigate('/create-profile')}>
            Preview for free
          </CTA>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 pb-2" style={FONT}>
        <span className="text-[14px] leading-[18px]" style={{ fontWeight: 420, color: C.secondary }}>
          {s.regenLeft > 0 ? 'Not satisfied with the results?' : 'No redos left. These photos are yours to keep.'}
        </span>
        {s.regenLeft > 0 && (
          <button type="button" onClick={s.redoSet} className="text-[14px] leading-[18px] underline underline-offset-[3px] transition-colors hover:text-[#12844D]" style={{ fontWeight: 450, color: C.text }}>
            Redo the set ({s.regenLeft} left)
          </button>
        )}
      </div>
    </div>
  )
}
