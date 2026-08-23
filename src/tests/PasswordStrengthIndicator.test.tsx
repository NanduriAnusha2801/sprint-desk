import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PasswordStrengthIndicator } from '@/features/auth/PasswordStrengthIndicator'

describe('PasswordStrengthIndicator', () => {
  it('shows no label for an empty password', () => {
    render(<PasswordStrengthIndicator password="" />)
    expect(screen.queryByText(/too short|weak|fair|good|strong/i)).not.toBeInTheDocument()
  })

  it('labels a short, all-lowercase password as too short', () => {
    render(<PasswordStrengthIndicator password="abc" />)
    expect(screen.getByText('Too short')).toBeInTheDocument()
  })

  it('labels an 8+ character password with no other variety as weak', () => {
    render(<PasswordStrengthIndicator password="abcdefgh" />)
    expect(screen.getByText('Weak')).toBeInTheDocument()
  })

  it('labels a password with length, uppercase and a digit as good', () => {
    render(<PasswordStrengthIndicator password="Abcdefg1" />)
    expect(screen.getByText('Good')).toBeInTheDocument()
  })

  it('labels a password meeting every criterion as strong', () => {
    render(<PasswordStrengthIndicator password="Abcdefg1!" />)
    expect(screen.getByText('Strong')).toBeInTheDocument()
  })

  it('updates the label as the password value changes, with no stale state', () => {
    const { rerender } = render(<PasswordStrengthIndicator password="abc" />)
    expect(screen.getByText('Too short')).toBeInTheDocument()

    rerender(<PasswordStrengthIndicator password="Abcdefg1!" />)
    expect(screen.getByText('Strong')).toBeInTheDocument()
    expect(screen.queryByText('Too short')).not.toBeInTheDocument()
  })
})
