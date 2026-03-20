import type { ReactNode } from 'react'
import { ImagePreview } from '@/components/common/ImagePreview'

interface StepLayoutProps {
  children: ReactNode
  previewSrc: string
  previewAlt?: string
  previewOverlay?: ReactNode
  previewTopRight?: ReactNode
}

export function StepLayout({
  children,
  previewSrc,
  previewAlt,
  previewOverlay,
  previewTopRight,
}: StepLayoutProps) {
  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-0">
      {/* Left panel — options */}
      <div className="lg:w-[360px] flex-shrink-0 bg-surface border-r border-ih-border overflow-y-auto">
        <div className="p-4">{children}</div>
      </div>

      {/* Right panel — preview */}
      <div className="flex-1 flex items-center justify-center p-6 bg-page relative min-h-[40vh]">
        <div className="relative w-full max-w-md">
          <ImagePreview
            src={previewSrc}
            alt={previewAlt}
            overlayContent={previewOverlay}
            className="aspect-[3/4] w-full"
          />
          {previewTopRight && (
            <div className="absolute top-3 right-3 z-10">
              {previewTopRight}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
