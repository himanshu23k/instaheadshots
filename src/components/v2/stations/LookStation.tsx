import { useState, useMemo } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStudioStore } from '@/store/studio-store'
import { useCreditStore } from '@/store/credit-store'
import { useStudioRender } from '@/hooks/use-studio-render'
import { CreditActionButton } from '@/components/common/CreditActionButton'
import { cn } from '@/lib/utils'
import facesData from '@/data/faces.json'
import posturesData from '@/data/postures.json'
import type { FaceOption, PostureOption } from '@/types'

const faces = facesData as FaceOption[]
const postures = posturesData as PostureOption[]
const POSTURES_PER_PAGE = 4

// ── Posture Silhouette SVGs ──
// Human silhouettes: separate head, torso, legs — viewBox 0 0 28 44, fill #9B9B9B
function PostureSilhouette({ postureId }: { postureId: string }) {
  const svgProps = { width: 28, height: 44, viewBox: '0 0 28 44', fill: '#9B9B9B', xmlns: 'http://www.w3.org/2000/svg' }

  switch (postureId) {
    case 'posture-straight':
      return (
        <svg {...svgProps}>
          <circle cx="14" cy="7" r="5.5" />
          <path d="M7 16 C7 14, 21 14, 21 16 L21 28 L7 28 Z" />
          <rect x="8" y="29" width="4.5" height="12" rx="2" />
          <rect x="15.5" y="29" width="4.5" height="12" rx="2" />
        </svg>
      )
    case 'posture-3q-left':
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="7" r="5.5" />
          <path d="M5 16 C5 14, 19 14, 19 16 L18 28 L6 28 Z" transform="rotate(-6 12 21)" />
          <rect x="6" y="29" width="4.5" height="12" rx="2" transform="rotate(-6 8 35)" />
          <rect x="13" y="29" width="4.5" height="12" rx="2" transform="rotate(-6 15 35)" />
        </svg>
      )
    case 'posture-3q-right':
      return (
        <svg {...svgProps}>
          <circle cx="16" cy="7" r="5.5" />
          <path d="M9 16 C9 14, 23 14, 23 16 L22 28 L10 28 Z" transform="rotate(6 16 21)" />
          <rect x="10.5" y="29" width="4.5" height="12" rx="2" transform="rotate(6 13 35)" />
          <rect x="18" y="29" width="4.5" height="12" rx="2" transform="rotate(6 20 35)" />
        </svg>
      )
    case 'posture-profile-left':
      return (
        <svg {...svgProps}>
          <circle cx="10" cy="7" r="5.5" />
          <path d="M4 16 C4 14, 17 14, 17 16 L16 28 L5 28 Z" transform="rotate(-15 10 21)" />
          <rect x="5" y="29" width="4.5" height="12" rx="2" transform="rotate(-10 7 35)" />
          <rect x="12" y="29" width="4.5" height="12" rx="2" transform="rotate(-10 14 35)" />
        </svg>
      )
    case 'posture-profile-right':
      return (
        <svg {...svgProps}>
          <circle cx="18" cy="7" r="5.5" />
          <path d="M11 16 C11 14, 24 14, 24 16 L23 28 L12 28 Z" transform="rotate(15 18 21)" />
          <rect x="12" y="29" width="4.5" height="12" rx="2" transform="rotate(10 14 35)" />
          <rect x="19" y="29" width="4.5" height="12" rx="2" transform="rotate(10 21 35)" />
        </svg>
      )
    case 'posture-lean':
      return (
        <svg {...svgProps}>
          <circle cx="14" cy="7" r="5.5" />
          <path d="M7 16 C7 14, 21 14, 21 16 L20 28 L8 28 Z" transform="rotate(5 14 21)" />
          <rect x="8.5" y="29" width="4.5" height="12" rx="2" transform="rotate(3 11 35)" />
          <rect x="15.5" y="29" width="4.5" height="12" rx="2" transform="rotate(3 18 35)" />
        </svg>
      )
    case 'posture-arms-crossed':
      return (
        <svg {...svgProps}>
          <circle cx="14" cy="7" r="5.5" />
          <path d="M7 16 C7 14, 21 14, 21 16 L21 28 L7 28 Z" />
          <rect x="6" y="21" width="16" height="3" rx="1.5" />
          <rect x="8" y="29" width="4.5" height="12" rx="2" />
          <rect x="15.5" y="29" width="4.5" height="12" rx="2" />
        </svg>
      )
    case 'posture-standing':
      return (
        <svg {...svgProps}>
          <circle cx="14" cy="5.5" r="4.5" />
          <path d="M8 13 C8 11, 20 11, 20 13 L20 24 L8 24 Z" />
          <rect x="9" y="25" width="4" height="15" rx="2" />
          <rect x="15" y="25" width="4" height="15" rx="2" />
        </svg>
      )
    default:
      return (
        <svg {...svgProps}>
          <circle cx="14" cy="7" r="5.5" />
          <rect x="7" y="15" width="14" height="20" rx="3" />
        </svg>
      )
  }
}

export function LookStation() {
  const [posturePage, setPosturePage] = useState(0)
  const selections = useStudioStore((s) => s.stationSelections.look)
  const updateLook = useStudioStore((s) => s.updateLookSelection)
  const { loading, error, applyAtStation } = useStudioRender()

  const selectedFace = selections.faceId
  const selectedPosture = selections.postureId

  const optionId = useMemo(
    () => `${selectedFace || 'none'}-${selectedPosture || 'none'}`,
    [selectedFace, selectedPosture]
  )

  const isFree = useCreditStore((s) => s.isTransformationFree('look', optionId))
  const canApply = selectedFace || selectedPosture

  const totalPages = Math.ceil(postures.length / POSTURES_PER_PAGE)
  const pagedPostures = postures.slice(
    posturePage * POSTURES_PER_PAGE,
    (posturePage + 1) * POSTURES_PER_PAGE
  )

  const handleApply = async () => {
    if (!canApply) return
    await applyAtStation('look', optionId)
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Region 1: Scrollable face grid ── */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 studio-scroll">
        <p className="text-[12px] text-ih-muted font-medium mb-2">Face</p>
        <div className="grid grid-cols-2 gap-2">
          {faces.map((face) => {
            const isSelected = selectedFace === face.id
            return (
              <button
                key={face.id}
                onClick={() => updateLook({ faceId: face.id })}
                className={cn(
                  'relative rounded-lg overflow-hidden h-[100px] transition-all active:scale-[0.97]',
                  isSelected
                    ? 'ring-2 ring-ih-accent ring-offset-1'
                    : 'ring-1 ring-ih-border/40 hover:ring-ih-border'
                )}
                role="radio"
                aria-checked={isSelected}
                aria-label={face.name}
              >
                <img
                  src={face.thumbnail}
                  alt={face.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-skeleton-base text-ih-muted text-[11px] -z-10">
                  {face.name}
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-black/55 text-white text-[11px] font-medium px-2 py-1 text-center">
                  {face.name}
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

      {/* ── Region 2: Sticky paginated posture bar ── */}
      <div className="shrink-0 py-3" style={{ borderTop: '1px solid #E0DDD8' }}>
        <p className="text-[12px] text-ih-muted font-medium mb-2">Posture</p>

        <div className="flex items-center gap-1">
          {/* Left arrow */}
          <button
            onClick={() => setPosturePage((p) => Math.max(0, p - 1))}
            disabled={posturePage === 0}
            className="shrink-0 w-6 h-6 flex items-center justify-center text-ih-muted hover:text-foreground disabled:opacity-20 disabled:pointer-events-none transition-colors"
            aria-label="Previous postures"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* 4 posture tiles */}
          <div className="flex-1 grid grid-cols-4 gap-1.5">
            {pagedPostures.map((posture) => {
              const isSelected = selectedPosture === posture.id
              return (
                <button
                  key={posture.id}
                  onClick={() => updateLook({ postureId: posture.id })}
                  className={cn(
                    'flex flex-col items-center gap-0.5 py-1.5 px-0.5 rounded-lg transition-all active:scale-[0.95]',
                    isSelected
                      ? 'bg-ih-accent-bg ring-2 ring-ih-accent'
                      : 'bg-ih-border/20 hover:bg-ih-border/40'
                  )}
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={posture.name}
                >
                  <div className="w-[28px] h-[44px] flex items-center justify-center">
                    <PostureSilhouette postureId={posture.id} />
                  </div>
                  <span className={cn(
                    'text-[10px] leading-tight text-center line-clamp-1',
                    isSelected ? 'text-ih-accent font-medium' : 'text-ih-muted'
                  )}>
                    {posture.name}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => setPosturePage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={posturePage >= totalPages - 1}
            className="shrink-0 w-6 h-6 flex items-center justify-center text-ih-muted hover:text-foreground disabled:opacity-20 disabled:pointer-events-none transition-colors"
            aria-label="Next postures"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Page dots — centered below tiles */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1 mt-2 w-full">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPosturePage(i)}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all',
                  i === posturePage ? 'bg-foreground scale-125' : 'bg-ih-disabled hover:bg-ih-muted'
                )}
                aria-label={`Posture page ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Region 3: Apply button footer ── */}
      <div className="shrink-0 -mx-4 px-4 py-3 bg-[#FFFFFF]" style={{ borderTop: '1px solid #E0DDD8' }}>
        {error && (
          <p className="text-ih-danger text-[12px] mb-2">{error}</p>
        )}
        <CreditActionButton
          label="Apply Look"
          cost={1}
          isFree={isFree}
          disabled={!canApply}
          loading={loading}
          onClick={handleApply}
        />
      </div>
    </div>
  )
}
