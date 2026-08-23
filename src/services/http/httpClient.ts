import { refreshTokens } from '@/services/auth/authApi'
import { readRefreshToken, saveRefreshToken, clearRefreshToken } from '@/services/auth/tokenStorage'
import { useAuthStore } from '@/store/authStore'

const EXPIRY_SAFETY_MARGIN_MS = 5000

/**
 * A single in-flight refresh promise shared by every caller. Without this,
 * several requests expiring around the same moment would each fire their
 * own /auth/refresh call and race to update the stored tokens.
 */
let refreshInFlight: Promise<string> | null = null

function isAccessTokenExpired(): boolean {
  const { accessTokenExpiresAt } = useAuthStore.getState()
  if (!accessTokenExpiresAt) return true
  return Date.now() > accessTokenExpiresAt - EXPIRY_SAFETY_MARGIN_MS
}

async function performRefresh(): Promise<string> {
  const stored = readRefreshToken()
  if (!stored) {
    useAuthStore.getState().clearSession()
    throw new Error('No refresh token available')
  }

  try {
    const { accessToken, refreshToken } = await refreshTokens(stored.token)
    const expiresAt = Date.now() + 60 * 1000
    useAuthStore.getState().setAccessToken(accessToken, expiresAt)
    saveRefreshToken(refreshToken, stored.rememberMe)
    return accessToken
  } catch (err) {
    clearRefreshToken()
    useAuthStore.getState().clearSession()
    throw err
  }
}

export function silentRefresh(): Promise<string> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

async function getValidAccessToken(): Promise<string> {
  const { accessToken } = useAuthStore.getState()
  if (accessToken && !isAccessTokenExpired()) return accessToken
  return silentRefresh()
}

/**
 * Fetch wrapper that attaches the current Bearer token, refreshes it
 * proactively when it's near expiry, and — as a fallback for a token that
 * expired unexpectedly — retries the request exactly once after a reactive
 * refresh triggered by a 401 response.
 */
export async function authorizedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = await getValidAccessToken()
  const send = (accessToken: string) =>
    fetch(input, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${accessToken}` },
    })

  const response = await send(token)
  if (response.status !== 401) return response

  const refreshedToken = await silentRefresh()
  return send(refreshedToken)
}
