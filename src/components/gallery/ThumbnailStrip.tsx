import { useEffect, useRef } from 'react'
import { useJourneyStore } from '@/store/journey-store'

export function ThumbnailStrip() {
  const galleryImages = useJourneyStore((s) => s.galleryImages)
  const selectedIndex = useJourneyStore((s) => s.selectedImageIndex)
  const setSelectedIndex = useJourneyStore((s) => s.setSelectedImageIndex)
  const stripRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = stripRef.current
    if (!container) return
    const thumb = container.children[selectedIndex] as HTMLElement | undefined
    thumb?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [selectedIndex])

  return (
    <div
      ref={stripRef}
      className="flex gap-2 overflow-x-auto px-4 py-2 justify-center scrollbar-hide snap-x snap-mandatory"
    >
      {galleryImages.map((src, i) => (
        <button
          key={i}
          onClick={() => setSelectedIndex(i)}
          className={`
            flex-shrink-0 w-14 aspect-[3/4] rounded-[var(--radius-card)] overflow-hidden
            border-2 transition-all duration-200 snap-center
            ${i === selectedIndex
              ? 'border-primary-cta ring-1 ring-primary-cta/30 scale-105'
              : 'border-transparent opacity-60 hover:opacity-90'
            }
          `}
        >
          <img
            src={src}
            alt={`Thumbnail ${i + 1}`}
            className="w-full h-full object-cover"
          />
        </button>
      ))}
    </div>
  )
}
