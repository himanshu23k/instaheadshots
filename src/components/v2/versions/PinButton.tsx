import { useCallback } from 'react'
import { Download, Pin, Share2 } from 'lucide-react'
import { useStudioStore } from '@/store/studio-store'
import { cn } from '@/lib/utils'

const actionBtnClass =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface/90 text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent/40'

export function PinButton() {
  const pinVersion = useStudioStore((s) => s.pinVersion)
  const pinnedCount = useStudioStore((s) => s.pinnedVersions.length)
  const revealPhase = useStudioStore((s) => s.revealPhase)
  const sourceImage = useStudioStore((s) => s.sourceImage)
  const currentComposite = useStudioStore((s) => s.currentComposite)

  const handleDownload = useCallback(async () => {
    const url = currentComposite
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const ext = blob.type.includes('png') ? 'png' : blob.type.includes('jpeg') || blob.type.includes('jpg') ? 'jpg' : 'png'
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `instaheadshots-${Date.now()}.${ext}`
      a.rel = 'noopener'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(blobUrl)
    } catch {
      const a = document.createElement('a')
      a.href = url
      a.download = 'headshot.png'
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      a.remove()
    }
  }, [currentComposite])

  const handleShare = useCallback(async () => {
    const shareUrl = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Instaheadshots',
          text: 'My headshot preview',
          url: shareUrl,
        })
        return
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
    }
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      // ignore
    }
  }, [])

  const hasTransformation = currentComposite !== sourceImage
  if (!hasTransformation) return null

  if (revealPhase !== 'complete' && revealPhase !== 'idle') return null
  if (pinnedCount >= 6) return null

  return (
    <div
      className="flex items-center gap-2"
      style={{ animation: 'fade-in 0.3s ease' }}
    >
      <button
        type="button"
        onClick={handleDownload}
        className={cn(actionBtnClass)}
        aria-label="Download image"
      >
        <Download className="h-4 w-4" strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={handleShare}
        className={cn(actionBtnClass)}
        aria-label="Share"
      >
        <Share2 className="h-4 w-4" strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={() => pinVersion()}
        className="flex items-center gap-1.5 rounded-full bg-surface/90 px-3 py-1.5 text-[12px] font-medium text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent/40"
        aria-label="Pin this version"
      >
        <Pin className="h-3.5 w-3.5" />
        <span>Pin</span>
      </button>
    </div>
  )
}
