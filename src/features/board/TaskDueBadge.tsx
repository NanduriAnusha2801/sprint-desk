import { CalendarDays, Clock, AlertTriangle } from 'lucide-react'
import { useDeadlineCountdown } from '@/hooks/useDeadlineCountdown'
import { formatDuration, formatShortDate } from '@/lib/date'
import { cn } from '@/lib/cn'
import type { TaskStatus } from '@/types'

export function TaskDueBadge({ dueDate, status }: { dueDate: string; status: TaskStatus }) {
  const { isUrgent, isOverdue, remainingMs } = useDeadlineCountdown(dueDate, status)

  if (!isUrgent) {
    return (
      <span className="flex items-center gap-1 text-xs text-text-muted">
        <CalendarDays className="size-3.5" aria-hidden="true" />
        {formatShortDate(dueDate)}
      </span>
    )
  }

  return (
    <span className={cn('flex items-center gap-1 text-xs font-medium', isOverdue ? 'text-danger' : 'text-warning')}>
      {isOverdue ? <AlertTriangle className="size-3.5" aria-hidden="true" /> : <Clock className="size-3.5" aria-hidden="true" />}
      {isOverdue ? `Overdue · ${formatDuration(remainingMs)}` : `${formatDuration(remainingMs)} left`}
    </span>
  )
}
