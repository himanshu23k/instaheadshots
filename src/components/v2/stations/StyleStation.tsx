import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { ArrowLeft, Check, Loader2, Minus, Plus } from 'lucide-react'
import { useStudioStore } from '@/store/studio-store'
import { useCreditStore } from '@/store/credit-store'
import { useStudioRender } from '@/hooks/use-studio-render'
import { CreditActionButton } from '@/components/common/CreditActionButton'
import { CollapsibleSlidePanel } from '@/components/v2/CollapsibleSlidePanel'
import { StationNextSectionButton } from '@/components/v2/StationNextSectionButton'
import { STATION_IDS } from '@/constants/stations'
import { simulateFetchProduct } from '@/services/mock-render'
import { cn } from '@/lib/utils'
import { buildStyleGoalDescription } from '@/lib/iris-station-goal-text'
import outfitsData from '@/data/outfits.json'
import type { OutfitOption, ProductInfo } from '@/types'
import type { StationId } from '@/types/studio'

const outfits = outfitsData as OutfitOption[]
const categories = ['All', 'Formal', 'Business Casual', 'Smart Casual', 'Ethnic'] as const

/** Stable id for credits when applying a shop-linked look */
const STYLE_SHOP_OPTION_ID = 'style-shop-link'

export function StyleStation() {
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [customLookOpen, setCustomLookOpen] = useState(true)
  const [shopUrl, setShopUrl] = useState('')
  const [fetchLoading, setFetchLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const outfitScrollRef = useRef<HTMLDivElement>(null)
  const fetchAbortRef = useRef<AbortController | null>(null)

  const selections = useStudioStore((s) => s.stationSelections.style)
  const updateStyle = useStudioStore((s) => s.updateStyleSelection)
  const setIrisGoalForStation = useStudioStore((s) => s.setIrisGoalForStation)
  const setActiveStation = useStudioStore((s) => s.setActiveStation)
  const { loading, error, applyAtStation } = useStudioRender()

  const selectedOutfit = selections.outfitId
  const shopProduct = selections.shopProduct

  /** Scroll no longer collapses Custom look while a shop preview is active */
  const onOutfitScroll = useCallback(() => {
    const el = outfitScrollRef.current
    if (!el || el.scrollTop <= 0) return
    if (shopProduct) return
    setCustomLookOpen(false)
  }, [shopProduct])

  const filtered = useMemo(
    () =>
      activeCategory === 'All'
        ? outfits
        : outfits.filter((o) => o.category === activeCategory),
    [activeCategory]
  )

  const hasSelection = Boolean(selectedOutfit || shopProduct)

  const optionIdForCredits = useMemo(
    () => (shopProduct ? STYLE_SHOP_OPTION_ID : selectedOutfit || ''),
    [shopProduct, selectedOutfit]
  )

  const isFree = useCreditStore((s) => s.isTransformationFree('style', optionIdForCredits))

  const [applySuccess, setApplySuccess] = useState(false)

  useEffect(() => {
    setApplySuccess(false)
  }, [optionIdForCredits])

  const nextStationId = useMemo((): StationId | null => {
    const i = STATION_IDS.indexOf('style')
    return i >= 0 && i + 1 < STATION_IDS.length ? STATION_IDS[i + 1]! : null
  }, [])

  const syncStyleIris = useCallback(() => {
    const s = useStudioStore.getState().stationSelections.style
    setIrisGoalForStation('style', buildStyleGoalDescription(s.outfitId, s.shopProduct))
  }, [setIrisGoalForStation])

  const selectPresetOutfit = useCallback(
    (outfitId: string) => {
      fetchAbortRef.current?.abort()
      setFetchError(null)
      setFetchLoading(false)
      updateStyle({ outfitId, shopProduct: null, variantId: null })
      syncStyleIris()
    },
    [updateStyle, syncStyleIris]
  )

  const backToFetchState = useCallback(() => {
    fetchAbortRef.current?.abort()
    setFetchError(null)
    setFetchLoading(false)
    updateStyle({ shopProduct: null, variantId: null })
    syncStyleIris()
  }, [updateStyle, syncStyleIris])

  /** Minus / header: collapse panel; if a shop preview was loaded, clear it (same as back). */
  const handleCustomLookHeaderClick = useCallback(() => {
    setCustomLookOpen((open) => {
      if (open) {
        if (shopProduct) {
          fetchAbortRef.current?.abort()
          setFetchError(null)
          setFetchLoading(false)
          updateStyle({ shopProduct: null, variantId: null })
          syncStyleIris()
        }
        return false
      }
      return true
    })
  }, [shopProduct, updateStyle, syncStyleIris])

  const handleFetchShop = useCallback(async () => {
    const url = shopUrl.trim()
    if (!url) return

    fetchAbortRef.current?.abort()
    const controller = new AbortController()
    fetchAbortRef.current = controller

    setFetchError(null)
    setFetchLoading(true)

    try {
      const result = await simulateFetchProduct(url, controller.signal)
      if (!result.success || !result.product) {
        setFetchError(result.error || 'Could not load product.')
        return
      }

      const p = result.product
      const heroImage = p.carouselImages?.[0] ?? p.image
      const product: ProductInfo = {
        name: p.name,
        brand: p.brand,
        price: p.price,
        image: heroImage,
        variants: [],
        carouselImages: p.carouselImages,
        sourceUrl: p.sourceUrl ?? url,
      }

      updateStyle({
        outfitId: null,
        shopProduct: product,
        variantId: null,
      })
      const st = useStudioStore.getState().stationSelections.style
      setIrisGoalForStation('style', buildStyleGoalDescription(st.outfitId, st.shopProduct))
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setFetchError('Something went wrong. Try again.')
    } finally {
      setFetchLoading(false)
    }
  }, [shopUrl, updateStyle, setIrisGoalForStation])

  const handleApply = async () => {
    if (!hasSelection) return
    const ok = await applyAtStation('style', optionIdForCredits)
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

      {/* Scrollable outfit grid — scroll collapses custom look (not while shop preview is active) */}
      <div
        ref={outfitScrollRef}
        onScroll={onOutfitScroll}
        className="flex-1 min-h-0 overflow-y-auto pr-1 studio-scroll"
      >
        <div
          className={cn(
            'transition-opacity duration-200 ease-out',
            shopProduct ? 'opacity-10' : 'opacity-100'
          )}
        >
          <p className="text-[12px] text-ih-muted font-medium mb-2">Outfits</p>
          <div className="grid grid-cols-2 gap-2">
          {filtered.map((outfit) => {
            const isSelected = selectedOutfit === outfit.id && !shopProduct
            return (
              <button
                key={outfit.id}
                type="button"
                onClick={() => selectPresetOutfit(outfit.id)}
                className="group relative aspect-square w-full rounded-lg transition-all active:scale-[0.97]"
                role="radio"
                aria-checked={isSelected}
                aria-label={outfit.name}
              >
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <img
                    src={outfit.thumbnail}
                    alt={outfit.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-skeleton-base text-ih-muted text-[11px] -z-10">
                    {outfit.name}
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-black/55 px-2 py-1 text-center text-[11px] font-medium text-white">
                    {outfit.name}
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
      </div>

      {/* Collapsible custom look from product link */}
      <div className="shrink-0 border-t border-[#E0DDD8]">
        <div className="flex w-full items-center gap-1.5 pl-1 pr-1">
          {shopProduct && (
            <button
              type="button"
              onClick={backToFetchState}
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-0 bg-transparent text-ih-muted',
                'transition-colors hover:bg-black/[0.06] hover:text-foreground active:scale-[0.98]'
              )}
              aria-label="Back to paste link"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </button>
          )}
          <button
            type="button"
            onClick={handleCustomLookHeaderClick}
            className="flex min-w-0 flex-1 items-center justify-between gap-2 py-2.5 text-left transition-colors hover:bg-black/[0.02]"
            aria-expanded={customLookOpen}
            aria-controls="style-station-custom-look-panel"
          >
            <span id="style-station-custom-look-heading" className="text-[12px] font-medium text-ih-muted">
              Custom look
            </span>
            {customLookOpen ? (
              <Minus className="h-4 w-4 shrink-0 text-ih-muted" aria-hidden />
            ) : (
              <Plus className="h-4 w-4 shrink-0 text-ih-muted" aria-hidden />
            )}
          </button>
        </div>

        <CollapsibleSlidePanel open={customLookOpen} innerClassName="pb-3">
          <div
            id="style-station-custom-look-panel"
            role="region"
            aria-labelledby="style-station-custom-look-heading"
            aria-hidden={!customLookOpen}
            className="space-y-3"
          >
            {!shopProduct ? (
              <>
                <p className="text-[11px] leading-snug text-ih-muted">
                  Paste a Myntra, Amazon, Ajio, Shopify, or other product page link. We’ll load a preview image
                  (demo).
                </p>

                <div className="flex gap-2">
                  <input
                    type="url"
                    inputMode="url"
                    value={shopUrl}
                    onChange={(e) => setShopUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleFetchShop()
                      }
                    }}
                    placeholder="https://…"
                    disabled={fetchLoading}
                    className="min-w-0 flex-1 rounded-md border border-ih-border bg-white px-2.5 py-2 text-[12px] text-foreground placeholder:text-ih-muted/70 focus:outline-none focus:ring-2 focus:ring-ih-accent/35"
                  />
                  <button
                    type="button"
                    onClick={handleFetchShop}
                    disabled={fetchLoading || !shopUrl.trim()}
                    className={cn(
                      'shrink-0 rounded-[var(--radius-btn)] px-3 py-2 text-[12px] font-medium transition-colors',
                      fetchLoading || !shopUrl.trim()
                        ? 'bg-ih-disabled text-white cursor-not-allowed'
                        : 'bg-[#2D2D2D] text-white hover:bg-primary-cta-active'
                    )}
                  >
                    {fetchLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-label="Fetching" />
                    ) : (
                      'Fetch'
                    )}
                  </button>
                </div>

                {fetchError && (
                  <p className="text-[11px] text-ih-danger" role="alert">
                    {fetchError}
                  </p>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="overflow-hidden rounded-lg border border-ih-border bg-[#FAFAFA]">
                  <img
                    src={shopProduct.image}
                    alt=""
                    loading="eager"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const el = e.currentTarget
                      if (el.src.startsWith(`${window.location.origin}/mock/`)) return
                      el.src = '/mock/outfits/outfit-05.jpg'
                    }}
                    className="aspect-[4/3] w-full min-h-[120px] object-cover bg-ih-border/30"
                  />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-[12px] font-medium leading-snug text-foreground line-clamp-2">
                    {shopProduct.name}
                  </p>
                  <p className="text-[11px] text-ih-muted">
                    {shopProduct.brand} · ₹{shopProduct.price}
                  </p>
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
            label="Apply Style"
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
