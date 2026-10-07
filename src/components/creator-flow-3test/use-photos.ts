import { useCallback, useEffect, useRef, useState } from 'react'

export const MIN_PHOTOS = 3
export const VARIETY_PHOTOS = 10
export const MAX_PHOTOS = 15

export type Photo = {
  id: string
  /** name + size + lastModified, to catch the same file picked twice. */
  key: string
  url: string
  /** Blurred while it "uploads" (the old flow's 385:3496 state), then sharp. */
  uploading: boolean
}

export type Toast = { id: number; message: string }

const fileKey = (f: File) => `${f.name}:${f.size}:${f.lastModified}`

/** ?photos=N starts the page with N mock photos, to review each state of the meter. */
function demoPhotos(max: number): Photo[] {
  const n = Math.min(max, Math.max(0, Number(new URLSearchParams(window.location.search).get('photos')) || 0))
  return Array.from({ length: n }, (_, i) => {
    const url = `/mock/faces/face-${String((i % 12) + 1).padStart(2, '0')}.jpg`
    return { id: `demo-${i}`, key: `demo-${i}`, url, uploading: false }
  })
}

/**
 * The upload screen's photos, held locally: there is no backend yet, so each
 * file becomes an object URL and "uploads" for a beat before it settles.
 */
export function usePhotos(max = MAX_PHOTOS) {
  const [photos, setPhotos] = useState<Photo[]>(() => demoPhotos(max))
  const [toast, setToast] = useState<Toast | null>(null)
  const photosRef = useRef(photos)
  const timers = useRef<number[]>([])

  useEffect(() => {
    photosRef.current = photos
  }, [photos])

  // Object URLs and pending timers outlive the page otherwise.
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
      photosRef.current.forEach((p) => URL.revokeObjectURL(p.url))
    },
    [],
  )

  const showToast = useCallback((message: string) => setToast({ id: Date.now(), message }), [])
  const dismissToast = useCallback(() => setToast(null), [])

  const addFiles = useCallback(
    (list: FileList | File[]) => {
      const files = Array.from(list).filter((f) => f.type.startsWith('image/'))
      if (!files.length) return

      const current = photosRef.current
      const seen = new Set(current.map((p) => p.key))
      let duplicate = false
      const fresh: Photo[] = []
      for (const f of files) {
        const key = fileKey(f)
        if (seen.has(key)) {
          duplicate = true
          continue
        }
        seen.add(key)
        fresh.push({ id: crypto.randomUUID(), key, url: URL.createObjectURL(f), uploading: true })
      }

      const room = max - current.length
      const kept = fresh.slice(0, room)
      fresh.slice(room).forEach((p) => URL.revokeObjectURL(p.url))

      if (fresh.length > room) showToast(`You can add up to ${max} photos`)
      else if (duplicate) showToast('This photo has already been uploaded')
      if (!kept.length) return

      setPhotos([...current, ...kept])
      kept.forEach((p, i) => {
        const t = window.setTimeout(() => {
          setPhotos((ps) => ps.map((x) => (x.id === p.id ? { ...x, uploading: false } : x)))
        }, 700 + i * 180)
        timers.current.push(t)
      })
    },
    [max, showToast],
  )

  const removePhoto = useCallback((id: string) => {
    setPhotos((ps) => {
      const gone = ps.find((p) => p.id === id)
      if (gone) URL.revokeObjectURL(gone.url)
      return ps.filter((p) => p.id !== id)
    })
  }, [])

  return { photos, addFiles, removePhoto, toast, dismissToast }
}
