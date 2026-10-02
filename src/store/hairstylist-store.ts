import { create } from 'zustand'
import {
  getDefaultAxisState,
  getStyleById,
  type AxisState,
  type ColorId,
  type SidesId,
  type TextureId,
} from '@/components/hairstylist/hairstylist-data'

export type HairstylistState = {
  selectedStyleId: string | null
  axisState: AxisState | null
  selectStyle: (styleId: string) => void
  setTexture: (texture: TextureId) => void
  setSides: (sides: SidesId) => void
  setLength: (length: string) => void
  setColor: (color: ColorId) => void
  clearStyle: () => void
  reset: () => void
}

const INITIAL = {
  selectedStyleId: null as string | null,
  axisState: null as AxisState | null,
}

export const useHairstylistStore = create<HairstylistState>((set) => ({
  ...INITIAL,
  // Picking a style resets every axis to that style's own defaults — a fade
  // choice from one cut has no meaning carried into a style that has no `sides`.
  selectStyle: (styleId) => {
    const style = getStyleById(styleId)
    if (!style) return
    set({ selectedStyleId: styleId, axisState: getDefaultAxisState(style) })
  },
  setTexture: (texture) => set((s) => (s.axisState ? { axisState: { ...s.axisState, texture } } : s)),
  setSides: (sides) => set((s) => (s.axisState ? { axisState: { ...s.axisState, sides } } : s)),
  setLength: (length) => set((s) => (s.axisState ? { axisState: { ...s.axisState, length } } : s)),
  setColor: (color) => set((s) => (s.axisState ? { axisState: { ...s.axisState, color } } : s)),
  clearStyle: () => set(INITIAL),
  reset: () => set(INITIAL),
}))
