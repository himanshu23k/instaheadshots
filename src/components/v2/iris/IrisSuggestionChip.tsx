import { useStudioStore } from '@/store/studio-store'
import type { IrisSuggestion } from '@/types/studio'

interface IrisSuggestionChipProps {
  suggestion: IrisSuggestion
}

export function IrisSuggestionChip({ suggestion }: IrisSuggestionChipProps) {
  const setActiveStation = useStudioStore((s) => s.setActiveStation)
  const pinVersion = useStudioStore((s) => s.pinVersion)

  const handleClick = () => {
    if (suggestion.type === 'pin') {
      pinVersion()
      return
    }

    if (suggestion.station) {
      setActiveStation(suggestion.station)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="px-3 py-1.5 bg-surface/90 backdrop-blur-sm rounded-full text-[12px] text-foreground shadow-sm hover:shadow-md hover:bg-surface transition-all border border-ih-border/30 max-w-[280px] text-left"
      role="status"
    >
      <span className="text-ih-accent font-medium">Iris: </span>
      {suggestion.text}
    </button>
  )
}
