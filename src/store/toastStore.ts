import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
  title?: string
}

interface ToastState {
  toasts: ToastItem[]
  show: (input: Omit<ToastItem, 'id'>) => number
  dismiss: (id: number) => void
}

let idCounter = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (input) => {
    const id = ++idCounter
    set((state) => ({ toasts: [...state.toasts, { ...input, id }] }))
    return id
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
