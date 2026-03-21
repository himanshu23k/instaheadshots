import { useStudioStore } from '@/store/studio-store'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface StudioImageProps {
  overlay?: ReactNode
  topRight?: ReactNode
  bottomRight?: ReactNode
}

export function StudioImage({ overlay, topRight, bottomRight }: StudioImageProps) {
  const currentComposite = useStudioStore((s) => s.currentComposite)
  const revealPhase = useStudioStore((s) => s.revealPhase)

  return (
    <div className="studio-image-clean relative flex items-center justify-center flex-1 min-h-0 px-3 py-2 sm:px-4 sm:py-3">
      <div
        className="relative max-w-[280px] sm:max-w-[360px] lg:max-w-[480px] xl:max-w-[520px] w-full aspect-[3/4]"
        style={{
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'transparent',
        }}
      >
        {/* Main image */}
        <img
          src={currentComposite}
          alt="Your headshot"
          className={cn(
            'block w-full h-full object-cover transition-all duration-600 ease-out',
            revealPhase === 'processing' && 'blur-[4px] opacity-70 scale-[1.01]',
            revealPhase === 'revealing' && 'blur-0 opacity-100 scale-100',
          )}
        />

        {/* Shimmer sweep on reveal */}
        {revealPhase === 'revealing' && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              animation: 'shimmer-sweep 0.5s ease-out forwards',
            }}
          />
        )}

        {/* Overlay slot (for variations grid, etc.) */}
        {overlay}

        {/* Brand — top-left on preview (above reveal overlay z-20 so it stays visible in the corner) */}
        <div className="pointer-events-none absolute left-3 top-3 z-[30]">
          <img
            src="https://instaheadshots.com/images/logo-horizontal.svg"
            alt="Instaheadshots"
            width={107}
            height={24}
            className="h-[22px] w-auto max-w-[min(42vw,7.5rem)] object-contain object-left drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]"
            draggable={false}
          />
        </div>

        {/* Top-right slot (version board) */}
        {topRight && (
          <div className="absolute top-3 right-3 z-10">
            {topRight}
          </div>
        )}

        {/* Bottom-right slot (pin button) */}
        {bottomRight && (
          <div className="absolute bottom-3 right-3 z-10">
            {bottomRight}
          </div>
        )}
      </div>
    </div>
  )
}
