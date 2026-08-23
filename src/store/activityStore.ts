import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ActivityEntry {
  id: number
  taskTitle: string
  message: string
  createdAt: string
}

const MAX_ENTRIES = 25

interface ActivityState {
  entries: ActivityEntry[]
  log: (taskTitle: string, message: string) => void
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      entries: [],
      log: (taskTitle, message) => {
        const nextId = get().entries.length ? Math.max(...get().entries.map((e) => e.id)) + 1 : 1
        const entry: ActivityEntry = { id: nextId, taskTitle, message, createdAt: new Date().toISOString() }
        set((state) => ({ entries: [entry, ...state.entries].slice(0, MAX_ENTRIES) }))
      },
    }),
    { name: 'sprintdesk.activity' },
  ),
)
