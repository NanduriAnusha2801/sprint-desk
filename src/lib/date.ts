export function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function isOverdue(dueDate: string, status: string): boolean {
  if (status === 'done') return false
  return new Date(dueDate) < startOfToday()
}

export function isFutureDate(dateStr: string): boolean {
  const date = new Date(dateStr)
  return date.getTime() > startOfToday().getTime()
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHour = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHour / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return formatShortDate(dateStr)
}

export function minSelectableDate(): string {
  const tomorrow = new Date(startOfToday())
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0] ?? ''
}

export function daysUntil(dateStr: string): number {
  const diffMs = new Date(dateStr).getTime() - startOfToday().getTime()
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

/** A date-only due date is treated as due by the end of that local day. */
export function dueDeadlineTimestamp(dueDate: string): number {
  const [year, month, day] = dueDate.split('-').map(Number)
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1, 23, 59, 59, 999).getTime()
}

/** "3h 18m" for durations under a day; drops the minutes once past a day. */
export function formatDuration(ms: number): string {
  const totalMinutes = Math.max(0, Math.round(Math.abs(ms) / 60000))
  const days = Math.floor(totalMinutes / (24 * 60))
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60)
  const minutes = totalMinutes % 60
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}
