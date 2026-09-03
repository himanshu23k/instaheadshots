import { create } from 'zustand'
import type { GenderId, StyleId } from '@/components/create-profile/create-profile-data'

export type CreateProfileState = {
  name: string
  gender: GenderId
  style: StyleId | null
  setName: (name: string) => void
  setGender: (gender: GenderId) => void
  setStyle: (style: StyleId) => void
  reset: () => void
}

const INITIAL = {
  name: '',
  gender: 'male' as GenderId,
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
