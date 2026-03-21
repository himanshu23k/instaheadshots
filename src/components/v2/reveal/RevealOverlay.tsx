import { useStudioStore } from '@/store/studio-store'

export function RevealOverlay() {
  const revealPhase = useStudioStore((s) => s.revealPhase)

  if (revealPhase === 'idle' || revealPhase === 'complete') return null

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
      {/* Processing state: pulsing ring */}
      {revealPhase === 'processing' && (
        <div
          className="w-12 h-12 rounded-full border-2 border-ih-accent/60"
          style={{ animation: 'iris-pulse 1.2s ease-in-out infinite' }}
        />
      )}
    </div>
  )
}
