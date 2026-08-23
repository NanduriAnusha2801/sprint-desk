import { useEffect, useState } from 'react'
import { dueDeadlineTimestamp } from '@/lib/date'
import type { TaskStatus } from '@/types'

const TICK_MS = 60_000
const URGENT_WINDOW_MS = 24 * 60 * 60 * 1000

export interface DeadlineCountdown {
  /** True once the task is within 24h of its deadline (or past it) and not done. */
  isUrgent: boolean
  isOverdue: boolean
  remainingMs: number
}

/**
 * Ticks once a minute for tasks that aren't done — cheap enough to run per
 * card, and scoped to this component's own state so a tick only re-renders
 * the one card whose countdown is showing, never the rest of the board.
 */
export function useDeadlineCountdown(dueDate: string, status: TaskStatus): DeadlineCountdown {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (status === 'done') return
    const interval = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(interval)
  }, [status])

  const remainingMs = dueDeadlineTimestamp(dueDate) - now

  return {
    isUrgent: status !== 'done' && remainingMs <= URGENT_WINDOW_MS,
    isOverdue: status !== 'done' && remainingMs < 0,
    remainingMs,
  }
}
