/**
 * /creator-flow-3test — the upload step, "3 to start, more for variety".
 *
 * Flow and copy follow the "Upload Screen — 3 to Start, More for Variety"
 * Claude Design canvas: 3 photos unlock Create, a meter with stops at
 * 3 · Ready and 10 · Most variety nudges toward more, and up to 15 fit.
 * Components follow the old creator flow in Figma (kpKr8Y0Wc7QtZ2FVolIySo):
 * Mweb 385:3768, Desktop 385:3769.
 *
 * Below 1280px it is the mobile frame: one column with the CTAs docked at the
 * bottom. At 1280px and up the form card (QR + upload) sits left and the
 * photos with their meter sit right.
 *
 * ?version=2 swaps in CreatorFlow3TestV2, the "Upload your photos" redesign.
 */
import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PrimaryCta } from '@/components/create-profile/CreateProfileFields'
import { CreatorFlow3TestV2 } from './CreatorFlow3TestV2'
import {
  PhotoGrid,
  QrUploadCard,
  RequirementsLink,
  SecondaryCta,
  SecureNote,
  TopBar,
  UploadToast,
  VarietyMeter,
} from './parts'
import { K, countLabel } from './tokens'
import { MAX_PHOTOS, MIN_PHOTOS, VARIETY_PHOTOS, usePhotos } from './use-photos'

export function CreatorFlow3TestPage() {
  const [params] = useSearchParams()
  const version = params.get('version')
  return version === '2' || version === 'v2' ? <CreatorFlow3TestV2 /> : <CreatorFlow3TestV1 />
}

function CreatorFlow3TestV1() {
  const { photos, addFiles, removePhoto, toast, dismissToast } = usePhotos()
  const [creating, setCreating] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const n = photos.length
  const ready = n >= MIN_PHOTOS
  const full = n >= MAX_PHOTOS
  const uploading = photos.some((p) => p.uploading)

  const pick = () => {
    if (full) return
    fileRef.current?.click()
  }
  const create = () => {
    if (ready && !uploading) setCreating(true)
  }

  const mobileLabel = creating
    ? 'Creating your headshots…'
    : n === 0
      ? 'Upload photos'
      : !ready
        ? `Add ${MIN_PHOTOS - n} more to continue`
        : 'Create my headshots'
  const createLabel = creating ? 'Creating your headshots…' : ready ? 'Create my headshots' : `Add ${MIN_PHOTOS - n} more to continue`
  const secondaryLabel = n < VARIETY_PHOTOS ? 'Add more for variety' : 'Add more photos (optional)'
  const showSecondary = ready && !full && !creating

  const grid = (cols: string) => (
    <PhotoGrid photos={photos} onAdd={pick} onRemove={(id) => !creating && removePhoto(id)} className={cols} />
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
          <div className="mx-auto flex w-full max-w-[480px] flex-col gap-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <h1 className="text-[24px] leading-[26px] tracking-[-0.288px]" style={{ fontWeight: 450, color: K.text }}>
                  Add 3–10 photos of you
                </h1>
                <p className="text-[16px] leading-[18px]" style={{ color: K.secondary }}>
                  3 is all you need to start. Add more for extra variety in your headshots.
                </p>
              </div>
              <RequirementsLink />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[14px] leading-4" style={{ fontWeight: 450, color: K.text }}>
                {countLabel(n)}
              </span>
              <VarietyMeter photos={photos} compact />
            </div>

            {grid('grid-cols-4 gap-2')}
          </div>
        </div>

        {/* CTA docker — Figma footer: consent line, then the button. */}
        <div className="relative shrink-0 bg-white px-6 pt-3 pb-4" style={{ filter: 'drop-shadow(0px -2px 4px rgba(0,0,0,0.06))' }}>
          <div className="absolute inset-x-6 bottom-full mb-3 flex justify-center">
            <UploadToast toast={toast} onDismiss={dismissToast} className="w-full max-w-[480px]" />
          </div>
          <div className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-3">
            <SecureNote />
            <PrimaryCta onClick={ready ? create : pick} disabled={creating || (ready && uploading)} className="w-full">
              {mobileLabel}
            </PrimaryCta>
            {showSecondary && (
              <SecondaryCta onClick={pick} className="w-full">
                {secondaryLabel}
              </SecondaryCta>
            )}
          </div>
        </div>
      </div>

      {/* ── Desktop (1280 and up) ───────────────────────────────────── */}
      <div className="relative mx-auto hidden min-h-0 w-full max-w-[1232px] flex-1 flex-col web:flex">
        <TopBar className="h-16 shrink-0" />
        <div className="flex min-h-0 flex-1 gap-6">
          {/* Form card */}
          <section className="flex w-[612px] shrink-0 flex-col justify-between gap-6 overflow-y-auto rounded-xl bg-white p-6">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <h1 className="text-[26px] leading-7 tracking-[-0.312px]" style={{ fontWeight: 450, color: K.text }}>
                    Add 3–10 photos you already have
                  </h1>
                  <p className="text-[18px] leading-5 tracking-[-0.09px]" style={{ color: K.secondary }}>
                    3 is all you need to start. Add more for extra variety — different outfits, angles and expressions.
                  </p>
                </div>
                <RequirementsLink />
              </div>

              <QrUploadCard onPick={pick} onFiles={addFiles} disabled={full || creating} label={full ? 'All 15 photos added' : undefined} />
            </div>

            <div className="flex items-center justify-between gap-4">
              <SecureNote />
              <PrimaryCta onClick={create} disabled={!ready || uploading || creating}>
                {createLabel}
              </PrimaryCta>
            </div>
          </section>

          {/* Photos */}
          <section className="flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-[22px] leading-6 tracking-[-0.22px]" style={{ fontWeight: 450, color: K.text }}>
                Your photos{' '}
                <span className="text-[16px] leading-[18px] tracking-normal" style={{ fontWeight: 420, color: K.secondary }}>
                  · {countLabel(n)}
                </span>
              </h2>
              <p className="text-[16px] leading-[18px]" style={{ color: K.secondary }}>
                Upload photos in different outfits and expressions.
              </p>
            </div>
            <VarietyMeter photos={photos} />
            {grid('grid-cols-5 gap-3')}
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
