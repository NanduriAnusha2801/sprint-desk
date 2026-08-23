import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/PublicOnlyRoute'
import { useAuthStore } from '@/store/authStore'

function renderApp(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<div>Login page</div>} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useAuthStore.setState({ user: null, accessToken: null, accessTokenExpiresAt: null, isAuthenticated: false, isInitializing: false })
})

describe('route guards', () => {
  it('redirects an unauthenticated user from a protected route to /login', () => {
    renderApp('/dashboard')
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('renders the protected route when the user is authenticated', () => {
    useAuthStore.setState({ isAuthenticated: true })
    renderApp('/dashboard')
    expect(screen.getByText('Dashboard page')).toBeInTheDocument()
  })

  it('shows a full-screen loader while the session is still initializing', () => {
    useAuthStore.setState({ isInitializing: true })
    renderApp('/dashboard')
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('redirects an authenticated user away from /login', () => {
    useAuthStore.setState({ isAuthenticated: true })
    renderApp('/login')
    expect(screen.queryByText('Login page')).not.toBeInTheDocument()
  })

  it('allows an unauthenticated user to view /login', () => {
    renderApp('/login')
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })
})
