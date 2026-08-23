import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { LoginForm } from '@/features/auth/LoginForm'

function renderLoginForm() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('LoginForm', () => {
  it('shows validation errors when submitted empty', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/username is required/i)).toBeInTheDocument()
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
  })

  it('keeps focus on the username field while typing multiple characters', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    const usernameInput = screen.getByLabelText(/username/i)
    await user.click(usernameInput)
    await user.type(usernameInput, 'emilys')

    expect(usernameInput).toHaveValue('emilys')
    expect(document.activeElement).toBe(usernameInput)
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    const passwordInput = screen.getByLabelText(/^password/i)
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: /show password/i }))
    expect(passwordInput).toHaveAttribute('type', 'text')
  })
})
