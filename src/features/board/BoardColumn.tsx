import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ChevronDown, Inbox } from 'lucide-react'
import { TaskCard } from '@/features/board/TaskCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { STATUS_LABELS, type Task, type TaskStatus, type User } from '@/types'
import { cn } from '@/lib/cn'

const INITIAL_VISIBLE = 6
const REVEAL_STEP = 8

const STATUS_DOT: Record<TaskStatus, string> = {
  backlog: 'bg-text-muted',
  'in-progress': 'bg-info',
  review: 'bg-warning',
  done: 'bg-success',
}

interface BoardColumnProps {
  status: TaskStatus
  tasks: Task[]
  usersById: Map<number, User>
  onOpenTask: (id: number) => void
  onDeleteTask: (id: number) => void
}

export function BoardColumn({ status, tasks, usersById, onOpenTask, onDeleteTask }: BoardColumnProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE)
  const { setNodeRef, isOver } = useDroppable({ id: status })

  const visibleTasks = tasks.slice(0, visibleCount)
  const remaining = tasks.length - visibleTasks.length

  return (
    <div className="flex w-full min-w-0 flex-col rounded-xl border border-border bg-surface-raised sm:w-[290px] sm:shrink-0">
      <div className="flex items-baseline justify-between px-4 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <span className={cn('size-1.5 rounded-full', STATUS_DOT[status])} aria-hidden="true" />
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary">
            {STATUS_LABELS[status]}
          </h2>
        </div>
        <span className="text-xs font-medium tabular-nums text-text-muted">{tasks.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'scrollbar-thin flex min-h-24 flex-1 flex-col gap-2.5 px-2.5 pb-3 transition-colors',
          isOver && 'bg-accent/[0.04]',
        )}
      >
        {/*
          items must match exactly what's rendered below — passing every
          task in the column (rather than just the paginated-visible ones)
          left dnd-kit measuring against sortable nodes that don't exist in
          the DOM, which is what made dragging feel unreliable in any column
          with more tasks than the initial page size.
        */}
        <SortableContext items={visibleTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {visibleTasks.length === 0 && tasks.length === 0 ? (
            <EmptyState icon={<Inbox className="size-5" aria-hidden="true" />} title="No tasks" description="Drag a task here to add it to this column." />
          ) : (
            visibleTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                assignee={usersById.get(task.assigneeId)}
                onOpen={onOpenTask}
                onDelete={onDeleteTask}
              />
            ))
          )}
        </SortableContext>

        {remaining > 0 && (
          <button
            type="button"
            onClick={() => setVisibleCount((v) => v + REVEAL_STEP)}
            className="flex items-center justify-center gap-1 rounded-md border border-dashed border-border py-2 text-xs font-medium text-text-secondary hover:bg-surface-sunken"
          >
            Show more ({remaining})
            <ChevronDown className="size-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}
