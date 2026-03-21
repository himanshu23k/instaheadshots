import { useState, useMemo } from 'react'
import { Check } from 'lucide-react'
import { useStudioStore } from '@/store/studio-store'
import { useCreditStore } from '@/store/credit-store'
import { useStudioRender } from '@/hooks/use-studio-render'
import { CreditActionButton } from '@/components/common/CreditActionButton'
import { cn } from '@/lib/utils'
import outfitsData from '@/data/outfits.json'
import type { OutfitOption } from '@/types'

const outfits = outfitsData as OutfitOption[]
const categories = ['All', 'Formal', 'Business Casual', 'Smart Casual', 'Ethnic'] as const

export function StyleStation() {
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const selections = useStudioStore((s) => s.stationSelections.style)
  const updateStyle = useStudioStore((s) => s.updateStyleSelection)
  const { loading, error, applyAtStation } = useStudioRender()

  const selectedOutfit = selections.outfitId

  const filtered = useMemo(
    () =>
      activeCategory === 'All'
        ? outfits
        : outfits.filter((o) => o.category === activeCategory),
    [activeCategory]
  )

  const isFree = useCreditStore((s) =>
    s.isTransformationFree('style', selectedOutfit || '')
  )

  const handleApply = async () => {
    if (!selectedOutfit) return
    await applyAtStation('style', selectedOutfit)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sticky category chips */}
      <div className="shrink-0 pb-3">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-3 py-1 text-[12px] font-medium rounded-[var(--radius-chip)] whitespace-nowrap transition-all active:scale-[0.95]',
                activeCategory === cat
                  ? 'bg-foreground text-white'
                  : 'bg-ih-border/50 text-ih-muted hover:text-foreground'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable outfit grid */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 studio-scroll">
        <p className="text-[12px] text-ih-muted font-medium mb-2">Outfits</p>
        <div className="grid grid-cols-2 gap-2">
          {filtered.map((outfit) => {
            const isSelected = selectedOutfit === outfit.id
            return (
              <button
                key={outfit.id}
                onClick={() => updateStyle({ outfitId: outfit.id })}
                className={cn(
                  'relative rounded-lg overflow-hidden aspect-square transition-all active:scale-[0.97]',
                  isSelected
                    ? 'ring-2 ring-ih-accent ring-offset-1'
                    : 'ring-1 ring-ih-border/40 hover:ring-ih-border'
                )}
                role="radio"
                aria-checked={isSelected}
                aria-label={outfit.name}
              >
                <img
                  src={outfit.thumbnail}
                  alt={outfit.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-skeleton-base text-ih-muted text-[11px] -z-10">
                  {outfit.name}
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-black/55 text-white text-[11px] font-medium px-2 py-1 text-center">
                  {outfit.name}
                </div>
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-ih-accent flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Apply footer */}
      <div className="shrink-0 -mx-4 px-4 py-3 bg-[#FFFFFF]" style={{ borderTop: '1px solid #E0DDD8' }}>
        {error && (
          <p className="text-ih-danger text-[12px] mb-2">{error}</p>
        )}
        <CreditActionButton
          label="Apply Style"
          cost={1}
          isFree={isFree}
          disabled={!selectedOutfit}
          loading={loading}
          onClick={handleApply}
        />
      </div>
    </div>
  )
}
