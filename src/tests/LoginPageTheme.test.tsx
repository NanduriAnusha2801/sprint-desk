import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it } from 'vitest'
import LoginPage from '@/pages/LoginPage'
import { useThemeStore } from '@/store/themeStore'

function renderLoginPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  useThemeStore.setState({ theme: 'light' })
  localStorage.clear()
})

describe('LoginPage theme toggle', () => {
  it('renders an accessible theme toggle that reuses the shared theme store', async () => {
    const user = userEvent.setup()
    renderLoginPage()
    const toggle = screen.getByRole('button', { name: /switch to dark theme/i })

    expect(useThemeStore.getState().theme).toBe('light')

    await user.click(toggle)
    expect(useThemeStore.getState().theme).toBe('dark')
    expect(screen.getByRole('button', { name: /switch to light theme/i })).toBeInTheDocument()

    await user.click(toggle)
    expect(useThemeStore.getState().theme).toBe('light')
  })

  it('is reachable and operable by keyboard', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.tab()
    // Keep tabbing until the theme toggle (or the end of the tab order) is reached.
    for (let i = 0; i < 10 && document.activeElement?.getAttribute('aria-label')?.includes('theme') !== true; i++) {
      await user.tab()
    }
    expect(document.activeElement).toHaveAttribute('aria-label', 'Switch to dark theme')

    await user.keyboard('{Enter}')
    expect(useThemeStore.getState().theme).toBe('dark')
  })

  it('persists the choice via the existing theme persistence mechanism', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.click(screen.getByRole('button', { name: /switch to dark theme/i }))

    const stored = JSON.parse(localStorage.getItem('sprintdesk.theme') ?? '{}')
    expect(stored.state.theme).toBe('dark')
  })
})
