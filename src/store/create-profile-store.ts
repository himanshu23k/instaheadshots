import { create } from 'zustand'
import type { GenderChoice, StyleId } from '@/components/create-profile/create-profile-data'

export type CreateProfileState = {
  name: string
  gender: GenderChoice
  style: StyleId | null
  setName: (name: string) => void
  setGender: (gender: GenderChoice) => void
  setStyle: (style: StyleId) => void
  reset: () => void
}

const INITIAL = {
  name: '',
  /** Null until the user picks — the photos stay a mix of both until then. */
  gender: null as GenderChoice,
  /** Null until the user picks — the showcase shuffles while it is null. */
  style: null as StyleId | null,
}

export const useCreateProfileStore = create<CreateProfileState>((set) => ({
  ...INITIAL,
  setName: (name) => set({ name }),
  setGender: (gender) => set({ gender }),
  setStyle: (style) => set({ style }),
  reset: () => set(INITIAL),
}))
