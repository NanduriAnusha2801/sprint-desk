import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authorizedFetch, silentRefresh } from '@/services/http/httpClient'
import { useAuthStore } from '@/store/authStore'
import { saveRefreshToken, readRefreshToken } from '@/services/auth/tokenStorage'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

beforeEach(() => {
  useAuthStore.setState({ user: null, accessToken: null, accessTokenExpiresAt: null, isAuthenticated: false, isInitializing: false })
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('auth interceptor', () => {
  it('attaches the current access token without refreshing when it is still valid', async () => {
    useAuthStore.setState({ accessToken: 'valid-token', accessTokenExpiresAt: Date.now() + 60_000 })
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ ok: true }))

    await authorizedFetch('https://api.example.com/data')

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [, init] = fetchSpy.mock.calls[0]!
    expect((init!.headers as Record<string, string>).Authorization).toBe('Bearer valid-token')
  })

  it('proactively refreshes an expired access token before sending the request', async () => {
    saveRefreshToken('refresh-abc', false)
    useAuthStore.setState({ accessToken: 'old-token', accessTokenExpiresAt: Date.now() - 1000 })

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/auth/refresh')) {
        return Promise.resolve(jsonResponse({ accessToken: 'new-token', refreshToken: 'refresh-def' }))
      }
      return Promise.resolve(jsonResponse({ ok: true }))
    })

    await authorizedFetch('https://api.example.com/data')

    expect(fetchSpy).toHaveBeenCalledTimes(2)
    expect(useAuthStore.getState().accessToken).toBe('new-token')
    expect(readRefreshToken()?.token).toBe('refresh-def')

    const dataCall = fetchSpy.mock.calls.find(([input]: [RequestInfo | URL, RequestInit?]) => String(input).includes('api.example.com'))!
    const [, init] = dataCall
    expect((init!.headers as Record<string, string>).Authorization).toBe('Bearer new-token')
  })

  it('retries the original request once after a reactive refresh triggered by a 401', async () => {
    saveRefreshToken('refresh-abc', false)
    useAuthStore.setState({ accessToken: 'stale-token', accessTokenExpiresAt: Date.now() + 60_000 })

    let dataCallCount = 0
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/auth/refresh')) {
        return Promise.resolve(jsonResponse({ accessToken: 'refreshed-token', refreshToken: 'refresh-ghi' }))
      }
      dataCallCount++
      return Promise.resolve(dataCallCount === 1 ? jsonResponse({}, 401) : jsonResponse({ ok: true }))
    })

    const response = await authorizedFetch('https://api.example.com/data')

    expect(response.status).toBe(200)
    expect(dataCallCount).toBe(2)
    expect(fetchSpy).toHaveBeenCalledTimes(3)
    expect(useAuthStore.getState().accessToken).toBe('refreshed-token')
  })

  it('shares a single in-flight refresh across concurrent callers', async () => {
    saveRefreshToken('refresh-abc', false)
    useAuthStore.setState({ accessToken: null, accessTokenExpiresAt: null })

    let refreshCalls = 0
    vi.spyOn(globalThis, 'fetch').mockImplementation((input: RequestInfo | URL) => {
      if (String(input).includes('/auth/refresh')) {
        refreshCalls++
        return Promise.resolve(jsonResponse({ accessToken: 'concurrent-token', refreshToken: 'refresh-jkl' }))
      }
      return Promise.resolve(jsonResponse({ ok: true }))
    })

    const [tokenA, tokenB, tokenC] = await Promise.all([silentRefresh(), silentRefresh(), silentRefresh()])

    expect(refreshCalls).toBe(1)
    expect(tokenA).toBe('concurrent-token')
    expect(tokenB).toBe('concurrent-token')
    expect(tokenC).toBe('concurrent-token')
  })

  it('clears the session when no refresh token is available', async () => {
    useAuthStore.setState({ user: { id: 1, username: 'x', email: 'x@x.com', firstName: 'X', lastName: 'Y', image: '' }, accessToken: null, accessTokenExpiresAt: null, isAuthenticated: true })

    await expect(silentRefresh()).rejects.toThrow()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().user).toBeNull()
  })
})
