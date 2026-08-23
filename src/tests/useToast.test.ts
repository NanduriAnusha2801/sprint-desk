import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { useToast } from '@/hooks/useToast'
import { useToastStore } from '@/store/toastStore'

beforeEach(() => {
  useToastStore.setState({ toasts: [] })
})

describe('useToast', () => {
  it('adds a toast with the given message and variant', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast('Task created successfully.', 'success', 'Success')
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0]).toMatchObject({
      message: 'Task created successfully.',
      variant: 'success',
      title: 'Success',
    })
  })

  it('defaults to the info variant when none is provided', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast('Something happened')
    })

    expect(result.current.toasts[0]?.variant).toBe('info')
  })

  it('dismisses a toast by id', () => {
    const { result } = renderHook(() => useToast())

    let id = -1
    act(() => {
      id = result.current.toast('Dismiss me')
    })
    expect(result.current.toasts).toHaveLength(1)

    act(() => {
      result.current.dismiss(id)
    })
    expect(result.current.toasts).toHaveLength(0)
  })

  it('auto-dismisses a toast after the default duration', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast('Temporary message')
    })
    expect(result.current.toasts).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(4000)
    })
    expect(result.current.toasts).toHaveLength(0)
    vi.useRealTimers()
  })

  it('supports multiple simultaneous toasts', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast('First')
      result.current.toast('Second')
    })

    expect(result.current.toasts).toHaveLength(2)
  })
})
