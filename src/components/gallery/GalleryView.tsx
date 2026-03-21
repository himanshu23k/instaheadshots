import { Pencil, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useJourneyStore } from '@/store/journey-store'
import { CreditIndicator } from '@/components/common/CreditIndicator'
import { Carousel3D } from './Carousel3D'
import { ThumbnailStrip } from './ThumbnailStrip'

export function GalleryView() {
  const navigate = useNavigate()
  const galleryImages = useJourneyStore((s) => s.galleryImages)
  const selectedIndex = useJourneyStore((s) => s.selectedImageIndex)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = galleryImages[selectedIndex]
    link.download = `headshot-${selectedIndex + 1}.jpg`
    link.click()
  }

  return (
    <div className="min-h-screen bg-page flex flex-col relative">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4">
        <img
          src="/logo-horizontal.svg"
          alt="Insta Headshots"
          className="h-6"
        />
        <CreditIndicator />
      </div>

      {/* Main content — centered */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 py-6">
        {/* 3D Carousel */}
        <Carousel3D />

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/edit-v2')}
            className="flex items-center gap-2 px-6 py-2.5 border border-ih-border rounded-[var(--radius-btn)] text-[14px] font-medium text-primary-cta hover:bg-gray-50 transition-colors bg-surface"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-cta text-white rounded-[var(--radius-btn)] text-[14px] font-medium hover:bg-primary-cta-hover transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>

        {/* Thumbnail strip */}
        <ThumbnailStrip />
      </div>

    </div>
  )
}
