import { cn } from '@/lib/utils'

type Props = {
  visible: boolean
  onClick: () => void
}

export function Backdrop({ visible, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      aria-hidden
      className={cn(
        'fixed inset-0 z-30 transition-opacity duration-200',
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      )}
      style={{
        background: 'rgba(240, 237, 232, 0.45)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
      }}
    />
  )
}
