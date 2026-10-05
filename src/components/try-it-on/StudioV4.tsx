import { useEffect, useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { currentLook, useTryItOnStore, type Look } from '@/store/try-it-on-store'
import { BannerSlot, LookCard, PendingCard, StudioScreens } from './Studio'
import { AttirePanel, PanelBody, PanelDock, PanelHeading } from './sheets/outfit-panel'
import { Credits, PrimaryButton } from './ui'
import { C, FONT } from './tokens'

/** The photo: your base, the render in progress, or the look you're on. */
function PhotoCard() {
  const view = useTryItOnStore((s) => s.view)
  const base = useTryItOnStore((s) => s.base)
  const genSource = useTryItOnStore((s) => s.genSource)
  const look = useTryItOnStore((s) => (s.view.name === 'look' ? currentLook(s) : null))
  if (view.name === 'pending') return <PendingCard source={genSource} />
  if (look) return <LookCard key={look.id} look={look} isBase={false} active startFresh />
  return <LookCard look={base} isBase active />
}

/**
 * Figma "option" (3391:14792): the looks you've made, newest first, with your
 * base at the bottom. The one on screen is larger with a black ring; tapping
 * another opens it, and the base starts afresh.
 */
function LookRail() {
  const looks = useTryItOnStore((s) => s.looks)
  const base = useTryItOnStore((s) => s.base)
  const shown = useTryItOnStore(currentLook)
  const pending = useTryItOnStore((s) => s.view.name === 'pending')
  const setView = useTryItOnStore((s) => s.setView)
  const createNewLook = useTryItOnStore((s) => s.createNewLook)
  if (!looks.length) return null

  const open = (look: Look) => {
    if (look.id === 'base') return createNewLook()
    setView({ name: 'look', id: look.id })
  }

  return (
    // The tiles' shadows reach ~28px past them, and a scroll box clips at its edges;
    // -m/p gives them that room while the tiles stay where they were.
    <div className="scrollbar-hide -m-7 flex max-h-[calc(100%+56px)] flex-col items-end gap-3 overflow-y-auto p-7">
      {[...looks.slice(0, 4), base].map((look) => {
        const on = !pending && look.id === shown.id
        return (
          <button
            key={look.id}
            type="button"
            onClick={() => open(look)}
            disabled={pending}
            aria-pressed={on}
            aria-label={look.id === 'base' ? 'Your base photo' : `Look: ${look.pieces.filter((p) => p.source !== 'base').map((p) => p.name).join(', ')}`}
            className="shrink-0 overflow-hidden transition-[width,height] duration-200 disabled:opacity-60"
            style={{
              width: on ? 60 : 52,
              height: on ? 60 : 52,
              borderRadius: on ? 8 : 6,
              border: on ? `1.5px solid ${C.text}` : `1px solid ${C.grey12}`,
              boxShadow: on ? '0 -2px 12px rgba(0,0,0,0.06)' : '0 4px 24px rgba(0,0,0,0.1)',
              background: '#EBEBEB',
            }}
          >
            <img src={look.render.image} alt="" className="size-full object-cover object-top" />
          </button>
        )
      })}
    </div>
  )
}

/**
 * v4 (Figma p3OWFjk2XX1hlhkspVe7qQ 3390:229694 → 3391:14701). One panel picks
 * an outfit on the base and completes it on a look: Top Picks, the collection
 * sheet and pasted links all add to the pieces shown above its Create, and View
 * Attire shows them as v2's slot grid. On web the panel sits beside the photo;
 * on the phone it's the sheet Pick an Outfit / Complete the Look opens.
 */
export function StudioV4({ onBack }: { onBack: () => void }) {
  const credits = useTryItOnStore((s) => s.credits)
  const view = useTryItOnStore((s) => s.view)
  const genFrom = useTryItOnStore((s) => s.genFrom)
  const startDraft = useTryItOnStore((s) => s.startDraft)
  const setView = useTryItOnStore((s) => s.setView)
  const openSheet = useTryItOnStore((s) => s.openSheet)
  const hasTrials = useTryItOnStore((s) => s.looks.length > 0)
  const shownId = useTryItOnStore((s) => (s.view.name === 'look' ? s.view.id : null))
  const setDraftPieces = useTryItOnStore((s) => s.setDraftPieces)
  const [attire, setAttire] = useState(false)

  useEffect(() => startDraft(), [startDraft])

  // Opening a different look (a past trial, the rail) means completing that one, so the panel picks up its pieces.
  const lastShown = useRef(shownId)
  useEffect(() => {
    if (!shownId || shownId === lastShown.current) return
    lastShown.current = shownId
    const look = useTryItOnStore.getState().looks.find((l) => l.id === shownId)
    if (look) setDraftPieces(look.pieces.filter((p) => p.source !== 'base'))
  }, [shownId, setDraftPieces])

  // From a look, back returns to Past Trials when there are any (as in v1–v3).
  // The only back in the flow: it closes View Attire first, then works as in v1–v3.
  const goBack = () => {
    if (attire) return setAttire(false)
    if (view.name === 'home') return onBack()
    setView({ name: 'home', panel: hasTrials ? 1 : 0 })
  }
  const onTrials = view.name === 'home' && view.panel === 1

  // Same words as the other versions' CTA; on the phone it opens the panel sheet.
  const completing = view.name === 'look' || (view.name === 'pending' && genFrom !== 'base')
  const cta = completing ? 'Complete the Look' : 'Pick an Outfit'

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-white" style={FONT}>
      <div className="mx-auto flex min-h-0 w-full max-w-[1280px] flex-1 flex-col web:px-6">
        <header className="flex h-[60px] shrink-0 items-center justify-between px-6 web:px-0">
          <button type="button" onClick={goBack} aria-label="Go back" className="-ml-2 p-2 transition-opacity hover:opacity-70">
            <ArrowLeft size={24} strokeWidth={1.5} color={C.text} />
          </button>
          <div className="-mr-1.5 web:hidden">
            <Credits value={credits} />
          </div>
        </header>

        {/* Phone: the studio's screens (base | Past Trials, the render, a look), with the CTA that opens the panel sheet. */}
        <main className="relative min-h-0 flex-1 pt-4 web:hidden">
          <StudioScreens startFresh />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-6 pb-4 pt-4">
            <BannerSlot />
            {/* Hidden on Past Trials, where tapping a trial is the next step. */}
            <div
              className="transition-opacity duration-200"
              style={{ opacity: onTrials ? 0 : 1, pointerEvents: onTrials ? 'none' : 'auto' }}
              aria-hidden={onTrials}
            >
              <PrimaryButton disabled={view.name === 'pending'} onClick={() => openSheet({ name: 'panel' })}>
                {cta}
              </PrimaryButton>
            </div>
          </div>
        </main>

        {/* Web (Figma 3390:229698): a 358 column with a hairline divider, the photo centred in the rest. */}
        <div className="hidden min-h-0 flex-1 pt-3 web:flex">
          <aside className="flex min-h-0 w-[358px] shrink-0 flex-col border-r pr-6" style={{ borderColor: C.grey12 }}>
            {attire ? (
              <AttirePanel />
            ) : (
              <>
                <div className="shrink-0 pb-8">
                  <PanelHeading />
                </div>
                {/* Negative margin + padding: the tiles' rings and 18px shadows (and the field's ring) reach past
                    their boxes, and a scroll container clips at all its edges — the Top Picks sit right at its top.
                    This leaves that room on every side without moving or narrowing anything. */}
                <div className="scrollbar-hide -mx-4 -mt-4 min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">
                  <div className="flex flex-col gap-8">
                    <PanelBody inSheet={false} />
                  </div>
                </div>
                {/* Figma "Filter Options": 382 wide, out over the page gutter. */}
                <div
                  className="relative -ml-6 -mr-6 shrink-0 bg-white px-6 pb-4 pt-2"
                  style={{ filter: 'drop-shadow(0px -2px 6px rgba(0,0,0,0.06))' }}
                >
                  <PanelDock onViewAttire={() => setAttire(true)} />
                </div>
              </>
            )}
          </aside>

          <main className="relative flex min-w-0 flex-1 justify-center px-6 pt-[14px]">
            {/* 3:4 portrait, sized by height so it fits the window (560 x 747 at full size).
                self-start: the row stretches its children, which would override the ratio. */}
            <div className="flex aspect-[3/4] h-[min(747px,calc(100dvh-110px))] max-w-full flex-col self-start">
              <PhotoCard />
            </div>
            <div className="absolute bottom-6 right-0 top-[14px]">
              <LookRail />
            </div>
          </main>
        </div>
      </div>

      {/* Web banners ("Image is creating…", "Added to Favorites") float above the bottom edge. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 mx-auto hidden w-full max-w-[440px] px-4 web:block">
        <div className="relative">
          <BannerSlot />
        </div>
      </div>
    </div>
  )
}
