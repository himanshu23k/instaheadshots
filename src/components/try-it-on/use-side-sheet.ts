import { useSyncExternalStore } from 'react'
import { VERSION, useTryItOnStore } from '@/store/try-it-on-store'

const WEB = '(min-width: 1280px)'

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(WEB)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

/** Matches the `web:` breakpoint (index.css --breakpoint-web). */
export function useIsWeb(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(WEB).matches, () => false)
}

/** Flows that start from v6's Pick an outfit panel and belong beside the photo. */
const SIDE_ROOTS = new Set(['link', 'upload'])

/**
 * Whether the open stack began as a link or upload. Its later steps (reading,
 * Items found, Try this on) replace the root, so the root's name alone can't
 * tell; this is decided when the stack opens and kept until it closes.
 */
let startedAsSide = false
useTryItOnStore.subscribe((s, prev) => {
  if (!s.sheets.length) startedAsSide = false
  else if (!prev.sheets.length) startedAsSide = SIDE_ROOTS.has(s.sheets[0].name)
  // Browse our collection is the wide sheet, but what it hands on to (Try this on) moves beside the photo.
  else if (prev.sheets[0]?.name === 'builder' && s.sheets[0].name === 'try') startedAsSide = true
})

/**
 * v6 on web opens a pasted link or an upload as a sheet over the side panel,
 * like its Complete the Look sheet, rather than centred over the page — every
 * step of it — and so is the Try this on that Browse our collection hands on to.
 * Steps opened from inside the collection sheet itself stay there.
 */
export function useSideSheet(): boolean {
  const isWeb = useIsWeb()
  // Re-render whenever the stack changes; the flag above is current by then.
  useTryItOnStore((s) => s.sheets)
  return VERSION === 6 && isWeb && startedAsSide
}
