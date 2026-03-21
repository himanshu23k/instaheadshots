import { Download, RotateCcw, Share2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStudioStore } from '@/store/studio-store'
import { useCreditStore } from '@/store/credit-store'

export function FinalShot() {
  const navigate = useNavigate()
  const currentComposite = useStudioStore((s) => s.currentComposite)
  const pinnedVersions = useStudioStore((s) => s.pinnedVersions)
  const selectedFinalId = useStudioStore((s) => s.selectedFinalId)
  const reset = useStudioStore((s) => s.reset)
  const creditReset = useCreditStore((s) => s.reset)
  const totalSpent = useCreditStore((s) => s.getTotalSpent())

  // Get the final image
  const finalImage =
    selectedFinalId && selectedFinalId !== 'current'
      ? pinnedVersions.find((v) => v.id === selectedFinalId)?.image || currentComposite
      : currentComposite

  const handleStartOver = () => {
    reset()
    creditReset()
    navigate('/')
  }

  return (
    <div className="h-screen flex flex-col bg-[#111111] text-white overflow-hidden">
      {/* Full-bleed image */}
      <div className="flex-1 flex items-center justify-center p-6 min-h-0">
        <div className="relative max-w-[520px] w-full aspect-[3/4] rounded-[var(--radius-preview)] overflow-hidden shadow-2xl">
          <img
            src={finalImage}
            alt="Your final headshot"
            className="w-full h-full object-cover"
            style={{ animation: 'fade-in 0.8s ease' }}
          />

          {/* Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-white/40"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  bottom: '0%',
                  animation: `particle-drift ${2 + Math.random() * 3}s ease-out ${Math.random() * 2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Iris closing + actions */}
      <div className="shrink-0 pb-8 px-6 text-center space-y-4" style={{ animation: 'fade-in 1s ease 0.5s both' }}>
        <p className="text-[16px] text-white/70 italic">
          Your shot. Your story.
        </p>

        {totalSpent > 0 && (
          <p className="text-[12px] text-white/40">
            {totalSpent} credit{totalSpent !== 1 ? 's' : ''} invested in this look
          </p>
        )}

        <div className="flex items-center justify-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#111111] text-[14px] font-medium rounded-[var(--radius-btn)] hover:bg-white/90 transition-colors">
            <Download className="w-4 h-4" />
            Download
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 border border-white/30 text-white text-[14px] font-medium rounded-[var(--radius-btn)] hover:bg-white/10 transition-colors">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        <button
          onClick={handleStartOver}
          className="flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white/80 transition-colors mx-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Start over
        </button>
      </div>
    </div>
  )
}
