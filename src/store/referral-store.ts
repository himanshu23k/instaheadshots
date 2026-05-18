import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const TTL = 2 * 60 * 1000
const PACKS_VIEWED_TTL = 30 * 60 * 1000

export type PackId = 'premium' | 'standard' | 'starter'

interface ReferralStore {
  packsViewedAt: number | null
  discountUnlockedAt: number | null
  selectedPackId: PackId
  paid: boolean
  markPacksViewed: () => void
  setSelectedPack: (id: PackId) => void
  unlockDiscount: () => void
  markPaid: () => void
  clearExpired: () => void
  resetDiscount: () => void
}

export const useReferralStore = create<ReferralStore>()(
  persist(
    (set, get) => ({
      packsViewedAt: null,
      discountUnlockedAt: null,
      selectedPackId: 'premium',
      paid: false,

      markPacksViewed: () => {
        if (!get().packsViewedAt) set({ packsViewedAt: Date.now() })
      },

      setSelectedPack: (id) => set({ selectedPackId: id }),

      unlockDiscount: () => set({ discountUnlockedAt: Date.now() }),

      markPaid: () => set({ paid: true }),

      resetDiscount: () => set({ discountUnlockedAt: null, paid: false }),

      clearExpired: () => {
        const { packsViewedAt, discountUnlockedAt } = get()
        const now = Date.now()
        const upd: Partial<Pick<ReferralStore, 'packsViewedAt' | 'discountUnlockedAt' | 'paid'>> = {}
        if (packsViewedAt && now - packsViewedAt > PACKS_VIEWED_TTL) upd.packsViewedAt = null
        if (discountUnlockedAt && now - discountUnlockedAt > TTL) {
          upd.discountUnlockedAt = null
          upd.paid = false
        }
        if (Object.keys(upd).length) set(upd)
      },
    }),
    { name: 'referral-store' }
  )
)

export const REFERRAL_TTL = TTL

export function useReferralStatus() {
  const { packsViewedAt, discountUnlockedAt } = useReferralStore()
  const now = Date.now()
  const packsViewed = !!packsViewedAt && now - packsViewedAt <= PACKS_VIEWED_TTL
  const discountUnlocked = !!discountUnlockedAt && now - discountUnlockedAt <= TTL
  const secondsRemaining =
    discountUnlocked && discountUnlockedAt
      ? Math.max(0, Math.round((discountUnlockedAt + TTL - now) / 1000))
      : 0
  return { packsViewed, discountUnlocked, secondsRemaining }
}

export function formatCountdown(seconds: number): string {
  const mm = Math.floor(seconds / 60).toString().padStart(2, '0')
  const ss = (seconds % 60).toString().padStart(2, '0')
  return `${mm}:${ss}`
}
