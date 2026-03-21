import { useState, useCallback, useEffect } from 'react'
import { useStudioStore } from '@/store/studio-store'
import { cn } from '@/lib/utils'

export function VariationsGrid() {
  const variations = useStudioStore((s) => s.variations)
  const variationsVisible = useStudioStore((s) => s.variationsVisible)
  const selectVariation = useStudioStore((s) => s.selectVariation)
  const dismissVariations = useStudioStore((s) => s.dismissVariations)
  const [focusedIndex, setFocusedIndex] = useState(0)

  // Reset focus when grid opens
  useEffect(() => {
    if (variationsVisible) setFocusedIndex(0)
  }, [variationsVisible])

  // Arrow key + Enter navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const len = variations.length
      if (!len) return

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          setFocusedIndex((i) => (i + 1) % len)
          break
        case 'ArrowLeft':
          e.preventDefault()
          setFocusedIndex((i) => (i - 1 + len) % len)
          break
        case 'ArrowDown':
          e.preventDefault()
          setFocusedIndex((i) => Math.min(i + 2, len - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex((i) => Math.max(i - 2, 0))
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          selectVariation(variations[focusedIndex].id)
          break
        case 'Escape':
          e.preventDefault()
          dismissVariations()
          break
      }
    },
    [variations, focusedIndex, selectVariation, dismissVariations]
  )

  if (!variationsVisible || variations.length === 0) return null

  return (
    <div
      className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm flex flex-col"
      role="grid"
      aria-label="Variation options"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Grid */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1 p-1">
        {variations.map((v, i) => (
          <button
            key={v.id}
            onClick={() => selectVariation(v.id)}
            className={cn(
              'relative rounded-lg overflow-hidden border-2 transition-all studio-focus-visible',
              focusedIndex === i ? 'border-ih-accent' : 'border-transparent hover:border-ih-accent',
            )}
            style={{
              animation: `fade-in 0.3s ease ${i * 200}ms both`,
            }}
            tabIndex={focusedIndex === i ? 0 : -1}
            aria-label={`Select ${v.label}`}
          >
            <img
              src={v.image}
              alt={v.label}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 left-1 text-[10px] font-medium text-white bg-black/60 px-1.5 py-0.5 rounded">
              {v.label}
            </span>
          </button>
        ))}
      </div>

      {/* Dismiss */}
      <button
        onClick={dismissVariations}
        className="shrink-0 py-2 text-[12px] text-white/70 hover:text-white transition-colors text-center studio-focus-visible"
      >
        Dismiss
      </button>
    </div>
  )
}
