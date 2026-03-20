import { create } from 'zustand'
import type { CreditTransaction, StepId } from '@/types'

interface CreditState {
  balance: number
  transactions: CreditTransaction[]

  canAfford: (cost: number) => boolean
  isTransformationFree: (step: StepId, optionId: string) => boolean
  deductCredit: (step: StepId, optionId: string) => void
  addCredits: (amount: number) => void
  getTotalSpent: () => number
  reset: () => void
}

export const useCreditStore = create<CreditState>((set, get) => ({
  balance: 10,
  transactions: [],

  canAfford: (cost) => get().balance >= cost,

  isTransformationFree: (step, optionId) => {
    // Check if this exact transformation has been applied before in this session
    return get().transactions.some(
      (t) => t.step === step && t.optionId === optionId
    )
  },

  deductCredit: (step, optionId) => {
    const state = get()
    // If already applied this exact transformation, it's free
    if (state.isTransformationFree(step, optionId)) return

    set({
      balance: state.balance - 1,
      transactions: [
        ...state.transactions,
        { step, optionId, amount: 1, timestamp: Date.now() },
      ],
    })
  },

  addCredits: (amount) =>
    set((state) => ({ balance: state.balance + amount })),

  getTotalSpent: () =>
    get().transactions.reduce((sum, t) => sum + t.amount, 0),

  reset: () => set({ balance: 10, transactions: [] }),
}))
