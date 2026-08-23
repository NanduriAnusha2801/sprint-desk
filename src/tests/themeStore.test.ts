import { beforeEach, describe, expect, it } from 'vitest'
import { useThemeStore } from '@/store/themeStore'

beforeEach(() => {
  useThemeStore.setState({ theme: 'light' })
  localStorage.clear()
})

describe('themeStore', () => {
  it('toggles between light and dark', () => {
    useThemeStore.getState().toggleTheme()
    expect(useThemeStore.getState().theme).toBe('dark')

    useThemeStore.getState().toggleTheme()
    expect(useThemeStore.getState().theme).toBe('light')
  })

  it('sets an explicit theme', () => {
    useThemeStore.getState().setTheme('dark')
    expect(useThemeStore.getState().theme).toBe('dark')
  })

  it('persists the theme choice to localStorage', () => {
    useThemeStore.getState().setTheme('dark')

    const stored = JSON.parse(localStorage.getItem('sprintdesk.theme') ?? '{}')
    expect(stored.state.theme).toBe('dark')
  })
})
