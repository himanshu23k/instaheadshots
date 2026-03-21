import { create } from 'zustand'
import type { CreditTransaction, StepId } from '@/types'

interface CreditState {
  balance: number
  transactions: CreditTransaction[]

  canAfford: (cost: number) => boolean
  isTransformationFree: (step: StepId | string, optionId: string) => boolean
  deductCredit: (step: StepId | string, optionId: string) => void
  deductCredits: (step: StepId | string, optionId: string, amount: number) => void
  addCredits: (amount: number) => void
  getTotalSpent: () => number
  reset: () => void
}

export const useCreditStore = create<CreditState>((set, get) => ({
  balance: 10,
  transactions: [],

  canAfford: (cost) => get().balance >= cost,

  isTransformationFree: (step, optionId) => {
    return get().transactions.some(
      (t) => t.step === step && t.optionId === optionId
    )
  },

  deductCredit: (step, optionId) => {
    const state = get()
    if (state.isTransformationFree(step as StepId, optionId)) return

    set({
      balance: state.balance - 1,
      transactions: [
        ...state.transactions,
        { step: step as StepId, optionId, amount: 1, timestamp: Date.now() },
      ],
    })
  },

  deductCredits: (step, optionId, amount) => {
    const state = get()
    if (amount <= 0) return

    set({
      balance: state.balance - amount,
      transactions: [
        ...state.transactions,
        { step: step as StepId, optionId, amount, timestamp: Date.now() },
      ],
    })
  },

  addCredits: (amount) =>
    set((state) => ({ balance: state.balance + amount })),

  getTotalSpent: () =>
    get().transactions.reduce((sum, t) => sum + t.amount, 0),

  reset: () => set({ balance: 10, transactions: [] }),
}))
