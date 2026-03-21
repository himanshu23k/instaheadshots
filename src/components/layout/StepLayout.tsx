import { useState, useRef, useCallback, type ReactNode } from 'react'
import { ImagePreview } from '@/components/common/ImagePreview'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { emitScrollHidden } from '@/hooks/use-scroll-direction'

interface StepLayoutProps {
  children: ReactNode
  /** Pinned to the bottom of the left panel on all breakpoints (replaces fixed mobile footer). */
  footer?: ReactNode
  previewSrc: string
  previewAlt?: string
  previewOverlay?: ReactNode
  previewTopRight?: ReactNode
}

export function StepLayout({
  children,
  footer,
  previewSrc,
  previewAlt,
  previewOverlay,
  previewTopRight,
}: StepLayoutProps) {
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)
  const lastScrollTop = useRef(0)

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    if (Math.abs(scrollTop - lastScrollTop.current) < 8) return
    emitScrollHidden(scrollTop > lastScrollTop.current && scrollTop > 20)
    lastScrollTop.current = scrollTop
  }, [])

  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-0">
      {/* Mobile inline preview — collapsible */}
      <div className="lg:hidden bg-page border-b border-ih-border">
        <button
          onClick={() => setMobilePreviewOpen((v) => !v)}
          className="w-full flex items-center gap-3 px-4 py-2"
        >
          <img
            src={previewSrc}
            alt={previewAlt}
            className="w-12 h-12 rounded-[var(--radius-card)] object-cover"
          />
          <span className="text-[13px] text-ih-muted flex-1 text-left">
            {mobilePreviewOpen ? 'Hide preview' : 'Tap to preview'}
          </span>
          {mobilePreviewOpen ? (
            <ChevronUp className="w-4 h-4 text-ih-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-ih-muted" />
          )}
        </button>
        {mobilePreviewOpen && (
          <div className="px-4 pb-3 relative">
            <ImagePreview
              src={previewSrc}
              alt={previewAlt}
              overlayContent={previewOverlay}
              className="aspect-[3/4] w-full max-h-[30vh] object-contain"
            />
            {previewTopRight && (
              <div className="absolute top-1 right-5 z-10">
                {previewTopRight}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Left panel — scrollable options + footer pinned to bottom of column */}
      <div className="flex min-h-0 flex-1 flex-col lg:w-[360px] lg:flex-none bg-surface border-r border-ih-border">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div
            className="min-h-0 flex-1 overflow-y-auto p-4"
            onScroll={handleScroll}
          >
            {children}
          </div>
          {footer != null && (
            <div className="shrink-0 border-t border-ih-border bg-surface px-4 pt-2 pb-4">
              {footer}
            </div>
          )}
        </div>
      </div>

      {/* Right panel — preview (desktop only) */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-6 bg-page relative min-h-[40vh]">
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
