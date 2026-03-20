import { OptionCard } from './OptionCard'

interface OptionGridItem {
  id: string
  name: string
  thumbnail: string
}

interface OptionGridProps {
  items: OptionGridItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  columns?: 2 | 3
}

export function OptionGrid({
  items,
  selectedId,
  onSelect,
  columns = 2,
}: OptionGridProps) {
  return (
    <div
      className={`grid gap-3 ${columns === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}
      role="radiogroup"
    >
      {items.map((item) => (
        <OptionCard
          key={item.id}
          id={item.id}
          name={item.name}
          thumbnail={item.thumbnail}
          selected={item.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
