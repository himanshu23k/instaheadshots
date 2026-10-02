import { useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { BRAND, REVIEWS, TRUSTPILOT } from './data'
import { FONT } from './tokens'

/**
 * magicstudio.com's "Customer reviews" section, rebuilt from its markup:
 * on desktop a #171717 panel (radius 72, padding 48) with the rainbow glow
 * rising from its bottom edge; on phones the panel drops away and the glow
 * sits behind the page. Laurel title, hairline, Trustpilot row, then a grid of
 * #1A1A1A quote cards (radius 24) with sparkles at the joins and glass arrows.
 */

const QUOTE_PATH =
  'M14.5011 22.1429C14.5011 26.0443 11.7895 29 7.66316 29C3.53684 29 0 25.6897 0 19.7783C0 12.4483 5.54105 6.18226 12.7326 5V9.37438C8.60631 10.202 5.54105 13.1576 5.54105 16.5862C6.24842 16.1133 7.19158 15.7586 8.72421 15.7586C11.7895 15.7586 14.5011 18.0049 14.5011 22.1429ZM33.6 22.1429C33.6 26.0443 30.7705 29 26.6442 29C22.6358 29 18.9811 25.6897 18.9811 19.7783C18.9811 12.4483 24.5221 6.18226 31.8316 5V9.37438C27.7053 10.202 24.64 13.1576 24.64 16.468C25.3474 15.9951 26.4084 15.7586 27.8232 15.7586C30.8884 15.7586 33.6 18.0049 33.6 22.1429Z'
const SPARKLE_PATH = 'M14 0c1.7 8.9 4.4 11.6 14 14-9.6 2.4-12.3 5.1-14 14-1.7-8.9-4.4-11.6-14-14 9.6-2.4 12.3-5.1 14-14Z'
const TRUSTPILOT_STAR =
  'M26.8184 16.0508H43.3857L29.9844 25.9648L35.1016 42L21.7021 32.0869L31.1309 29.5986L29.9785 25.9688L21.7002 32.0859L8.2832 42L13.417 25.9648L0 16.0352L16.5674 16.0508L21.7002 0L26.8184 16.0508Z'

function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query)
      m.addEventListener('change', cb)
      return () => m.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

function ArrowButton({ dir, onClick, className }: { dir: 'prev' | 'next'; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-label={dir === 'prev' ? 'Previous reviews' : 'Next reviews'}
      onClick={onClick}
      className={cn(
        'flex size-[42px] items-center justify-center rounded-[10px] bg-white/40 text-[#000409] shadow-[0px_8px_16px_0px_rgba(0,0,0,0.08),inset_-0.5px_-0.5px_1px_0px_rgba(255,255,255,0.3),inset_0.5px_0.5px_1px_0px_rgba(255,255,255,0.9)] backdrop-blur transition-[background-color,transform] duration-200 hover:bg-white/60 active:scale-95 lg:rounded-3xl lg:bg-white/10 lg:text-white lg:hover:bg-white/20',
        className,
      )}
    >
      <svg viewBox="0 0 26 26" fill="none" aria-hidden className={cn('size-[26px]', dir === 'next' && '-scale-x-100')}>
        <path d="M15.48 6.23 8.71 13l6.77 6.77" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

function ReviewCard({ href, quote, name, i }: { href: string; quote: string; name: string; i: number }) {
  return (
    <motion.div
      className="relative -ml-px -mt-px h-full"
      initial={{ opacity: 0, filter: 'blur(6px)', y: 8 }}
      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      exit={{ opacity: 0, filter: 'blur(6px)' }}
      transition={{ duration: 0.45, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex h-full min-h-[190px] cursor-pointer flex-col gap-5 overflow-hidden rounded-3xl border border-[#282828] bg-[#1A1A1A] p-6 text-white transition-[border-color] duration-300 md:min-h-[214px] lg:hover:border-transparent"
        style={FONT}
      >
        <span
          aria-hidden
          className="absolute inset-0 hidden bg-[linear-gradient(137deg,rgba(157,207,255,0.32)_22.78%,rgba(6,153,59,0.32)_103.92%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:block"
        />
        <img
          src={BRAND.reviews.scribble}
          alt=""
          width={466}
          height={473}
          loading="lazy"
          className="absolute left-[158px] top-[-118px] hidden w-[466px] max-w-none rotate-[-33.13deg] opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-100 lg:block"
        />
        <div className="relative flex flex-col gap-4">
          <span className="relative block size-6 lg:size-[34px]">
            <svg viewBox="0 0 34 34" fill="none" aria-hidden className="absolute inset-0 size-full opacity-[0.51] transition-opacity duration-300 lg:group-hover:opacity-0">
              <path d={QUOTE_PATH} fill="#D6D6D6" />
            </svg>
            <svg viewBox="0 0 34 34" fill="none" aria-hidden className="absolute inset-0 size-full opacity-0 transition-opacity duration-300 lg:group-hover:opacity-100">
              <path d={QUOTE_PATH} fill="#00B378" filter="url(#hl-reviews-quote-inset)" />
            </svg>
          </span>
          <blockquote className="text-[16px] leading-[18px]" style={{ fontWeight: 420 }}>
            {quote}
          </blockquote>
        </div>
        <p className="relative text-[14px] leading-[16px] md:text-[16px] md:leading-[18px]" style={{ fontWeight: 420 }}>
          {name}
        </p>
      </a>
    </motion.div>
  )
}

export function Reviews() {
  const lg = useMedia('(min-width: 1024px)')
  const md = useMedia('(min-width: 768px)')
  // Desktop shows all six (two rows of three); the arrows rotate the set by a row.
  const perPage = lg ? 6 : md ? 4 : 3
  const step = lg ? 3 : perPage
  const [offset, setOffset] = useState(0)
  const n = REVIEWS.length
  const shown = Array.from({ length: Math.min(perPage, n) }, (_, k) => REVIEWS[(offset + k) % n])
  const move = (d: 1 | -1) => setOffset((o) => (((o + d * step) % n) + n) % n)

  return (
    <section aria-label="Customer reviews" className="relative mt-[120px] md:mt-[160px] lg:mt-[180px]" style={FONT}>
      {/* phones: the glow sits behind the page, no panel */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[1280px] overflow-hidden md:h-[889px] lg:hidden">
        <img
          src={BRAND.reviews.glow}
          alt=""
          loading="lazy"
          className="absolute left-[-1736px] top-[333px] h-[947px] w-[2356px] max-w-none md:left-[-96.5%] md:top-[31px] md:h-[858px] md:w-[210%]"
        />
      </div>

      <div className="relative flex flex-col gap-[40px] px-3 md:px-6 lg:mx-auto lg:w-[min(1342px,100%-96px)] lg:overflow-hidden lg:rounded-[72px] lg:bg-[#171717] lg:p-12">
        {/* desktop: the glow rises from the panel's bottom edge */}
        <div aria-hidden className="pointer-events-none absolute inset-x-[-9px] bottom-[-100px] hidden h-[657px] lg:block">
          <img src={BRAND.reviews.glow} alt="" loading="lazy" className="absolute inset-[-100px] h-[calc(100%+200px)] w-[calc(100%+200px)] max-w-none" />
        </div>

        <div className="relative flex flex-col items-center gap-4 text-[#000409] lg:text-white">
          <div className="flex items-center gap-2 md:gap-3">
            <img src={BRAND.reviews.laurel} alt="" width={42} height={90} className="h-16 w-[30px] md:h-[72px] md:w-[34px]" />
            <h2 className="max-w-xs text-center text-[32px] leading-[34px] tracking-[-0.32px] md:text-[36px] md:leading-[38px] md:tracking-[-0.36px]" style={{ fontWeight: 420 }}>
              Rated a perfect {TRUSTPILOT.rating} on Trustpilot
            </h2>
            <img src={BRAND.reviews.laurel} alt="" width={42} height={90} className="h-16 w-[30px] -scale-x-100 md:h-[72px] md:w-[34px]" />
          </div>
          <span aria-hidden className="h-px w-[164px] bg-[#E9EAEB] md:w-52 lg:bg-white/[0.12]" />
          <div className="flex items-center gap-2">
            <img src={BRAND.reviews.stars} alt="" width={85} height={16} className="h-3.5 w-auto md:h-4" />
            <p className="text-[14px] leading-[16px] md:text-[16px] md:leading-[18px]" style={{ fontWeight: 420 }}>
              {TRUSTPILOT.count} reviews
            </p>
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 43.39 42" fill="none" aria-hidden className="h-4 w-auto text-[#00B67A] md:h-[18px]">
                <path d={TRUSTPILOT_STAR} fill="currentColor" />
              </svg>
              <img src={BRAND.reviews.wordmarkInk} alt="Trustpilot" width={117} height={26} className="h-3 w-auto md:h-3.5 lg:hidden" />
              <img src={BRAND.reviews.wordmarkWhite} alt="Trustpilot" width={117} height={26} className="hidden h-3 w-auto md:h-3.5 lg:block" />
            </span>
          </div>
        </div>

        <div className="relative flex flex-col items-center gap-3 md:gap-6">
          <div className="relative w-full">
            <div className="grid grid-cols-1 pl-px pt-px md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {shown.map((r, i) => (
                  <ReviewCard key={`${offset}-${r.name}`} {...r} i={i} />
                ))}
              </AnimatePresence>
            </div>
            {/* sparkles at the joins of the three columns */}
            <svg viewBox="0 0 28 28" aria-hidden className="pointer-events-none absolute left-1/3 top-1/2 hidden size-7 -translate-x-1/2 -translate-y-1/2 text-[#d878ae] lg:block">
              <path d={SPARKLE_PATH} fill="currentColor" />
            </svg>
            <svg viewBox="0 0 28 28" aria-hidden className="pointer-events-none absolute left-2/3 top-1/2 hidden size-7 -translate-x-1/2 -translate-y-1/2 text-[#da896b] lg:block">
              <path d={SPARKLE_PATH} fill="currentColor" />
            </svg>
            <ArrowButton dir="prev" onClick={() => move(-1)} className="absolute left-[-21px] top-1/2 hidden -translate-y-1/2 lg:flex" />
            <ArrowButton dir="next" onClick={() => move(1)} className="absolute right-[-21px] top-1/2 hidden -translate-y-1/2 lg:flex" />
          </div>
          <div className="flex gap-3 lg:hidden">
            <ArrowButton dir="prev" onClick={() => move(-1)} />
            <ArrowButton dir="next" onClick={() => move(1)} />
          </div>
        </div>
      </div>

      {/* green quote mark's inner highlight, used on hover */}
      <svg aria-hidden className="absolute size-0">
        <defs>
          <filter id="hl-reviews-quote-inset" x="0" y="5" width="33.6" height="28" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="6" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0" />
            <feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
          </filter>
        </defs>
      </svg>
    </section>
  )
}
