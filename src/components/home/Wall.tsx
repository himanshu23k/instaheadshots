import { useState } from 'react'
import { Heart, ArrowDownToLine } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  photos: string[] | undefined
  onPhotoClick?: (index: number) => void
  onDownload?: (index: number) => void
}

const SKELETON_COUNT = 6

export function Wall({ photos, onPhotoClick, onDownload }: Props) {
  const [favs, setFavs] = useState<Set<number>>(new Set())

  const toggleFav = (i: number) => {
    setFavs((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  if (photos === undefined) {
    return (
      <section
        aria-label="Photos"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0.5"
      >
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div
            key={i}
            className="aspect-square w-full bg-skeleton-base"
            style={{
              backgroundImage:
                'linear-gradient(90deg, var(--color-skeleton-base) 0%, var(--color-skeleton-shimmer) 50%, var(--color-skeleton-base) 100%)',
              backgroundSize: '200% 100%',
              animation: 'var(--animate-shimmer)',
            }}
            aria-hidden
          />
        ))}
      </section>
    )
  }

  if (photos.length === 0) {
    return (
      <section
        aria-label="Photos"
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <p className="body-m text-text-secondary">Your studio is empty.</p>
      </section>
    )
  }

  return (
    <section
      aria-label="Photos"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0.5"
    >
      {photos.map((src, i) => {
        const fav = favs.has(i)
        return (
          <div
            key={`${src}-${i}`}
            className="group relative aspect-square w-full overflow-hidden bg-shapes-grey"
          >
              <button
                type="button"
                onClick={() => (onPhotoClick ?? ((idx) => console.log('[home] open viewer', idx)))(i)}
                aria-label={`Photo ${i + 1}`}
                className="absolute inset-0 z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-text-highlight"
              >
                <img
                  src={src}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.015]"
                />
              </button>

              {/* Hover outline */}
              <span
                aria-hidden
                className="absolute inset-0 pointer-events-none ring-0 group-hover:ring-1 group-hover:ring-inset group-hover:ring-text-body transition-all duration-150"
              />

              {/* Favourite — always visible */}
              <button
                type="button"
                onClick={() => toggleFav(i)}
                aria-label={fav ? `Unfavourite photo ${i + 1}` : `Favourite photo ${i + 1}`}
                aria-pressed={fav}
                className="absolute top-2 right-2 z-10 w-9 h-9 flex items-center justify-center text-text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-highlight"
                style={{ filter: 'drop-shadow(0 1px 2px rgba(1, 17, 36, 0.45))' }}
              >
                <Heart
                  className={cn('w-5 h-5 transition-all', fav && 'fill-current')}
                  strokeWidth={2}
                />
              </button>

              {/* Download — hover/focus only */}
              <button
                type="button"
                onClick={() => (onDownload ?? ((idx) => console.log('[home] download', idx)))(i)}
                aria-label={`Download photo ${i + 1}`}
                className={cn(
                  'absolute bottom-0 right-0 z-10 w-12 h-12 flex items-center justify-center',
                  'text-text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
                  'transition-opacity duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-highlight focus-visible:ring-inset',
                )}
                style={{
                  background:
                    'linear-gradient(135deg, transparent 30%, rgba(1, 17, 36, 0.55) 100%)',
                }}
              >
                <ArrowDownToLine className="w-[18px] h-[18px]" />
              </button>
          </div>
        )
      })}
    </section>
  )
}
