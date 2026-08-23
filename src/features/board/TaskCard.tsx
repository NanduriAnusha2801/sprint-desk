import { memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2, GripVertical } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { PriorityBadge } from '@/components/domain/PriorityBadge'
import { TaskDueBadge } from '@/features/board/TaskDueBadge'
import { cn } from '@/lib/cn'
import type { Task, User } from '@/types'

interface TaskCardProps {
  task: Task
  assignee: User | undefined
  onOpen: (taskId: number) => void
  onDelete: (taskId: number) => void
}

function TaskCardImpl({ task, assignee, onOpen, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className={cn('group relative', isDragging && 'z-10')}>
      {/*
        The whole card is both the drag surface (long-press, via the
        PointerSensor's delay/tolerance activation constraint on BoardPage)
        and the "open" trigger: a quick click/tap releases before the delay
        elapses, so dnd-kit never captures it and the native click fires
        normally. Keyboard drag is Space-only (configured on the sensor) so
        Enter is left free to activate the button and open the drawer.
      */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        onClick={() => onOpen(task.id)}
        className={cn(
          'flex w-full touch-none flex-col gap-3 rounded-lg border border-border bg-surface p-3.5 pr-8 text-left transition-shadow',
          isDragging ? 'cursor-grabbing opacity-50 shadow-popover' : 'cursor-pointer shadow-card hover:shadow-md',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug text-text-primary">{task.title}</p>
          <GripVertical className="mt-0.5 size-3.5 shrink-0 text-text-muted/50" aria-hidden="true" />
        </div>

        <div className="flex items-center justify-between gap-2">
          <PriorityBadge priority={task.priority} />
          <TaskDueBadge dueDate={task.dueDate} status={task.status} />
        </div>

        {assignee && (
          <div className="flex items-center gap-2 border-t border-border pt-3">
            <Avatar src={assignee.avatar} name={assignee.name} size="xs" />
            <span className="text-xs leading-snug text-text-secondary">{assignee.name}</span>
          </div>
        )}
      </button>

      <button
        type="button"
        onClick={() => onDelete(task.id)}
        aria-label={`Delete task ${task.title}`}
        className="absolute right-2.5 top-2.5 rounded p-1 text-text-muted opacity-0 hover:bg-danger/10 hover:text-danger group-hover:opacity-100 focus-visible:opacity-100"
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}

export const TaskCard = memo(TaskCardImpl)
