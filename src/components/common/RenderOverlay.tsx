import { Loader2 } from 'lucide-react'

interface RenderOverlayProps {
  actionName: string
  showCancel: boolean
  onCancel: () => void
}

export function RenderOverlay({
  actionName,
  showCancel,
  onCancel,
}: RenderOverlayProps) {
  return (
    <div
      className="absolute inset-0 bg-ih-overlay flex flex-col items-center justify-center gap-3 animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="w-6 h-6 text-ih-accent animate-spin" />
      <p className="text-white text-[14px]">Applying {actionName}...</p>
      {showCancel && (
        <button
          onClick={onCancel}
          className="text-[#CCCCCC] text-[12px] underline hover:text-white transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  )
}
