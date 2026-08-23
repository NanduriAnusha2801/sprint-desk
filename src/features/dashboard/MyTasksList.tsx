import { Link } from 'react-router-dom'
import { ListChecks, ChevronRight } from 'lucide-react'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatShortDate, isOverdue } from '@/lib/date'
import { cn } from '@/lib/cn'
import type { Task } from '@/types'

interface MyTasksListProps {
  tasks: Task[]
  viewAllHref: string
  onTaskClick: (taskId: number) => void
}

export function MyTasksList({ tasks, viewAllHref, onTaskClick }: MyTasksListProps) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">My tasks</h2>
        <Link to={viewAllHref} className="text-xs font-medium text-accent hover:underline">
          View all
        </Link>
      </div>

      {tasks.length === 0 ? (
        <EmptyState icon={<ListChecks className="size-5" aria-hidden="true" />} title="Nothing assigned to you right now" />
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {tasks.map((task) => (
            <li key={task.id}>
              <button
                type="button"
                onClick={() => onTaskClick(task.id)}
                className="group -mx-2 flex w-full items-center justify-between gap-3 rounded-md px-2 py-2.5 text-left hover:bg-surface-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary group-hover:text-accent">{task.title}</p>
                  <p className={cn('text-xs', isOverdue(task.dueDate, task.status) ? 'font-medium text-danger' : 'text-text-muted')}>
                    Due {formatShortDate(task.dueDate)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <StatusBadge status={task.status} />
                  <ChevronRight className="size-4 text-text-muted" aria-hidden="true" />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
