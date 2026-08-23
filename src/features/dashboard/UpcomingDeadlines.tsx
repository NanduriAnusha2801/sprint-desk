import { CalendarClock, AlertTriangle } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatShortDate, isOverdue, daysUntil } from '@/lib/date'
import { cn } from '@/lib/cn'
import type { Task, User } from '@/types'

interface UpcomingDeadlinesProps {
  tasks: Task[]
  usersById: Map<number, User>
  onTaskClick: (taskId: number) => void
}

function dueLabel(task: Task): string {
  if (isOverdue(task.dueDate, task.status)) return 'Overdue'
  const days = daysUntil(task.dueDate)
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  return `Due in ${days} days`
}

export function UpcomingDeadlines({ tasks, usersById, onTaskClick }: UpcomingDeadlinesProps) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-5">
      <h2 className="mb-3 text-sm font-semibold text-text-primary">Upcoming deadlines</h2>

      {tasks.length === 0 ? (
        <EmptyState icon={<CalendarClock className="size-5" aria-hidden="true" />} title="No upcoming deadlines" />
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {tasks.map((task) => {
            const overdue = isOverdue(task.dueDate, task.status)
            const assignee = usersById.get(task.assigneeId)
            return (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => onTaskClick(task.id)}
                  className="group -mx-2 flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left hover:bg-surface-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  {assignee && <Avatar src={assignee.avatar} name={assignee.name} size="sm" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary group-hover:text-accent">{task.title}</p>
                    <p className="truncate text-xs text-text-muted">{assignee?.name}</p>
                  </div>
                  <span
                    className={cn(
                      'flex shrink-0 items-center gap-1 text-xs font-medium',
                      overdue ? 'text-danger' : 'text-text-secondary',
                    )}
                  >
                    {overdue && <AlertTriangle className="size-3.5" aria-hidden="true" />}
                    {dueLabel(task)} · {formatShortDate(task.dueDate)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
