import { create } from 'zustand'
import type { AuthUser } from '@/types/auth'

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  accessTokenExpiresAt: number | null
  isAuthenticated: boolean
  isInitializing: boolean
  setSession: (user: AuthUser, accessToken: string, expiresAt: number) => void
  setAccessToken: (accessToken: string, expiresAt: number) => void
  clearSession: () => void
  finishInitializing: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  accessTokenExpiresAt: null,
  isAuthenticated: false,
  isInitializing: true,

  setSession: (user, accessToken, expiresAt) =>
    set({ user, accessToken, accessTokenExpiresAt: expiresAt, isAuthenticated: true }),

  setAccessToken: (accessToken, expiresAt) =>
    set({ accessToken, accessTokenExpiresAt: expiresAt }),

  clearSession: () =>
    set({ user: null, accessToken: null, accessTokenExpiresAt: null, isAuthenticated: false }),

  finishInitializing: () => set({ isInitializing: false }),
}))
