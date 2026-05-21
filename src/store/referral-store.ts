import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const TTL = 2 * 60 * 1000
const PACKS_VIEWED_TTL = 30 * 60 * 1000

/* ─────────────────────────────────────────────────────────────── */
/* Session-scoped claim flag                                        */
/* sessionStorage so the discount survives timer expiry *within the */
/* same tab* (grace-period "Last chance" state) but is cleared the  */
/* moment the tab closes.                                           */
/* ─────────────────────────────────────────────────────────────── */

interface ReferralSessionStore {
  claimableInSession: boolean
  enableClaim: () => void
  disableClaim: () => void
}

export const useReferralSessionStore = create<ReferralSessionStore>()(
  persist(
    (set) => ({
      claimableInSession: false,
      enableClaim: () => set({ claimableInSession: true }),
      disableClaim: () => set({ claimableInSession: false }),
    }),
    {
      name: 'referral-claim-session',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)

export type PackId = 'premium' | 'standard' | 'starter'
export type EmailValidity = 'idle' | 'loading' | 'valid-editable' | 'valid-locked' | 'invalid'

export type EmailTriple = [string, string, string]
export type EmailValidityTriple = [EmailValidity, EmailValidity, EmailValidity]

const EMPTY_EMAILS: EmailTriple = ['', '', '']
const IDLE_VALIDITY: EmailValidityTriple = ['idle', 'idle', 'idle']

interface ReferralStore {
  packsViewedAt: number | null
  discountUnlockedAt: number | null
  selectedPackId: PackId
  paid: boolean
  partialInviteCount: number | null
  emails: EmailTriple
  emailValidity: EmailValidityTriple
  hasInvitedOnce: boolean
  discountOn: boolean
  markPacksViewed: () => void
  setSelectedPack: (id: PackId) => void
  unlockDiscount: () => void
  markPaid: () => void
  clearExpired: () => void
  resetDiscount: () => void
  setPartialInviteCount: (count: number | null) => void
  setEmails: (emails: EmailTriple) => void
  setEmailValidity: (validity: EmailValidityTriple) => void
  setHasInvitedOnce: (v: boolean) => void
  setDiscountOn: (v: boolean) => void
  clearInvites: () => void
}

export const useReferralStore = create<ReferralStore>()(
  persist(
    (set, get) => ({
      packsViewedAt: null,
      discountUnlockedAt: null,
      selectedPackId: 'premium',
      paid: false,
      partialInviteCount: null,
      emails: EMPTY_EMAILS,
      emailValidity: IDLE_VALIDITY,
      hasInvitedOnce: false,
      discountOn: false,

      markPacksViewed: () => {
        if (!get().packsViewedAt) set({ packsViewedAt: Date.now() })
      },

      setSelectedPack: (id) => set({ selectedPackId: id }),

      unlockDiscount: () => {
        set({ discountUnlockedAt: Date.now() })
        // Mark the discount as claimable for the rest of this tab session — survives
        // timer expiry but is wiped on tab close.
        useReferralSessionStore.getState().enableClaim()
      },

      // Payment completed — clear all referral/invite state since the discount flow is done
      markPaid: () => {
        set({
          paid: true,
          emails: EMPTY_EMAILS,
          emailValidity: IDLE_VALIDITY,
          hasInvitedOnce: false,
          partialInviteCount: null,
          discountOn: false,
        })
        useReferralSessionStore.getState().disableClaim()
      },

      resetDiscount: () => {
        set({
          discountUnlockedAt: null,
          paid: false,
          partialInviteCount: null,
          emails: EMPTY_EMAILS,
          emailValidity: IDLE_VALIDITY,
          hasInvitedOnce: false,
          discountOn: false,
        })
        useReferralSessionStore.getState().disableClaim()
      },

      setPartialInviteCount: (count) => set({ partialInviteCount: count }),

      setEmails: (emails) => set({ emails }),

      setEmailValidity: (validity) => set({ emailValidity: validity }),

      setHasInvitedOnce: (v) => set({ hasInvitedOnce: v }),

      setDiscountOn: (v) => set({ discountOn: v }),

      clearInvites: () =>
        set({
          emails: EMPTY_EMAILS,
          emailValidity: IDLE_VALIDITY,
          hasInvitedOnce: false,
        }),

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
  const claimableInSession = useReferralSessionStore((s) => s.claimableInSession)
  const now = Date.now()
  const packsViewed = !!packsViewedAt && now - packsViewedAt <= PACKS_VIEWED_TTL
  // Timer is "active" while the original 2-min countdown hasn't lapsed.
  const timerActive = !!discountUnlockedAt && now - discountUnlockedAt <= TTL
  // Grace period: timer lapsed but the user is still in the same tab session in which
  // the discount was unlocked, so they retain a "Last chance to claim" window. Cleared
  // when the tab closes (sessionStorage) or on markPaid / resetDiscount.
  const gracePeriodActive = !timerActive && claimableInSession
  const discountUnlocked = timerActive || gracePeriodActive
  const secondsRemaining =
    timerActive && discountUnlockedAt
      ? Math.max(0, Math.round((discountUnlockedAt + TTL - now) / 1000))
      : 0
  return { packsViewed, discountUnlocked, secondsRemaining, gracePeriodActive }
}

export function formatCountdown(seconds: number): string {
  const mm = Math.floor(seconds / 60).toString().padStart(2, '0')
  const ss = (seconds % 60).toString().padStart(2, '0')
  return `${mm}:${ss}`
}
