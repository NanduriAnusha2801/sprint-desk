import { login as loginRequest, ACCESS_TOKEN_TTL_MINUTES } from '@/services/auth/authApi'
import { saveRefreshToken, readRefreshToken, clearRefreshToken } from '@/services/auth/tokenStorage'
import { silentRefresh, authorizedFetch } from '@/services/http/httpClient'
import { useAuthStore } from '@/store/authStore'
import type { LoginRequest, AuthUser } from '@/types/auth'

const ACCESS_TOKEN_TTL_MS = ACCESS_TOKEN_TTL_MINUTES * 60 * 1000

export async function signIn(credentials: LoginRequest, rememberMe: boolean): Promise<AuthUser> {
  const response = await loginRequest(credentials)
  const user: AuthUser = {
    id: response.id,
    username: response.username,
    email: response.email,
    firstName: response.firstName,
    lastName: response.lastName,
    image: response.image,
  }

  useAuthStore.getState().setSession(user, response.accessToken, Date.now() + ACCESS_TOKEN_TTL_MS)
  saveRefreshToken(response.refreshToken, rememberMe)
  return user
}

export function signOut(): void {
  clearRefreshToken()
  useAuthStore.getState().clearSession()
}

/**
 * Runs once on app boot. If a valid refresh token is still in storage the
 * session is restored silently; otherwise the user lands on /login.
 */
export async function restoreSession(): Promise<void> {
  const stored = readRefreshToken()
  if (!stored) {
    useAuthStore.getState().finishInitializing()
    return
  }

  try {
    const accessToken = await silentRefresh()
    const res = await authorizedFetch('https://dummyjson.com/auth/me', {})
    if (!res.ok) throw new Error('Session validation failed')
    const user = (await res.json()) as AuthUser
    useAuthStore.getState().setSession(user, accessToken, Date.now() + ACCESS_TOKEN_TTL_MS)
  } catch {
    clearRefreshToken()
    useAuthStore.getState().clearSession()
  } finally {
    useAuthStore.getState().finishInitializing()
  }
}
