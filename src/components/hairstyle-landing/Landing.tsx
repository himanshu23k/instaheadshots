import { forwardRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Gift, Plus, Trash2, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CHECK_OUTCOME, useHairstyleLandingStore } from '@/store/hairstyle-landing-store'
import { BRAND, FAQ, LOOKBOOK, PROMISES, SPLASH_MOTION, STEPS, STEP_PHOTOS, type SplashGender } from './data'
import { Reviews } from './Reviews'
import { SplashHero } from './SplashHero'
import { Body, CTA, Container, Display, MagicStudioLogo, Photo, Serif } from './ui'
import { C, EASE_PRESS, FONT, HC, SERIF } from './tokens'

const PROTOTYPE_NOTE: Record<typeof CHECK_OUTCOME, string> = {
  'fail-first': 'Prototype: your first photo fails the lighting check so you can see that state. The next one passes.',
  auto: 'Prototype: photos under 500 pixels fail the quality check.',
  pass: 'Prototype: every photo passes the check.',
  fail: 'Prototype: every photo fails the check.',
}

const UPLOAD_LABEL = 'Upload your photo · First style free'

// ── Hero ────────────────────────────────────────────────────────────────────

/** magicstudio.com's "Hannah's photos" pill, turned into the Women / Men switch. */
function WhosePhoto({ value, onChange }: { value: SplashGender; onChange: (g: SplashGender) => void }) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div
        role="radiogroup"
        aria-label="Show styles for"
        className="flex items-center gap-1.5 rounded-[18px] bg-white p-1.5 shadow-[0_2px_18px_rgba(0,4,9,0.08)]"
      >
        {(['women', 'men'] as const).map((g) => {
          const on = value === g
          return (
            <button
              key={g}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={g === 'women' ? "Women's styles" : "Men's styles"}
              onClick={() => onChange(g)}
              className="relative size-[56px] rounded-[12px] transition-transform active:scale-[0.95]"
              style={{ transitionTimingFunction: EASE_PRESS }}
            >
              {on && (
                <motion.span
                  layoutId="whose-glow"
                  className="absolute -inset-[3px] rounded-[15px] opacity-90 blur-[5px]"
                  style={{ background: HC.rainbow }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span
                className={cn('absolute inset-0 overflow-hidden rounded-[12px] transition-[filter,opacity] duration-300', !on && 'opacity-80 grayscale-[35%]')}
              >
                <Photo src={SPLASH_MOTION[g].models.base} pos="center 20%" />
              </span>
            </button>
          )
        })}
      </div>
      <p className="text-[14px] leading-[16px]" style={{ ...FONT, fontWeight: 420, color: HC.muted }}>
        <span style={{ color: C.text }}>{value === 'women' ? 'Her' : 'His'}</span> photo · tap to switch
      </p>
    </div>
  )
}

function Hero({ onPick }: { onPick: () => void }) {
  // Page-wide: the switch below sets whose photos every section shows.
  const gender = useHairstyleLandingStore((s) => s.look)
  const setGender = useHairstyleLandingStore((s) => s.setLook)
  return (
    <section className="overflow-x-clip pt-6 text-center md:pt-12">
      {/* Headline, CTA and switch all stack over the hearts and glows that spill out of the animation below. */}
      <Container className="relative z-20">
        <Display as="h1" size="hero" className="mx-auto max-w-[16ch] md:max-w-none">
          See yourself in <br className="md:hidden" />
          any hairst<Serif>y</Serif>le
        </Display>
        <Body className="mx-auto mt-4 max-w-[34ch] md:mt-3 md:max-w-none">
          Upload one photo. We generate you in the styles you have been wondering about, starting with one for free.
        </Body>
        <div className="mt-6 flex flex-col items-center gap-3">
          <CTA onClick={onPick}>{UPLOAD_LABEL}</CTA>
          <p className="text-[14px] leading-[16px]" style={{ ...FONT, fontWeight: 420, color: HC.muted }}>
            No account needed to see your free style.
          </p>
        </div>
      </Container>

      {/* The switch sits above the animation it controls. */}
      <div className="relative z-20 mt-8 md:mt-[40px]">
        <WhosePhoto value={gender} onChange={setGender} />
      </div>

      <div className="mx-auto mt-4 w-full max-w-[440px] px-5 md:mt-6 md:px-0">
        {/* Keyed so a new set restarts from the original photo. */}
        <SplashHero key={gender} gender={gender} />
      </div>
    </section>
  )
}

// ── How it works: full-bleed sky, white type, polaroids on a line ────────────

const PIN_TILT = [-5, 3, -3]

function Polaroid({ src, tilt, i }: { src: string; tilt: number; i: number }) {
  return (
    <motion.figure
      className="relative w-[150px] sm:w-[200px] md:w-[230px]"
      style={{ rotate: tilt, transformOrigin: '50% 0%' }}
      initial={{ rotate: tilt - 6, y: -12, opacity: 0 }}
      whileInView={{ rotate: tilt, y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        type: 'spring',
        stiffness: 120,
        damping: 9,
        delay: i * 0.12,
      }}
    >
      {/* clothes peg */}
      <span
        className="absolute -top-[22px] left-1/2 z-10 h-[38px] w-[12px] -translate-x-1/2 rounded-[3px] shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
        style={{
          background: 'linear-gradient(90deg, #E9E1D2, #FBF7EF 45%, #DCD2C1)',
        }}
        aria-hidden
      />
      <div className="rounded-[4px] bg-[#F7F5EF] p-[10px] pb-[42px] shadow-[0_14px_30px_rgba(0,30,50,0.35)] sm:p-3 sm:pb-[52px]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-[#E5E6E6]">
          <AnimatePresence initial={false}>
            <motion.div
              key={src}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Photo src={src} pos="center 18%" />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.figure>
  )
}

const HowItWorks = forwardRef<HTMLElement>(function HowItWorks(_, ref) {
  const look = useHairstyleLandingStore((s) => s.look)
  return (
    <section ref={ref} className="relative mt-20 scroll-mt-0 overflow-hidden md:mt-[120px]" style={{ background: HC.sky }}>
      {/* soft cloud bank along the bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]"
        style={{
          background:
            'radial-gradient(40% 50% at 18% 100%, rgba(255,255,255,0.75), transparent 70%), radial-gradient(34% 45% at 62% 108%, rgba(255,255,255,0.7), transparent 70%), radial-gradient(30% 40% at 92% 96%, rgba(255,255,255,0.55), transparent 72%)',
          filter: 'blur(12px)',
        }}
      />
      <Container className="relative pb-16 pt-[56px] md:pb-24 md:pt-[72px]">
        <Display size="xl" light className="text-center">
          how it wo<Serif>r</Serif>ks
        </Display>
        <ol className="mt-[40px] grid gap-8 md:mt-[56px] md:grid-cols-3 md:gap-[40px]">
          {STEPS.map((s) => (
            <li key={s.n}>
              <span className="block text-[32px] leading-[36px] text-white" style={{ fontFamily: SERIF, fontStyle: 'italic' }}>
                {s.n}
              </span>
              <h3
                className="mt-3 text-[22px] leading-[26px] tracking-[-0.22px] text-white md:text-[26px] md:leading-[30px] md:tracking-[-0.26px]"
                style={{ ...FONT, fontWeight: 420 }}
              >
                {s.title}
              </h3>
              <p
                className="mt-3 max-w-[36ch] text-[16px] leading-[20px]"
                style={{
                  ...FONT,
                  fontWeight: 420,
                  color: 'rgba(255,255,255,0.82)',
                }}
              >
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </Container>

      {/* the line */}
      <div className="relative h-[300px] sm:h-[360px] md:h-[400px]">
        <svg className="absolute inset-x-0 top-6 h-[90px] w-full" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden>
          <path d="M-20 70 C 420 18, 1000 8, 1460 30" stroke="#E2672C" strokeWidth="3" fill="none" />
        </svg>
        <div className="absolute inset-x-0 top-[52px] flex items-start justify-center gap-3 sm:gap-6 md:top-[44px] md:gap-[40px]">
          {STEP_PHOTOS[look].map((src, i) => (
            <div key={i} style={{ marginTop: [8, 0, -8][i] }}>
              <Polaroid src={src} tilt={PIN_TILT[i]} i={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

// ── Same face, forty looks ──────────────────────────────────────────────────

function Lookbook({ onPick }: { onPick: () => void }) {
  // Follows the hero's Her / His switch.
  const gender = useHairstyleLandingStore((s) => s.look)
  return (
    <section className="pt-20 md:pt-[120px]">
      <Container>
        <Display className="text-center">
          Same face, forty lo<Serif>o</Serif>ks
        </Display>
        <div className="mx-auto mt-8 grid max-w-[1040px] grid-cols-3 gap-2.5 md:mt-[40px] md:gap-4">
          {LOOKBOOK[gender].map((l, i) => (
            <figure key={l.name} className="relative aspect-[4/5] overflow-hidden rounded-[16px] bg-[#E5E6E6] md:rounded-[30px]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={l.photo}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.55,
                    delay: i * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Photo src={l.photo} pos="center 18%" label={l.name} />
                </motion.div>
              </AnimatePresence>
              <figcaption
                className="absolute bottom-2 left-2 rounded-[10px] px-2.5 py-1.5 text-[12px] leading-[14px] backdrop-blur-md md:bottom-4 md:left-4 md:rounded-[12px] md:px-3.5 md:py-2 md:text-[14px] md:leading-[16px]"
                style={{
                  ...FONT,
                  fontWeight: 450,
                  background: l.before ? 'rgba(255,255,255,0.86)' : 'rgba(19,19,19,0.72)',
                  color: l.before ? C.text : '#fff',
                }}
              >
                {l.name}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-6 flex justify-center md:mt-8">
          <CTA onClick={onPick}>{UPLOAD_LABEL}</CTA>
        </div>
      </Container>
    </section>
  )
}

// ── Your photo is yours ─────────────────────────────────────────────────────

const PROMISE_ICON = { gift: Gift, user: UserRound, trash: Trash2 }

function Promises({ onPick }: { onPick: () => void }) {
  return (
    <section className="relative z-10 pt-20 text-center md:pt-[120px]">
      <Container>
        <Display>
          Your photo is yo<Serif>u</Serif>rs
        </Display>
        <Body className="mx-auto mt-3 max-w-[40ch]">Try it free, keep it private, and pay only if you love it.</Body>
        <div className="mt-6 flex justify-center">
          <CTA onClick={onPick}>{UPLOAD_LABEL}</CTA>
        </div>
        <div className="mx-auto mt-[40px] grid max-w-[1280px] gap-3 text-left md:mt-12 md:grid-cols-3 md:gap-4">
          {PROMISES.map((p) => {
            const Icon = PROMISE_ICON[p.icon]
            return (
              <div key={p.title} className="rounded-[24px] border p-6 md:p-7" style={{ background: p.tint, borderColor: HC.hairline }}>
                <span className="relative flex size-[60px] items-center justify-center rounded-full" aria-hidden>
                  <span className="absolute inset-0 rounded-full opacity-70 blur-[6px]" style={{ background: HC.rainbow }} />
                  <span className="relative flex size-[56px] items-center justify-center rounded-full bg-white">
                    <Icon size={22} strokeWidth={1.6} color={C.text} />
                  </span>
                </span>
                <h3 className="mt-6 text-[22px] leading-[26px] tracking-[-0.22px]" style={{ ...FONT, fontWeight: 420, color: C.text }}>
                  {p.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-[20px]" style={{ ...FONT, fontWeight: 420, color: C.secondary }}>
                  {p.body}
                </p>
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

// ── FAQ: heading left, questions right ──────────────────────────────────────

function Faq() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="pb-24 pt-20 md:pb-[120px] md:pt-[120px]">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
          <Display className="lg:sticky lg:top-8 lg:self-start">
            Your questions,
            <br />
            <Serif>a</Serif>nswered.
          </Display>
          <div>
            {FAQ.map((f, i) => {
              const on = open === i
              return (
                <div key={f.q} className="border-b" style={{ borderColor: HC.hairline }}>
                  <button
                    type="button"
                    onClick={() => setOpen(on ? null : i)}
                    aria-expanded={on}
                    className="flex w-full items-center gap-4 py-6 text-left md:gap-5"
                    style={FONT}
                  >
                    <span className="w-6 shrink-0 text-[11px] leading-[14px]" style={{ fontWeight: 450, color: C.secondary }}>
                      Q{i + 1}
                    </span>
                    <span className="flex-1 text-[17px] leading-[22px] md:text-[18px] md:leading-[24px]" style={{ fontWeight: 420, color: C.text }}>
                      {f.q}
                    </span>
                    <motion.span
                      animate={{ rotate: on ? 45 : 0 }}
                      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                      className="flex size-6 shrink-0 items-center justify-center"
                    >
                      <Plus size={18} strokeWidth={1.5} color={C.text} aria-hidden />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        className="overflow-hidden"
                      >
                        <p
                          className="max-w-[60ch] pb-6 pl-[40px] text-[16px] leading-[22px] md:pl-11"
                          style={{
                            ...FONT,
                            fontWeight: 420,
                            color: C.secondary,
                          }}
                        >
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </Container>
    </section>
  )
}

// ── Footer: dark, the giant wordmark under a rainbow glow ───────────────────

/**
 * `wordmarkOnly` is for the result pages (offer through gallery): just the
 * dark band with the giant wordmark and its glow, no logo, CTA or links.
 */
export function Footer({ onPick, wordmarkOnly = false }: { onPick?: () => void; wordmarkOnly?: boolean }) {
  return (
    <footer className={cn('relative -mt-[40px] overflow-hidden pt-[40px]', wordmarkOnly && 'pb-8 md:pb-12')} style={{ background: HC.dark, ...FONT }}>
      <div className="relative">
        <img
          src={BRAND.footerGlow}
          alt=""
          className="pointer-events-none absolute left-1/2 top-[-30%] w-[150%] max-w-none -translate-x-1/2 opacity-90 md:w-[128%]"
          aria-hidden
        />
        <img src={BRAND.signage} alt="Magic Studio" className="relative mx-auto block w-[104%] max-w-none -translate-x-[2%] opacity-90" />
      </div>
      {!wordmarkOnly && (
        <Container className="relative pb-8 pt-[40px] md:pb-12 md:pt-16">
          <div className="grid gap-[40px] md:grid-cols-[1fr_auto] md:items-end">
            <div className="flex flex-col items-start gap-6">
              <img src={BRAND.logoMark3d} alt="" width={96} height={96} className="size-20 md:size-24" aria-hidden />
              {onPick && (
                <CTA tone="light" onClick={onPick} className="sm:w-auto">
                  {UPLOAD_LABEL}
                </CTA>
              )}
            </div>
            <div className="flex flex-wrap gap-12 md:gap-16">
              {[
                {
                  title: 'Product',
                  links: ['Hairstyle try-on', 'Full photoshoot', 'Try on outfits'],
                },
                {
                  title: 'Company',
                  links: ['Blog', 'Privacy Policy', 'Terms of Service'],
                },
              ].map((col) => (
                <div key={col.title} className="flex flex-col gap-3">
                  <span className="text-[11px] uppercase leading-[14px] tracking-[0.88px]" style={{ fontWeight: 450, color: 'rgba(255,255,255,0.9)' }}>
                    {col.title}
                  </span>
                  {col.links.map((l) => (
                    <a key={l} href="#" className="text-[14px] leading-[18px] text-white/55 transition-colors hover:text-white" style={{ fontWeight: 420 }}>
                      {l}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div
            className="mt-12 flex flex-col gap-2 border-t pt-6 text-[12px] leading-[16px] md:flex-row md:items-center md:justify-between"
            style={{
              borderColor: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.4)',
              fontWeight: 420,
            }}
          >
            <span className="flex items-center gap-3">
              <MagicStudioLogo tone="light" height={28} />
              <span>© 2026 Magic Studio</span>
            </span>
            <span>{PROTOTYPE_NOTE[CHECK_OUTCOME]}</span>
          </div>
        </Container>
      )}
    </footer>
  )
}

export function Landing({ onPick, howRef }: { onPick: () => void; howRef: React.Ref<HTMLElement> }) {
  return (
    <>
      {/* White page with rounded bottom corners sitting over the dark footer, like magicstudio.com. */}
      <div className="relative z-10 rounded-b-[32px] bg-white md:rounded-b-[48px]" data-screen-label="Landing">
        <Hero onPick={onPick} />
        <HowItWorks ref={howRef} />
        <Lookbook onPick={onPick} />
        <Reviews />
        <Promises onPick={onPick} />
        <Faq />
      </div>
      <Footer onPick={onPick} />
    </>
  )
}
