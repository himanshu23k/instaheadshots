import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PrimaryCta } from '@/components/create-profile/CreateProfileFields'
import { useHairstylistStore } from '@/store/hairstylist-store'
import { ColorPill, CreateLabel, PillSelect } from './CustomizationFields'
import { getStyleById, getStylesByGender, thumbnailFor, titleCase, type Gender } from './hairstylist-data'
import { HairstylistShell } from './HairstylistLayout'
import { StyleGrid } from './StyleGrid'

/**
 * Option 2 (Figma 2376:21505) — one step. Picking a style surfaces its
 * customization pills, pre-filled to that style's defaults, right above the CTA.
 */
export function HairstylistV2({ gender }: { gender: Gender }) {
  const navigate = useNavigate()
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
  }

  const handleCreate = () => {
    // The generate pipeline doesn't exist yet — same placeholder landing /create-profile uses.
    navigate('/home')
  }

  return (
    <HairstylistShell
      gender={gender}
      title="Choose a Hairstyle"
      footer={
        <>
          {style && axisState && (
            <>
              <div className="flex items-center gap-2">
                <img
                  src={thumbnailFor(style)}
                  alt=""
                  className="size-[28px] shrink-0 rounded-[6px] border border-[#E0E1E1] object-cover"
                />
                <p
                  className="truncate text-[12px] leading-[14px]"
                  style={{ fontFamily: 'var(--font-greed)', fontWeight: 450, color: 'black' }}
                >
                  Customise - {style.name}
                </p>
              </div>
              <div className="flex w-full flex-wrap items-center gap-3">
                <ColorPill value={axisState.color} onChange={setColor} />
                {style.axes.sides && axisState.sides && (
                  <PillSelect
                    label="Sides"
                    value={axisState.sides}
                    options={style.axes.sides.values}
                    getLabel={titleCase}
                    onChange={setSides}
                  />
                )}
                {style.axes.texture && axisState.texture && (
                  <PillSelect
                    label="Texture"
                    value={axisState.texture}
                    options={style.axes.texture.values}
                    getLabel={titleCase}
                    onChange={setTexture}
                  />
                )}
                {style.axes.length && axisState.length && (
                  <PillSelect
                    label="Length"
                    value={axisState.length}
                    options={style.axes.length.values}
                    getLabel={titleCase}
                    onChange={setLength}
                  />
                )}
              </div>
            </>
          )}
          <PrimaryCta disabled={!style} onClick={handleCreate} className="w-full">
            <CreateLabel />
          </PrimaryCta>
        </>
      }
    >
      <StyleGrid styles={styles} selectedId={selectedStyleId} onSelect={selectStyle} />
    </HairstylistShell>
  )
}
