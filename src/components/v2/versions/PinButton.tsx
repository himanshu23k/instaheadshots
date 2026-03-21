import { Pin } from 'lucide-react'
import { useStudioStore } from '@/store/studio-store'

export function PinButton() {
  const pinVersion = useStudioStore((s) => s.pinVersion)
  const pinnedCount = useStudioStore((s) => s.pinnedVersions.length)
  const revealPhase = useStudioStore((s) => s.revealPhase)
  const sourceImage = useStudioStore((s) => s.sourceImage)
  const currentComposite = useStudioStore((s) => s.currentComposite)

  // Only show after a transformation has been applied (composite differs from source)
  const hasTransformation = currentComposite !== sourceImage
  if (!hasTransformation) return null

  // Only show when idle or after a reveal completes
  if (revealPhase !== 'complete' && revealPhase !== 'idle') return null
  if (pinnedCount >= 6) return null

  return (
    <button
      onClick={() => pinVersion()}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-surface/90 backdrop-blur-sm rounded-full shadow-md text-[12px] font-medium text-foreground hover:bg-surface transition-colors"
      style={{ animation: 'fade-in 0.3s ease' }}
      aria-label="Pin this version"
    >
      <Pin className="w-3.5 h-3.5" />
      <span>Pin</span>
    </button>
  )
}
