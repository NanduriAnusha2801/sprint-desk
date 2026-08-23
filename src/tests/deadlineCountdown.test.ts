import { describe, expect, it } from 'vitest'
import { dueDeadlineTimestamp, formatDuration } from '@/lib/date'

describe('dueDeadlineTimestamp', () => {
  it('treats a date-only due date as the end of that local day', () => {
    const ts = dueDeadlineTimestamp('2026-08-25')
    const date = new Date(ts)

    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(7)
    expect(date.getDate()).toBe(25)
    expect(date.getHours()).toBe(23)
    expect(date.getMinutes()).toBe(59)
  })
})

describe('formatDuration', () => {
  it('formats sub-hour durations in minutes only', () => {
    expect(formatDuration(45 * 60_000)).toBe('45m')
  })

  it('formats sub-day durations as hours and minutes', () => {
    expect(formatDuration(3 * 60 * 60_000 + 18 * 60_000)).toBe('3h 18m')
  })

  it('formats multi-day durations as days and hours', () => {
    expect(formatDuration(26 * 60 * 60_000)).toBe('1d 2h')
  })

  it('treats negative durations (overdue) the same as their positive magnitude', () => {
    expect(formatDuration(-(2 * 60 * 60_000 + 14 * 60_000))).toBe('2h 14m')
  })
})
