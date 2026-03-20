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
  mobileColumns?: 2 | 3
}

export function OptionGrid({
  items,
  selectedId,
  onSelect,
  columns = 2,
  mobileColumns,
}: OptionGridProps) {
  const mobile = mobileColumns ?? Math.min(columns, 2) as 2 | 3
  const colClass =
    mobile === 2 && columns === 3
      ? 'grid-cols-2 sm:grid-cols-3'
      : mobile === 3 && columns === 3
      ? 'grid-cols-3'
      : 'grid-cols-2'

  return (
    <div
      className={`grid gap-2 sm:gap-3 ${colClass}`}
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
