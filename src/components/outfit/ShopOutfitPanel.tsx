import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { simulateFetchProduct } from '@/services/mock-render'
import { VariantSelector } from './VariantSelector'

interface ShopOutfitPanelProps {
  onSelectOutfit: (outfitId: string, label: string, thumbnail: string) => void
}

export function ShopOutfitPanel({ onSelectOutfit }: ShopOutfitPanelProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [product, setProduct] = useState<{
    name: string
    brand: string
    price: string
    image: string
    variants: Array<{ id: string; color: string; hex: string }>
  } | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [showCancelFetch, setShowCancelFetch] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const handleFetch = useCallback(async () => {
    if (!url.trim()) return

    setError(null)
    setProduct(null)
    setLoading(true)
    setShowCancelFetch(false)

    const controller = new AbortController()
    abortRef.current = controller

    const cancelTimer = setTimeout(() => setShowCancelFetch(true), 5000)

    try {
      const result = await simulateFetchProduct(url, controller.signal)
      clearTimeout(cancelTimer)

      if (result.success && result.product) {
        setProduct(result.product)
        setSelectedVariant(result.product.variants[0]?.id || null)
      } else {
        setError(result.error || 'Failed to fetch product.')
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // Cancelled
      } else {
        setError('The fetch timed out. Check your connection and try again.')
      }
    } finally {
      clearTimeout(cancelTimer)
      setLoading(false)
      setShowCancelFetch(false)
    }
  }, [url])

  const handleCancelFetch = () => {
    abortRef.current?.abort()
  }

  const handleUseOutfit = () => {
    if (!product) return
    const variantLabel = selectedVariant
      ? product.variants.find((v) => v.id === selectedVariant)?.color
      : ''
    const label = `${product.name}${variantLabel ? ` (${variantLabel})` : ''}`
    onSelectOutfit(`shop-${Date.now()}`, label, product.image)
  }

  return (
    <div>
      <p className="text-[14px] font-medium mb-1">Paste a product link</p>
      <p className="text-[12px] text-ih-muted mb-3">Myntra and Ajio supported.</p>

      <div className="flex gap-2 mb-3">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste product URL..."
          className="flex-1 border-ih-border text-[14px]"
          disabled={loading}
        />
        <Button
          onClick={handleFetch}
          disabled={loading || !url.trim()}
          className="bg-primary-cta text-white hover:bg-primary-cta-hover text-[14px] font-medium px-4"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
              Fetching...
            </>
          ) : (
            'Fetch →'
          )}
        </Button>
      </div>

      {loading && (
        <div>
          <p className="text-[12px] text-ih-muted">Fetching product details...</p>
          {showCancelFetch && (
            <button
              onClick={handleCancelFetch}
              className="text-[12px] underline text-ih-muted hover:text-primary-cta mt-1"
            >
              Cancel fetch
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="text-ih-danger text-[12px] mb-3" role="alert">
          {error}
        </p>
      )}

      {product && (
        <div className="border border-ih-border rounded-[var(--radius-card)] p-3 mb-3">
          <div className="flex gap-3">
            <img
              src={product.image}
              alt={product.name}
              className="w-16 h-16 rounded-[var(--radius-btn)] object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium line-clamp-2">{product.name}</p>
              <p className="text-[12px] text-ih-muted">{product.brand}</p>
              <p className="text-[12px] text-ih-muted">Rs. {product.price}</p>
            </div>
          </div>

          {product.variants.length > 1 && (
            <div className="mt-3">
              <VariantSelector
                variants={product.variants}
                selectedId={selectedVariant}
                onSelect={setSelectedVariant}
              />
            </div>
          )}

          <Button
            onClick={handleUseOutfit}
            className="w-full mt-3 bg-primary-cta text-white hover:bg-primary-cta-hover"
          >
            Use This Outfit
          </Button>
        </div>
      )}
    </div>
  )
}
