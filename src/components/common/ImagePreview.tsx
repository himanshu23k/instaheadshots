import type { ReactNode } from 'react'

interface ImagePreviewProps {
  src: string
  alt?: string
  overlayContent?: ReactNode
  className?: string
}

export function ImagePreview({
  src,
  alt = 'Headshot preview',
  overlayContent,
  className = '',
}: ImagePreviewProps) {
  return (
    <div className={`relative rounded-[var(--radius-preview)] overflow-hidden bg-skeleton-base ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover animate-crossfade"
        onError={(e) => {
          // Fallback for missing images
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
        }}
      />
      {/* Fallback when image fails */}
      <div className="absolute inset-0 flex items-center justify-center text-ih-muted text-[14px] -z-10">
        Preview
      </div>
      {overlayContent && (
        <div className="absolute inset-0">{overlayContent}</div>
      )}
    </div>
  )
}
