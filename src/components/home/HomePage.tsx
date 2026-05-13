import { ImaginePrompt } from './ImaginePrompt'
import { LooksCarousel } from './LooksCarousel'
import { Wall } from './Wall'
import { DiscoverCarousel } from './DiscoverCarousel'
import { DriftingFaces } from './DriftingFaces'
import { Dock } from './dock/Dock'

const FACES = Array.from(
  { length: 12 },
  (_, i) => `/mock/faces/face-${String(i + 1).padStart(2, '0')}.jpg`,
)

const PLACEHOLDER_PHOTOS = FACES

export function HomePage() {
  return (
    <div className="min-h-screen bg-bg-section">
      {/* ── Hero zone — dark backdrop, drifting faces, fade to white ── */}
      <section className="relative overflow-hidden bg-button-primary-default">
        {/* Drifting headshot rows — two layers for parallax feel */}
        <div aria-hidden className="absolute inset-0 flex flex-col justify-center gap-6 md:gap-10 pointer-events-none">
          <DriftingFaces
            direction="left"
            duration="80s"
            tileHeight="h-28 md:h-40"
            opacity={0.55}
            blur="0.5px"
          />
          <DriftingFaces
            direction="right"
            duration="110s"
            tileHeight="h-32 md:h-48"
            opacity={0.45}
            blur="1px"
          />
        </div>

        {/* Side vignette to focus the eye toward center */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 80% at center, transparent 30%, rgba(1,17,36,0.55) 100%)',
          }}
        />

        {/* Bottom fade to white — meets the page background */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.85) 70%, var(--color-bg-section) 100%)',
          }}
        />

        {/* Foreground: header + imagine prompt */}
        <div className="relative z-10 mx-auto w-full max-w-[1080px] px-5 md:px-8 lg:px-10 pt-5 md:pt-8 pb-16 md:pb-24">
          <header className="flex items-center justify-between gap-3">
            <a
              href="/home"
              aria-label="InstaHeadshots — home"
              className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-highlight"
            >
              <img
                src="/logo-horizontal.svg"
                alt="InstaHeadshots"
                className="h-6 md:h-7 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </a>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => console.log('[home] open plan picker')}
                aria-label="18 credits — open plan picker"
                className="flex items-center gap-1.5 h-9 pl-2 pr-3 bg-text-white/10 border border-text-white/25 text-text-white hover:bg-text-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-highlight"
                style={{
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                <img
                  src="/credit.svg"
                  alt=""
                  aria-hidden
                  className="w-[18px] h-[18px] shrink-0"
                />
                <span className="body-s tabular-nums">18</span>
              </button>
              <img
                src={FACES[0]}
                alt=""
                aria-hidden
                className="w-9 h-9 object-cover border border-text-white/25"
              />
            </div>
          </header>

          {/* Imagine input — sits in the gradient zone, on a light card */}
          <div className="mt-20 md:mt-32 max-w-[680px] mx-auto">
            <ImaginePrompt />
          </div>
        </div>
      </section>

      {/* ── Content zone — white, sections continue here ── */}
      <main className="mx-auto w-full max-w-[1080px] px-5 md:px-8 lg:px-10 pt-8 md:pt-10 pb-[140px] flex flex-col gap-8 md:gap-12">
        <LooksCarousel />

        <section aria-labelledby="wall-heading" className="flex flex-col gap-3 md:gap-4">
          <div className="flex items-baseline justify-between">
            <h2 id="wall-heading" className="heading-2 text-text-body">
              The Wall
            </h2>
            <span className="body-s text-text-secondary">
              {PLACEHOLDER_PHOTOS.length} photos
            </span>
          </div>
          <Wall photos={PLACEHOLDER_PHOTOS} />
        </section>

        <DiscoverCarousel />
      </main>

      <Dock />
    </div>
  )
}
