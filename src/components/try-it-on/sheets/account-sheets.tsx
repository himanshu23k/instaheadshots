import { useState } from 'react'
import { Check, X, Zap } from 'lucide-react'
import { useTryItOnStore } from '@/store/try-it-on-store'
import { CREDIT_PACKS, REDO_REASONS } from '../try-it-on-data'
import { SheetFooter, SheetHeader, SheetScroll } from '../Sheet'
import { CreditsIcon, PrimaryButton } from '../ui'
import { C, FONT } from '../tokens'
import { DropZone } from './pick-sheets'

const A = '/try-it-on'
const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`

// ── Redo base: what went wrong — Figma 370:58464 ─────────────────────────────

export function RedoSheet() {
  const pushSheet = useTryItOnStore((s) => s.pushSheet)
  const [picked, setPicked] = useState<string[]>([])
  const toggle = (r: string) => setPicked((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]))

  return (
    <>
      <SheetHeader title="What didn't look right?" subtitle="Tell us what we have got wrong" back={false} />
      <SheetScroll className="pt-5">
        <div className="flex flex-col gap-1">
          {REDO_REASONS.map((r) => {
            const on = picked.includes(r)
            return (
              <label key={r} className="flex cursor-pointer items-center gap-3 py-2.5">
                <input type="checkbox" checked={on} onChange={() => toggle(r)} className="peer sr-only" />
                <span
                  className="flex size-[18px] shrink-0 items-center justify-center rounded-[4px] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-black/30"
                  style={{ background: on ? C.text : '#FFFFFF', boxShadow: on ? 'none' : `inset 0 0 0 1.4px ${C.grey12}` }}
                  aria-hidden
                >
                  {on && <Check size={12} strokeWidth={2.6} color="#fff" />}
                </span>
                <span className="text-[16px] leading-[18px]" style={{ fontWeight: 420, color: C.text }}>
                  {r}
                </span>
              </label>
            )
          })}
        </div>
      </SheetScroll>
      <SheetFooter shadow>
        <PrimaryButton disabled={picked.length === 0} onClick={() => pushSheet({ name: 'redo-upload' })}>
          Continue
        </PrimaryButton>
      </SheetFooter>
    </>
  )
}

// ── Redo base: one full body photo — Figma 370:58475 ─────────────────────────

export function RedoUploadSheet() {
  const pushSheet = useTryItOnStore((s) => s.pushSheet)
  const refreshBase = useTryItOnStore((s) => s.refreshBase)
  return (
    <>
      <SheetHeader
        title="We need one full body photo you already have"
        subtitle="We use your photo to learn how you look. Upload a full body shot to get accurate base"
      />
      <SheetScroll className="pt-5">
        <button
          type="button"
          onClick={() => pushSheet({ name: 'guidelines' })}
          className="self-start text-[16px] leading-[18px] underline underline-offset-[3px] hover:opacity-70"
          style={{ fontWeight: 450, color: C.text }}
        >
          Read photo requirements
        </button>
        <DropZone
          title="Upload a photo of your full body"
          subtitle="A full body image would help us get your base right"
          onFile={() => refreshBase()}
          className="py-8"
        />
      </SheetScroll>
    </>
  )
}

// ── Photo guidelines — Figma 370:58488 ───────────────────────────────────────

export function GuidelinesSheet() {
  const popSheet = useTryItOnStore((s) => s.popSheet)
  const examples = [
    { image: `${A}/guide-good.jpg`, good: true },
    { image: `${A}/guide-bad.jpg`, good: false },
  ]
  return (
    <>
      <SheetHeader title="Photo guidelines" subtitle="The AI will learn about you from your photos." />
      <SheetScroll className="pt-5">
        <div className="grid grid-cols-2 gap-3">
          {examples.map((e) => (
            <div
              key={e.image}
              className="relative aspect-[163/240] overflow-hidden rounded-[10px]"
              style={{ boxShadow: `0 0 0 2px ${e.good ? '#00A36D' : C.error}` }}
            >
              <img src={e.image} alt={e.good ? 'Good example' : 'Bad example'} className="absolute inset-0 size-full object-cover" />
              <span
                className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full"
                style={{ background: e.good ? '#00A36D' : C.error }}
              >
                {e.good ? <Check size={14} strokeWidth={2.6} color="#fff" /> : <X size={14} strokeWidth={2.6} color="#fff" />}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[20px] leading-[22px] tracking-[-0.2px]" style={{ fontWeight: 450, color: C.text }}>
            Head to Toe visibility
          </p>
          <p className="text-[14px] leading-[18px]" style={{ color: C.secondary }}>
            Full body image of just you in fitted clothes and no hands in pockets
          </p>
        </div>
      </SheetScroll>
      <SheetFooter>
        <PrimaryButton onClick={popSheet}>Got it</PrimaryButton>
      </SheetFooter>
    </>
  )
}

// ── Insufficient credits — Figma 370:58382 ───────────────────────────────────

export function CreditsSheet() {
  const credits = useTryItOnStore((s) => s.credits)
  const buyCredits = useTryItOnStore((s) => s.buyCredits)
  const [packId, setPackId] = useState('c100')
  const pack = CREDIT_PACKS.find((p) => p.id === packId)!

  return (
    <>
      <SheetHeader title="Buy credits" subtitle={`You have ${credits} credits left.`} back={false} />
      <SheetScroll className="pt-5">
        <div className="flex flex-col gap-4">
          {CREDIT_PACKS.map((p) => {
            const on = p.id === packId
            const dark = p.best && on
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPackId(p.id)}
                aria-pressed={on}
                className="overflow-hidden rounded-[10px] text-left transition-shadow"
                style={{
                  boxShadow: on ? `0 0 0 1.5px ${p.best ? '#E2F35B' : C.text}` : `0 0 0 1px ${C.grey12}`,
                }}
              >
                {p.best && (
                  <div
                    className="flex items-center justify-center gap-1 py-1 text-[10px] leading-3 tracking-[0.06em]"
                    style={{ background: '#E2F35B', color: C.text, fontWeight: 600 }}
                  >
                    <Zap size={10} fill={C.text} strokeWidth={0} /> BEST VALUE
                  </div>
                )}
                <div
                  className="flex items-center justify-between px-4 py-3.5"
                  style={{ background: dark ? C.text : '#FFFFFF', color: dark ? '#FFFFFF' : C.text }}
                >
                  <span className="flex items-center gap-2 text-[18px] leading-5" style={{ fontWeight: 420 }}>
                    <CreditsIcon size={18} /> {p.credits}
                  </span>
                  <span className="flex flex-col items-end gap-1.5">
                    <span className="flex items-baseline gap-2 text-[18px] leading-5" style={{ fontWeight: 450 }}>
                      {p.strike && (
                        <span className="text-[16px] line-through" style={{ opacity: 0.5, fontWeight: 420 }}>
                          {rupees(p.strike)}
                        </span>
                      )}
                      {rupees(p.price)}
                    </span>
                    <span
                      className="rounded-[4px] px-1.5 py-0.5 text-[9px] tracking-[0.04em]"
                      style={{ background: dark ? 'rgba(255,255,255,0.12)' : C.grey03, color: dark ? '#fff' : C.secondary }}
                    >
                      ₹{p.perCredit} /CREDIT
                    </span>
                  </span>
                </div>
              </button>
            )
          })}
        </div>
        <p className="text-[16px] leading-5" style={{ ...FONT, fontWeight: 420, color: C.secondary }}>
          Each try-on uses 1 credit. A render that fails is refunded.
        </p>
      </SheetScroll>
      <SheetFooter shadow>
        <PrimaryButton onClick={() => buyCredits(pack.credits)}>
          {rupees(pack.price)}
          <span className="mx-3 inline-block h-4 w-px translate-y-[3px] bg-white/40" aria-hidden />
          Buy {pack.credits} Credits
        </PrimaryButton>
      </SheetFooter>
    </>
  )
}
