import Lottie from 'lottie-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type MediaType = 'video' | 'lottie' | 'image'

function detectType(src: string): MediaType {
  const ext = src.split('?')[0].split('.').pop()?.toLowerCase()
  if (ext === 'json' || ext === 'lottie') return 'lottie'
  if (['mp4', 'webm', 'mov', 'ogg'].includes(ext ?? '')) return 'video'
  return 'image'
}

interface MediaPlayerProps {
  src: string
  type?: MediaType
  className?: string
  alt?: string
}

export function MediaPlayer({ src, type, className, alt = '' }: MediaPlayerProps) {
  const resolved = type ?? detectType(src)
  const [lottieData, setLottieData] = useState<object | null>(null)

  useEffect(() => {
    if (resolved !== 'lottie') return
    fetch(src)
      .then((r) => r.json())
      .then(setLottieData)
      .catch(console.error)
  }, [src, resolved])

  if (resolved === 'video') {
    return (
      <video
        className={cn('object-cover size-full', className)}
        src={src}
        autoPlay
        loop
        muted
        playsInline
      />
    )
  }

  if (resolved === 'lottie') {
    if (!lottieData) return <div className={cn('size-full bg-[#f3f3f3] animate-pulse', className)} />
    return (
      <Lottie
        animationData={lottieData}
        loop
        autoplay
        className={cn('size-full', className)}
      />
    )
  }

  return <img src={src} alt={alt} className={cn('object-cover size-full', className)} />
}
