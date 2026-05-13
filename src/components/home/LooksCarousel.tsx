import { useEffect, useRef, useState } from 'react'
import { ArrowRight, X } from 'lucide-react'

const FACES = Array.from(
  { length: 12 },
  (_, i) => `/mock/faces/face-${String(i + 1).padStart(2, '0')}.jpg`,
)

type LookItem = { id: string; name: string; count: number; image: string }
type CategoryId = 'professional' | 'social' | 'dating'

type Category = {
  id: CategoryId
  name: string
  cover: string
  looks: LookItem[]
}

const CATEGORIES: Category[] = [
  {
    id: 'professional',
    name: 'Professional',
    cover: '/mock/faces/category-professional.avif',
    looks: [
      { id: 'founder', name: 'Founder', count: 5, image: FACES[0] },
      { id: 'boardroom', name: 'Boardroom', count: 5, image: FACES[1] },
      { id: 'editorial', name: 'Editorial', count: 4, image: FACES[2] },
      { id: 'cinematic', name: 'Cinematic', count: 3, image: FACES[3] },
      { id: 'studio-casual', name: 'Studio Casual', count: 5, image: FACES[4] },
      { id: 'noir', name: 'Noir', count: 4, image: FACES[5] },
    ],
  },
  {
    id: 'social',
    name: 'Social',
    cover: '/mock/faces/category-social.avif',
    looks: [
      { id: 'casual', name: 'Casual', count: 5, image: FACES[6] },
      { id: 'birthday', name: 'Birthday', count: 4, image: FACES[7] },
      { id: 'travel', name: 'Travel', count: 6, image: FACES[8] },
      { id: 'brunch', name: 'Brunch', count: 3, image: FACES[9] },
      { id: 'concert', name: 'Concert', count: 4, image: FACES[10] },
      { id: 'friends', name: 'Friends', count: 5, image: FACES[11] },
    ],
  },
  {
    id: 'dating',
    name: 'Dating',
    cover: '/mock/faces/category-dating.avif',
    looks: [
      { id: 'beach', name: 'Beach', count: 4, image: FACES[3] },
      { id: 'coffee', name: 'Coffee Shop', count: 3, image: FACES[5] },
      { id: 'romantic', name: 'Romantic', count: 5, image: FACES[7] },
      { id: 'sunset', name: 'Sunset', count: 4, image: FACES[9] },
      { id: 'city-date', name: 'City Date', count: 3, image: FACES[11] },
      { id: 'adventure', name: 'Adventure', count: 5, image: FACES[2] },
    ],
  },
]

export function LooksCarousel() {
  const [openId, setOpenId] = useState<CategoryId | null>(null)
  const openCategory = openId ? CATEGORIES.find((c) => c.id === openId) ?? null : null
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null)

  // Esc to close, focus close on open, lock body scroll, restore focus on close.
  useEffect(() => {
    if (!openCategory) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpenId(null)
      }
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      lastTriggerRef.current?.focus()
    }
  }, [openCategory])

  const open = (id: CategoryId, trigger: HTMLButtonElement | null) => {
    lastTriggerRef.current = trigger
    setOpenId(id)
  }

  return (
    <>
      <section aria-labelledby="try-new-looks-heading" className="flex flex-col gap-3 md:gap-4">
        <h2 id="try-new-looks-heading" className="heading-2 text-text-body">
          Try New Looks
        </h2>

        <div className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:mx-0 md:px-0 md:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={(e) => open(cat.id, e.currentTarget)}
              aria-haspopup="dialog"
              className="group flex flex-col shrink-0 w-[280px] snap-start md:w-auto md:shrink overflow-hidden border-2 border-button-primary-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-highlight focus-visible:ring-offset-2"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-shapes-grey">
                <img
                  src={cat.cover}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                />
              </div>
              <div className="flex items-center justify-between gap-3 px-5 md:px-6 py-5 md:py-6 bg-button-primary-default text-text-white">
                <span className="text-20 md:text-22 font-medium leading-tight truncate">
                  {cat.name}
                </span>
                <ArrowRight
                  className="w-6 h-6 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                  strokeWidth={1.75}
                />
              </div>
            </button>
          ))}
        </div>
      </section>

      {openCategory && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="looks-modal-heading"
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
        >
          <div
            onClick={() => setOpenId(null)}
            aria-hidden
            className="absolute inset-0 bg-backdrop-modal animate-[fade-in_180ms_ease-out_forwards]"
          />
          <div
            className="relative w-full md:max-w-3xl md:mx-5 bg-bg-section flex flex-col max-h-[88vh] md:max-h-[80vh]"
            style={{
              boxShadow: 'var(--shadow-05)',
              animation: 'slide-up 240ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
            }}
          >
            <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border-primary">
              <div className="flex flex-col">
                <span className="text-10 font-medium tracking-[0.22em] uppercase text-text-secondary">
                  Looks
                </span>
                <h3
                  id="looks-modal-heading"
                  className="mt-0.5 heading-2 text-text-body"
                >
                  {openCategory.name}
                </h3>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpenId(null)}
                aria-label="Close"
                className="w-10 h-10 flex items-center justify-center text-text-body hover:bg-bg-light-beige transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-highlight"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {openCategory.looks.map((look) => (
                  <button
                    key={look.id}
                    type="button"
                    onClick={() => console.log('[home] open look', look.id)}
                    className="group flex flex-col gap-2 focus-visible:outline-none"
                  >
                    <div
                      className="relative aspect-[4/5] w-full overflow-hidden bg-shapes-grey group-focus-visible:ring-2 group-focus-visible:ring-text-highlight group-focus-visible:ring-offset-2"
                      style={{ boxShadow: 'var(--shadow-01)' }}
                    >
                      <img
                        src={look.image}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                      <div
                        aria-hidden
                        className="absolute inset-x-0 bottom-0 h-1/2"
                        style={{
                          background:
                            'linear-gradient(180deg, transparent 0%, rgba(1,17,36,0.55) 100%)',
                        }}
                      />
                      <div
                        aria-hidden
                        className="absolute inset-0 ring-1 ring-inset ring-text-white/20"
                      />
                      <span className="absolute bottom-3 left-3 right-3 body-m font-medium text-text-white truncate">
                        {look.name}
                      </span>
                    </div>
                    <span className="px-1 body-s text-text-secondary">
                      {look.count} photos
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
