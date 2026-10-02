import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PrimaryCta } from '@/components/create-profile/CreateProfileFields'
import { useHairstylistStore } from '@/store/hairstylist-store'
import { AxisSection, ColorSection, CreateLabel } from './CustomizationFields'
import { getStyleById, getStylesByGender, thumbnailFor, type Gender, type Hairstyle } from './hairstylist-data'
import { HairstylistShell } from './HairstylistLayout'
import { StyleGrid } from './StyleGrid'

type Step = 'grid' | 'customize'

/** Top row of the customize card: the picked style, and Edit back to the grid. */
function SelectedStyleRow({ style, onEdit }: { style: Hairstyle; onEdit: () => void }) {
  return (
    <div className="flex w-full items-center gap-3 p-3">
      <img src={thumbnailFor(style)} alt="" className="size-[56px] shrink-0 rounded-lg object-cover" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p
          className="text-[12px] leading-[14px]"
          style={{ fontFamily: 'var(--font-greed)', fontWeight: 420, color: 'var(--color-text-secondary)' }}
        >
          Selected hairstyle
        </p>
        <p
          className="truncate text-[16px] leading-[18px]"
          style={{ fontFamily: 'var(--font-greed)', fontWeight: 450, color: 'var(--color-text-primary)' }}
        >
          {style.name}
        </p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit hairstyle, currently ${style.name}`}
        className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-[14px] leading-4 transition-opacity hover:opacity-70"
        style={{ fontFamily: 'var(--font-greed)', fontWeight: 450, color: 'var(--color-text-primary)' }}
      >
        <Pencil size={14} strokeWidth={1.75} />
        Edit
      </button>
    </div>
  )
}

/**
 * Option 1 (Figma 2342:21415) — pick a style, then its customization controls
 * take over the same column while the photo preview stays on the right.
 */
export function HairstylistV1({ gender }: { gender: Gender }) {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('grid')
  const [syncedGender, setSyncedGender] = useState(gender)
  const { selectedStyleId, axisState, selectStyle, clearStyle, setTexture, setSides, setLength, setColor } =
    useHairstylistStore()
  const styles = getStylesByGender(gender)
  const style = selectedStyleId ? getStyleById(selectedStyleId) : null

  // Gender is picked upstream in /create-profile — if it changes there while a
  // style from the other catalog is still selected here, drop the stale pick.
  // (Adjusting state during render on a prop change, per the React docs.)
  if (gender !== syncedGender) {
    setSyncedGender(gender)
    clearStyle()
    setStep('grid')
  }

  const customizing = step === 'customize' && style && axisState

  const handleCreate = () => {
    // The generate pipeline doesn't exist yet — same placeholder landing /create-profile uses.
    navigate('/home')
  }

  return (
    <HairstylistShell
      gender={gender}
      title={customizing ? 'Customize Hairstyle' : 'Choose a Hairstyle'}
      onBack={customizing ? () => setStep('grid') : undefined}
      footer={
        customizing ? (
          <PrimaryCta onClick={handleCreate} className="w-full">
            <CreateLabel />
          </PrimaryCta>
        ) : (
          <PrimaryCta disabled={!style} onClick={() => setStep('customize')} className="w-full">
            Choose Hairstyle
          </PrimaryCta>
        )
      }
    >
      {customizing ? (
        <div className="divide-y divide-[#EDEEEE] overflow-hidden rounded-xl border border-[#E0E1E1] bg-white">
          <SelectedStyleRow style={style} onEdit={() => setStep('grid')} />
          {style.axes.sides && (
            <AxisSection title="Sides" values={style.axes.sides.values} selected={axisState.sides} onSelect={setSides} />
          )}
          {style.axes.texture && (
            <AxisSection
              title="Texture"
              values={style.axes.texture.values}
              selected={axisState.texture}
              onSelect={setTexture}
            />
          )}
          {style.axes.length && (
            <AxisSection
              title="Length"
              values={style.axes.length.values}
              selected={axisState.length}
              onSelect={setLength}
            />
          )}
          <ColorSection selected={axisState.color} onSelect={setColor} />
        </div>
      ) : (
        <StyleGrid styles={styles} selectedId={selectedStyleId} onSelect={selectStyle} />
      )}
    </HairstylistShell>
  )
}
