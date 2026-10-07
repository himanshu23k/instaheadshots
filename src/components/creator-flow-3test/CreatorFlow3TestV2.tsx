/**
 * /creator-flow-3test?version=2 — "Upload your photos".
 *
 * Same rules as v1: 3 to start, 10 for the most variety, and room for more
 * past 10, up to 25. A ten-segment meter replaces v1's track, with v1's
 * caption under it for reinforcement; an add tile leads the grid and a
 * checklist of photo tips sits under it.
 *
 * The mocks are mobile only. Desktop keeps v1's split: the QR card on the
 * left, the meter, caption, grid and checklist on the right.
 */
import { useRef, useState } from 'react'
import { PrimaryCta } from '@/components/create-profile/CreateProfileFields'
import { ProgressCaption, QrUploadCard, RequirementsLink, SecureNote, TopBar, UploadToast } from './parts'
import { Checklist, PhotoPicker, SegmentMeter } from './parts-v2'
import { K, V2_MAX_PHOTOS, captionV2 } from './tokens'
import { MIN_PHOTOS, usePhotos } from './use-photos'

const MAX = V2_MAX_PHOTOS

function Intro({ desktop = false }: { desktop?: boolean }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1
          className={desktop ? 'text-[26px] leading-7 tracking-[-0.312px]' : 'text-[24px] leading-[26px] tracking-[-0.288px]'}
          style={{ fontWeight: 450, color: K.text }}
        >
          Upload your photos
        </h1>
        <p className={desktop ? 'text-[18px] leading-5 tracking-[-0.09px]' : 'text-[16px] leading-5'} style={{ color: K.secondary }}>
          <span style={{ fontWeight: 450, color: K.text }}>Minimum 3 photos needed.</span> Add 10 or more for variety.
        </p>
      </div>
      <RequirementsLink label="Read full photo requirements" />
    </div>
  )
}

export function CreatorFlow3TestV2() {
  const { photos, addFiles, removePhoto, toast, dismissToast } = usePhotos(MAX)
  const [creating, setCreating] = useState(false)
  // Bumped when Create is tapped short of 3: the caption shakes to say why.
  const [shake, setShake] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const n = photos.length
  const full = n >= MAX
  const uploading = photos.some((p) => p.uploading)

  const pick = () => {
    if (!full) fileRef.current?.click()
  }
  const create = () => {
    if (n < MIN_PHOTOS) return setShake((s) => s + 1)
    if (!uploading) setCreating(true)
  }

  const label = creating ? 'Creating Your Headshots…' : 'Create Your Headshots'
  const picker = (cols: string) => (
    <PhotoPicker photos={photos} max={MAX} onAdd={pick} onRemove={(id) => !creating && removePhoto(id)} className={cols} />
  )

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-white web:bg-[#F7F7F8] web:px-6 web:pb-6" style={{ fontFamily: 'var(--font-greed)' }}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {/* ── Mobile (below 1280) ─────────────────────────────────────── */}
      <div className="relative flex min-h-0 flex-1 flex-col web:hidden">
        <TopBar className="shrink-0 px-4" />
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-6 pb-6">
          <div className="mx-auto flex w-full max-w-[480px] flex-col gap-8">
            <Intro />
            <div className="flex flex-col gap-3">
              <SegmentMeter count={n} />
              <ProgressCaption photos={photos} compact shake={shake} caption={captionV2(n)} tone="progress" />
            </div>
            {picker('grid-cols-4 gap-2.5')}
            <Checklist />
          </div>
        </div>

        <div className="relative shrink-0 bg-white px-6 pt-3 pb-4">
          <div className="absolute inset-x-6 bottom-full mb-3 flex justify-center">
            <UploadToast toast={toast} onDismiss={dismissToast} className="w-full max-w-[480px]" />
          </div>
          <div className="mx-auto flex w-full max-w-[480px] flex-col">
            <PrimaryCta onClick={create} disabled={creating} className="w-full">
              {label}
            </PrimaryCta>
            <SecureNote className="mt-3 justify-center" />
          </div>
        </div>
      </div>

      {/* ── Desktop (1280 and up) ───────────────────────────────────── */}
      <div className="relative mx-auto hidden min-h-0 w-full max-w-[1232px] flex-1 flex-col web:flex">
        <TopBar className="h-16 shrink-0" />
        <div className="flex min-h-0 flex-1 gap-6">
          <section className="flex w-[612px] shrink-0 flex-col justify-between gap-6 overflow-y-auto rounded-xl bg-white p-6">
            <div className="flex flex-col gap-8">
              <Intro desktop />
              <QrUploadCard onPick={pick} onFiles={addFiles} disabled={full || creating} label={full ? `All ${MAX} photos added` : undefined} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <SecureNote />
              <PrimaryCta onClick={create} disabled={creating}>
                {label}
              </PrimaryCta>
            </div>
          </section>

          <section className="flex min-w-0 flex-1 flex-col gap-8 overflow-y-auto p-6">
            <div className="flex flex-col gap-3">
              <SegmentMeter count={n} />
              <ProgressCaption photos={photos} shake={shake} caption={captionV2(n)} tone="progress" />
            </div>
            {picker('grid-cols-5 gap-3')}
            <Checklist />
          </section>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
          <div className="pointer-events-auto">
            <UploadToast toast={toast} onDismiss={dismissToast} className="min-w-[342px]" />
          </div>
        </div>
      </div>
    </div>
  )
}
