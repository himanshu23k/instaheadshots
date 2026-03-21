import { useStudioStore } from '@/store/studio-store'
import { IrisSuggestionChip } from './IrisSuggestionChip'

export function IrisSuggestionBar() {
  const suggestions = useStudioStore((s) => s.irisSuggestions)

  if (suggestions.length === 0) return null

  return (
    <div
      className="flex gap-2 px-4 py-1.5 overflow-x-auto scrollbar-hide justify-center shrink-0"
      aria-live="polite"
      aria-label="Iris suggestions"
    >
      {suggestions.map((s) => (
        <IrisSuggestionChip key={s.id} suggestion={s} />
      ))}
    </div>
  )
}
