import { useState } from 'react'
import { useStudioStore } from '@/store/studio-store'
import { cn } from '@/lib/utils'
import { ArrowLeft, Check } from 'lucide-react'

export function PickYourShot() {
  const pinnedVersions = useStudioStore((s) => s.pinnedVersions)
  const currentComposite = useStudioStore((s) => s.currentComposite)
  const selectFinal = useStudioStore((s) => s.selectFinal)
  const backToCreating = useStudioStore((s) => s.backToCreating)
  const sourceImage = useStudioStore((s) => s.sourceImage)

  // Include current working version as an option
  const allOptions = [
    ...pinnedVersions.map((v) => ({ id: v.id, image: v.image, label: v.label })),
    { id: 'current', image: currentComposite, label: 'Current' },
  ]

  const [selectedId, setSelectedId] = useState<string>(allOptions[allOptions.length - 1].id)
  const selectedImage = allOptions.find((o) => o.id === selectedId)?.image || currentComposite
  const [showOriginal, setShowOriginal] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-page">
      {/* Header */}
      <header className="h-12 flex items-center px-4 border-b border-ih-border/50 shrink-0">
        <button
          onClick={backToCreating}
          className="flex items-center gap-2 text-ih-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-[14px]">Back to studio</span>
        </button>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 p-4 gap-4">
        {/* Preview */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative max-w-[480px] w-full aspect-[3/4] rounded-[var(--radius-preview)] overflow-hidden shadow-lg">
            <img
              src={showOriginal ? sourceImage : selectedImage}
              alt="Selected version"
              className="w-full h-full object-cover transition-all duration-300"
            />

            {/* Before/After toggle */}
            <div className="absolute top-3 right-3 flex rounded-full overflow-hidden bg-surface/90 backdrop-blur-sm shadow-sm">
              <button
                onClick={() => setShowOriginal(false)}
                className={cn(
                  'px-3 py-1 text-[11px] font-medium transition-colors',
                  !showOriginal ? 'bg-ih-accent text-white' : 'text-ih-muted'
                )}
              >
                After
              </button>
              <button
                onClick={() => setShowOriginal(true)}
                className={cn(
                  'px-3 py-1 text-[11px] font-medium transition-colors',
                  showOriginal ? 'bg-ih-accent text-white' : 'text-ih-muted'
                )}
              >
                Before
              </button>
            </div>
          </div>
        </div>

        {/* Version grid */}
        <div className="lg:w-[300px] shrink-0">
          <h2 className="text-[18px] font-medium mb-3">Pick your shot</h2>
          <div className="grid grid-cols-3 gap-2">
            {allOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedId(option.id)}
                className={cn(
                  'relative rounded-[var(--radius-card)] overflow-hidden aspect-[3/4] border-2 transition-all',
                  selectedId === option.id
                    ? 'border-ih-accent shadow-md'
                    : 'border-transparent hover:border-ih-border'
                )}
              >
                <img
                  src={option.image}
                  alt={option.label}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] text-center py-0.5">
                  {option.label}
                </span>
                {selectedId === option.id && (
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-ih-accent flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => selectFinal(selectedId)}
            className="w-full mt-4 px-5 py-3 bg-ih-accent text-white text-[14px] font-medium rounded-[var(--radius-btn)] hover:bg-ih-accent/90 transition-colors"
          >
            Use this shot
          </button>
        </div>
      </div>
    </div>
  )
}
