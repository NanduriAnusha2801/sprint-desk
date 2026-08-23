import type { LoginRequest, LoginResponse, RefreshResponse, AuthUser } from '@/types/auth'

const DUMMYJSON_BASE = 'https://dummyjson.com'

/**
 * Access tokens are requested with a short lifetime so the silent-refresh
 * flow can be exercised naturally during normal use rather than being faked.
 */
export const ACCESS_TOKEN_TTL_MINUTES = 1

export class AuthApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
  }
}

async function parseOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new AuthApiError(body.message ?? `Request failed with status ${res.status}`, res.status)
  }
  return res.json() as Promise<T>
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${DUMMYJSON_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...credentials,
      expiresInMins: ACCESS_TOKEN_TTL_MINUTES,
    }),
  })
  return parseOrThrow<LoginResponse>(res)
}

export async function refreshTokens(refreshToken: string): Promise<RefreshResponse> {
  const res = await fetch(`${DUMMYJSON_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      refreshToken,
      expiresInMins: ACCESS_TOKEN_TTL_MINUTES,
    }),
  })
  return parseOrThrow<RefreshResponse>(res)
}

export async function fetchCurrentUser(accessToken: string): Promise<AuthUser> {
  const res = await fetch(`${DUMMYJSON_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return parseOrThrow<AuthUser>(res)
}
