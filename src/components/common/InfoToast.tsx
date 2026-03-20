import { useJourneyStore } from '@/store/journey-store'

export function InfoToast() {
  const toast = useJourneyStore((s) => s.toast)

  if (!toast.visible) return null

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-toast-bg text-white rounded-[var(--radius-alert)] px-3.5 py-2 text-[12px] max-w-[320px] text-center pointer-events-none animate-fade-in"
      role="status"
      aria-live="polite"
    >
      {toast.message}
    </div>
  )
}
