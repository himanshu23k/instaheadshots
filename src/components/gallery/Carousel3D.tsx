import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useJourneyStore } from '@/store/journey-store'
import { ImagePreview } from '@/components/common/ImagePreview'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}

export function Carousel3D() {
  const galleryImages = useJourneyStore((s) => s.galleryImages)
  const selectedIndex = useJourneyStore((s) => s.selectedImageIndex)
  const setSelectedIndex = useJourneyStore((s) => s.setSelectedImageIndex)
  const isMobile = useIsMobile()

  const total = galleryImages.length

  const prev = useCallback(() => {
    setSelectedIndex((selectedIndex - 1 + total) % total)
  }, [selectedIndex, total, setSelectedIndex])

  const next = useCallback(() => {
    setSelectedIndex((selectedIndex + 1) % total)
  }, [selectedIndex, total, setSelectedIndex])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [prev, next])

  // Touch/swipe support for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const diff = e.changedTouches[0].clientX - touchStart
    if (Math.abs(diff) > 50) {
      if (diff > 0) prev()
      else next()
    }
    setTouchStart(null)
  }

  const getCardStyle = (position: 'left' | 'center' | 'right'): React.CSSProperties => {
    const cardWidth = isMobile ? '65vw' : '420px'

    const base: React.CSSProperties = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: cardWidth,
      maxWidth: '420px',
      transition: 'all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
      willChange: 'transform, opacity',
    }

    const tx = isMobile ? '45%' : '55%'

    switch (position) {
      case 'left':
        return {
          ...base,
          transform: `translate(-50%, -50%) translateX(-${tx}) translateZ(-80px) rotateY(12deg) scale(0.78)`,
          opacity: isMobile ? 0.3 : 0.5,
          zIndex: 1,
        }
      case 'center':
        return {
          ...base,
          transform: 'translate(-50%, -50%) translateZ(0) scale(1)',
          opacity: 1,
          zIndex: 3,
        }
      case 'right':
        return {
          ...base,
          transform: `translate(-50%, -50%) translateX(${tx}) translateZ(-80px) rotateY(-12deg) scale(0.78)`,
          opacity: isMobile ? 0.3 : 0.5,
          zIndex: 1,
        }
    }
  }

  const leftIndex = (selectedIndex - 1 + total) % total
  const rightIndex = (selectedIndex + 1) % total

  const cards = [
    { index: leftIndex, position: 'left' as const },
    { index: selectedIndex, position: 'center' as const },
    { index: rightIndex, position: 'right' as const },
  ]

  return (
    <div className="relative w-full max-w-[960px] mx-auto px-10 sm:px-0">
      <div
        className="relative w-full h-[360px] sm:h-[600px]"
        style={{ perspective: '1200px' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {cards.map(({ index, position }) => (
          <div
            key={`${index}-${position}`}
            style={getCardStyle(position)}
            onClick={() => {
              if (position === 'left') prev()
              if (position === 'right') next()
            }}
            className={position !== 'center' ? 'cursor-pointer' : ''}
          >
            <ImagePreview
              src={galleryImages[index]}
              alt={`Headshot ${index + 1}`}
              className="aspect-[3/4] w-full rounded-[var(--radius-modal)] shadow-xl"
            />
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface/80 backdrop-blur-sm border border-ih-border flex items-center justify-center text-ih-muted hover:text-primary-cta hover:border-primary-cta transition-colors shadow-md"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface/80 backdrop-blur-sm border border-ih-border flex items-center justify-center text-ih-muted hover:text-primary-cta hover:border-primary-cta transition-colors shadow-md"
        aria-label="Next image"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
