/**
 * DummyJSON has no real backend session, so the refresh token's persistence
 * is simulated client-side via localStorage with an explicit expiry instead
 * of an httpOnly cookie. The access token is deliberately kept out of this
 * module (and out of storage entirely) — it only ever lives in memory.
 */
const STORAGE_KEY = 'sprintdesk.refreshToken'

const DEFAULT_SESSION_DAYS = 1
const REMEMBER_ME_DAYS = 30

interface StoredRefreshToken {
  token: string
  expiresAt: number
  rememberMe: boolean
}

function daysToMs(days: number): number {
  return days * 24 * 60 * 60 * 1000
}

export function saveRefreshToken(token: string, rememberMe: boolean): void {
  const ttl = rememberMe ? REMEMBER_ME_DAYS : DEFAULT_SESSION_DAYS
  const record: StoredRefreshToken = {
    token,
    expiresAt: Date.now() + daysToMs(ttl),
    rememberMe,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
}

export function readRefreshToken(): StoredRefreshToken | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const record = JSON.parse(raw) as StoredRefreshToken
    if (Date.now() > record.expiresAt) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return record
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function clearRefreshToken(): void {
  localStorage.removeItem(STORAGE_KEY)
}
