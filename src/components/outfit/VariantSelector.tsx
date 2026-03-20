interface Variant {
  id: string
  color: string
  hex: string
}

interface VariantSelectorProps {
  variants: Variant[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function VariantSelector({
  variants,
  selectedId,
  onSelect,
}: VariantSelectorProps) {
  const maxVisible = 6
  const visible = variants.slice(0, maxVisible)
  const overflow = variants.length - maxVisible

  return (
    <div>
      <p className="text-[12px] font-medium mb-2">Which color?</p>
      <div className="flex items-center gap-2">
        {visible.map((v) => (
          <button
            key={v.id}
            onClick={() => onSelect(v.id)}
            className={`w-4 h-4 rounded-full transition-all ${
              v.id === selectedId
                ? 'ring-2 ring-ih-accent ring-offset-1'
                : 'border border-ih-border'
            }`}
            style={{ backgroundColor: v.hex }}
            aria-label={v.color}
            title={v.color}
          />
        ))}
        {overflow > 0 && (
          <span className="text-[12px] text-ih-muted">+{overflow} more</span>
        )}
      </div>
    </div>
  )
}
