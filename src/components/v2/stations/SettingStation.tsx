import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { Check, Minus, Plus, Upload, X } from 'lucide-react'
import { useStudioStore } from '@/store/studio-store'
import { useCreditStore } from '@/store/credit-store'
import { useStudioRender } from '@/hooks/use-studio-render'
import { CreditActionButton } from '@/components/common/CreditActionButton'
import { CollapsibleSlidePanel } from '@/components/v2/CollapsibleSlidePanel'
import { StationNextSectionButton } from '@/components/v2/StationNextSectionButton'
import { STATION_IDS } from '@/constants/stations'
import { cn } from '@/lib/utils'
import { buildSettingGoalDescription } from '@/lib/iris-station-goal-text'
import type { StationId } from '@/types/studio'
import backgroundsData from '@/data/backgrounds.json'
import type { BackgroundOption } from '@/types'

const backgrounds = backgroundsData as BackgroundOption[]
const categories = ['All', 'Studio', 'Outdoor', 'Location'] as const

/** Stable id for credit / free-transform tracking when using an uploaded background */
const SETTING_CUSTOM_OPTION_ID = 'custom-upload'

export function SettingStation() {
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [uploadOpen, setUploadOpen] = useState(true)
  const bgScrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onBgScroll = useCallback(() => {
    const el = bgScrollRef.current
    if (!el || el.scrollTop <= 0) return
    setUploadOpen(false)
  }, [])

  const selections = useStudioStore((s) => s.stationSelections.setting)
  const updateSetting = useStudioStore((s) => s.updateSettingSelection)
  const setIrisGoalForStation = useStudioStore((s) => s.setIrisGoalForStation)
  const setActiveStation = useStudioStore((s) => s.setActiveStation)
  const { loading, error, applyAtStation } = useStudioRender()

  const selectedBg = selections.backgroundId
  const customUpload = selections.customUpload

  const revokeIfBlob = useCallback((url: string | null) => {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
  }, [])

  const selectPresetBackground = useCallback(
    (bgId: string) => {
      revokeIfBlob(customUpload)
      updateSetting({ backgroundId: bgId, customUpload: null })
      const s = useStudioStore.getState().stationSelections.setting
      setIrisGoalForStation('setting', buildSettingGoalDescription(s.backgroundId, s.customUpload))
    },
    [customUpload, revokeIfBlob, updateSetting, setIrisGoalForStation]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file) return
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return

      revokeIfBlob(customUpload)
      const url = URL.createObjectURL(file)
      updateSetting({ backgroundId: null, customUpload: url })
      const s = useStudioStore.getState().stationSelections.setting
      setIrisGoalForStation('setting', buildSettingGoalDescription(s.backgroundId, s.customUpload))
    },
    [customUpload, revokeIfBlob, updateSetting, setIrisGoalForStation]
  )

  const clearCustomUpload = useCallback(() => {
    revokeIfBlob(customUpload)
    updateSetting({ customUpload: null })
    const s = useStudioStore.getState().stationSelections.setting
    setIrisGoalForStation('setting', buildSettingGoalDescription(s.backgroundId, s.customUpload))
  }, [customUpload, revokeIfBlob, updateSetting, setIrisGoalForStation])

  const filtered = useMemo(
    () =>
      activeCategory === 'All'
        ? backgrounds
        : backgrounds.filter((b) => b.category === activeCategory),
    [activeCategory]
  )

  const hasSelection = Boolean(selectedBg || customUpload)

  const optionIdForCredits = useMemo(
    () => (customUpload ? SETTING_CUSTOM_OPTION_ID : selectedBg || ''),
    [customUpload, selectedBg]
  )

  const isFree = useCreditStore((s) => s.isTransformationFree('setting', optionIdForCredits))

  const [applySuccess, setApplySuccess] = useState(false)

  useEffect(() => {
    setApplySuccess(false)
  }, [optionIdForCredits])

  const nextStationId = useMemo((): StationId | null => {
    const i = STATION_IDS.indexOf('setting')
    return i >= 0 && i + 1 < STATION_IDS.length ? STATION_IDS[i + 1]! : null
  }, [])

  const handleApply = async () => {
    if (!hasSelection) return
    const ok = await applyAtStation('setting', optionIdForCredits)
    if (ok) setApplySuccess(true)
  }

  const goToNextSection = () => {
    if (nextStationId) setActiveStation(nextStationId)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sticky category chips */}
      <div className="shrink-0 pb-3">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-3 py-1 text-[12px] font-medium rounded-[var(--radius-chip)] whitespace-nowrap transition-all active:scale-[0.95]',
                activeCategory === cat
                  ? 'bg-foreground text-white'
                  : 'bg-ih-border/50 text-ih-muted hover:text-foreground'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable background grid — scroll collapses upload section */}
      <div
        ref={bgScrollRef}
        onScroll={onBgScroll}
        className="flex-1 min-h-0 overflow-y-auto pr-1 studio-scroll"
      >
        <p className="text-[12px] text-ih-muted font-medium mb-2">Backgrounds</p>
        <div className="grid grid-cols-2 gap-2">
          {filtered.map((bg) => {
            const isSelected = selectedBg === bg.id && !customUpload
            return (
              <button
                key={bg.id}
                type="button"
                onClick={() => selectPresetBackground(bg.id)}
                className="group relative aspect-[4/3] w-full rounded-lg transition-all active:scale-[0.97]"
                role="radio"
                aria-checked={isSelected}
                aria-label={bg.name}
              >
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <img
                    src={bg.thumbnail}
                    alt={bg.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-skeleton-base text-ih-muted text-[11px] -z-10">
                    {bg.name}
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-black/55 px-2 py-1 text-center text-[11px] font-medium text-white">
                    {bg.name}
                  </div>
                  {isSelected && (
                    <div className="absolute right-1.5 top-1.5 z-[4] flex h-5 w-5 items-center justify-center rounded-full bg-ih-accent shadow-sm">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'pointer-events-none absolute inset-0 z-[3] rounded-lg',
                      isSelected
                        ? 'shadow-[inset_0_0_0_2px_var(--color-ih-accent)]'
                        : 'shadow-[inset_0_0_0_1px_rgba(224,221,216,0.65)] group-hover:shadow-[inset_0_0_0_1px_var(--color-ih-border)]'
                    )}
                    aria-hidden
                  />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Collapsible upload — same pattern as Look posture; smooth slide via CollapsibleSlidePanel */}
      <div className="shrink-0 border-t border-[#E0DDD8]">
        <button
          type="button"
          onClick={() => setUploadOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 py-2.5 text-left transition-colors hover:bg-black/[0.02]"
          aria-expanded={uploadOpen}
          aria-controls="setting-station-upload-panel"
          id="setting-station-upload-heading"
        >
          <div className="min-w-0">
            <span className="text-[12px] font-medium text-ih-muted">Upload background</span>
          </div>
          {uploadOpen ? (
            <Minus className="h-4 w-4 shrink-0 text-ih-muted" aria-hidden />
          ) : (
            <Plus className="h-4 w-4 shrink-0 text-ih-muted" aria-hidden />
          )}
        </button>

        <CollapsibleSlidePanel open={uploadOpen} innerClassName="pb-3">
          <div
            id="setting-station-upload-panel"
            role="region"
            aria-labelledby="setting-station-upload-heading"
            aria-hidden={!uploadOpen}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-ih-border bg-[#FAFAFA] px-3 py-4 text-center transition-colors',
                'hover:border-ih-muted hover:bg-ih-border/15 active:scale-[0.99]'
              )}
            >
              <Upload className="h-6 w-6 text-ih-muted" aria-hidden />
              <span className="text-[12px] font-medium text-foreground">Choose image</span>
              <span className="text-[10px] text-ih-muted">JPG, PNG or WebP · max 10 MB</span>
            </button>

            {customUpload && (
              <div className="relative mt-2 overflow-hidden rounded-lg border border-ih-border bg-white">
                <img
                  src={customUpload}
                  alt="Uploaded background preview"
                  className="aspect-[4/3] w-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearCustomUpload}
                  className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white shadow-sm transition-colors hover:bg-black/75"
                  aria-label="Remove uploaded background"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-black/55 px-2 py-1 text-center text-[11px] font-medium text-white">
                  Custom upload
                </div>
              </div>
            )}
          </div>
        </CollapsibleSlidePanel>
      </div>

      {/* Apply footer */}
      <div className="shrink-0 -mx-4 px-4 py-3 bg-[#FFFFFF]" style={{ borderTop: '1px solid #E0DDD8' }}>
        {error && (
          <p className="text-ih-danger text-[12px] mb-2">{error}</p>
        )}
        <div className="flex gap-2 items-stretch">
          <CreditActionButton
            label="Apply Setting"
            cost={1}
            isFree={isFree}
            disabled={!hasSelection}
            loading={loading}
            onClick={handleApply}
            className="flex-1 min-w-0 w-auto"
          />
          <StationNextSectionButton
            show={applySuccess}
            nextStationId={nextStationId}
            onGoNext={goToNextSection}
          />
        </div>
      </div>
    </div>
  )
}
