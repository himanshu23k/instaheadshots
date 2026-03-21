import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Image, Shirt, Eraser, ArrowRight, HelpCircle, X, Sparkles } from 'lucide-react'
import { Gem } from 'lucide-react'
import { useJourneyStore } from '@/store/journey-store'
import { useStudioStore } from '@/store/studio-store'
import { ImagePreview } from '@/components/common/ImagePreview'

export function EditModal() {
  const navigate = useNavigate()
  const showEditModal = useJourneyStore((s) => s.showEditModal)
  const setShowEditModal = useJourneyStore((s) => s.setShowEditModal)
  const startJourney = useJourneyStore((s) => s.startJourney)
  const galleryImages = useJourneyStore((s) => s.galleryImages)
  const selectedIndex = useJourneyStore((s) => s.selectedImageIndex)
  const enterMagicStudioFromGallery = useStudioStore((s) => s.enterMagicStudioFromGallery)
  const [showHelp, setShowHelp] = useState(false)

  if (!showEditModal) return null

  const selectedImage = galleryImages[selectedIndex]

  const quickActions = [
    {
      icon: Image,
      label: 'Change Background',
      credit: 1,
      step: 'background' as const,
    },
    {
      icon: Shirt,
      label: 'Change Outfit',
      credit: 1,
      step: 'outfit' as const,
    },
    {
      icon: Eraser,
      label: 'Edits',
      credit: 0,
      step: 'edits' as const,
    },
  ]

  return (
    <>
      {/* Blurred backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md animate-in fade-in-0 duration-200"
        onClick={() => setShowEditModal(false)}
      />

      {/* Modal content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative bg-surface rounded-[var(--radius-modal)] p-4 sm:p-6 w-full max-w-[880px] max-h-[90vh] overflow-y-auto shadow-xl pointer-events-auto animate-in fade-in-0 zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={() => setShowEditModal(false)}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 text-ih-muted hover:text-primary-cta transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Image Preview — right on desktop, hidden on mobile */}
            <div className="hidden md:flex w-full md:w-1/2 md:order-2 items-center justify-center">
              <ImagePreview
                src={selectedImage}
                alt="Your headshot"
                className="w-full max-w-[340px] aspect-[3/4] rounded-[var(--radius-preview)]"
              />
            </div>

            {/* Options panel */}
            <div className="w-full md:w-1/2 md:order-1">
              {/* Header */}
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-[18px] font-medium">What do you want to edit?</h2>
                <button
                  onClick={() => setShowHelp(true)}
                  className="text-ih-muted hover:text-primary-cta transition-colors"
                  aria-label="Help"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6 rounded-[var(--radius-btn)] border-2 border-ih-accent/35 bg-gradient-to-br from-[#E6F9F1]/80 to-surface p-1">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedImage) {
                      enterMagicStudioFromGallery(selectedImage)
                      setShowEditModal(false)
                      navigate('/edit-v2')
                    }
                  }}
                  className="w-full flex items-center gap-3 rounded-[calc(var(--radius-btn)-2px)] px-4 py-3 text-left transition-colors hover:bg-white/60"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ih-accent/15">
                    <Sparkles className="h-5 w-5 text-ih-accent" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-primary-cta">
                      Magic Studio
                    </span>
                    <span className="block text-[12px] text-ih-muted">
                      Full v2 studio — look, setting, style & refine
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-ih-muted" />
                </button>
              </div>

              {/* Quick action buttons */}
              <div className="space-y-2 mb-6">
                {quickActions.map((action) => (
                  <button
                    key={action.step}
                    onClick={() => startJourney('quick', action.step)}
                    className="w-full flex items-center gap-3 px-4 py-3 border border-ih-border rounded-[var(--radius-btn)] hover:bg-gray-50 transition-colors text-left"
                  >
                    <action.icon className="w-5 h-5 text-ih-muted flex-shrink-0" />
                    <span className="flex-1 text-[14px] text-primary-cta">
                      {action.label}
                    </span>
                    <span className="flex items-center gap-1 text-[12px] text-ih-muted">
                      {action.credit > 0 && (
                        <Gem className="w-3 h-3 text-ih-accent" />
                      )}
                      {action.credit} credit{action.credit !== 1 ? 's' : ''}
                    </span>
                    <ArrowRight className="w-4 h-4 text-ih-muted" />
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-ih-border" />
                <span className="text-[12px] text-ih-muted">or build a full look</span>
                <div className="flex-1 h-px bg-ih-border" />
              </div>

              {/* Full journey CTA */}
              <button
                onClick={() => startJourney('full')}
                className="w-full bg-primary-cta text-white rounded-[var(--radius-btn)] py-3 px-5 text-[14px] font-medium hover:bg-primary-cta-hover transition-colors"
              >
                Start Full Journey →
              </button>
              <p className="text-[12px] text-ih-muted text-center mt-2">
                Up to 4 credits — change face, posture, background, outfit & more
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-[var(--radius-modal)] p-6 w-full max-w-[440px] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-medium">How it works</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-ih-muted hover:text-primary-cta transition-colors"
                aria-label="Close help"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-[14px] text-ih-muted">
              <div className="flex gap-3">
                <span className="font-medium text-primary-cta shrink-0">1.</span>
                <p><span className="text-primary-cta font-medium">Quick Edit</span> — Pick a single edit (background, outfit, or edits) and apply it instantly.</p>
              </div>
              <div className="flex gap-3">
                <span className="font-medium text-primary-cta shrink-0">2.</span>
                <p><span className="text-primary-cta font-medium">Full Journey</span> — Walk through all 6 steps (face, posture, background, outfit, AI prompt, edits) to build a complete look.</p>
              </div>
              <div className="flex gap-3">
                <span className="font-medium text-primary-cta shrink-0">3.</span>
                <p><span className="text-primary-cta font-medium">Credits</span> — Each transformation costs credits shown next to the option. Free steps cost 0 credits.</p>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="w-full mt-5 bg-primary-cta text-white rounded-[var(--radius-btn)] py-2.5 text-[14px] font-medium hover:bg-primary-cta-hover transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  )
}
