import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Plus, CalendarDays } from 'lucide-react'
import { BoardColumn } from '@/features/board/BoardColumn'
import { TaskDrawer } from '@/features/board/TaskDrawer'
import { CreateTaskModal } from '@/features/board/CreateTaskModal'
import { BoardFilters } from '@/features/board/BoardFilters'
import { ActivityHistoryButton } from '@/features/board/ActivityHistoryButton'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { PriorityBadge } from '@/components/domain/PriorityBadge'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useUsersQuery } from '@/hooks/useUsersQuery'
import { useSprintsQuery } from '@/hooks/useSprintsQuery'
import { useBoardStore } from '@/store/boardStore'
import { useToast } from '@/hooks/useToast'
import { applyFilters, getColumnTasks, DEFAULT_FILTERS } from '@/features/board/boardHelpers'
import { formatShortDate } from '@/lib/date'
import { getCurrentSprint } from '@/lib/sprint'
import { TASK_STATUSES, type TaskStatus } from '@/types'

export default function BoardPage() {
  const tasks = useBoardStore((s) => s.tasks)
  const hydrated = useBoardStore((s) => s.hydrated)
  const moveTask = useBoardStore((s) => s.moveTask)
  const deleteTask = useBoardStore((s) => s.deleteTask)
  const { data: users = [] } = useUsersQuery()
  const { data: sprints = [] } = useSprintsQuery()
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [createStatus, setCreateStatus] = useState<TaskStatus | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [activeDragId, setActiveDragId] = useState<number | null>(null)

  /**
   * Deep-link support for the dashboard's "open this task" / "view all my
   * tasks" actions: ?task=<id> opens the drawer, ?assignee=<id> pre-applies
   * the assignee filter. Consumed once and stripped from the URL so the
   * board's own filter/drawer state stays the single source of truth.
   */
  useEffect(() => {
    const taskParam = searchParams.get('task')
    const assigneeParam = searchParams.get('assignee')
    if (!taskParam && !assigneeParam) return

    if (taskParam) {
      const id = Number(taskParam)
      if (!Number.isNaN(id)) setSelectedTaskId(id)
    }
    if (assigneeParam) {
      const id = Number(assigneeParam)
      if (!Number.isNaN(id)) setFilters((f) => ({ ...f, assigneeId: id }))
    }
    setSearchParams({}, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const usersById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users])
  const filteredTasks = useMemo(() => applyFilters(tasks, filters), [tasks, filters])
  const currentSprint = useMemo(() => getCurrentSprint(sprints), [sprints])
  const selectedTask = tasks.find((t) => t.id === selectedTaskId)
  const pendingDeleteTask = tasks.find((t) => t.id === pendingDeleteId)
  const activeDragTask = tasks.find((t) => t.id === activeDragId)

  /**
   * A brief press-and-hold (not just any touch/click) starts a drag, anywhere
   * on the card; a quick tap releases before the delay and is left to fire as
   * a normal click. Keyboard drag is intentionally Space-only (not the
   * default Space+Enter) so Enter stays free to activate the card's click
   * handler and open the drawer.
   */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: { start: ['Space'], cancel: ['Escape'], end: ['Space'] },
    }),
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(Number(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null)
    const { active, over } = event
    if (!over) return

    const activeId = Number(active.id)
    const overId = over.id
    const activeTask = tasks.find((t) => t.id === activeId)
    if (!activeTask) return

    let toStatus: TaskStatus
    let toIndex: number

    if ((TASK_STATUSES as string[]).includes(String(overId))) {
      toStatus = overId as TaskStatus
      toIndex = getColumnTasks(tasks, toStatus).length
    } else {
      const overTask = tasks.find((t) => t.id === Number(overId))
      if (!overTask) return
      toStatus = overTask.status
      toIndex = getColumnTasks(tasks, toStatus).findIndex((t) => t.id === overTask.id)
    }

    if (toStatus === activeTask.status && toIndex === activeTask.order) return
    moveTask(activeId, toStatus, toIndex)
  }

  function handleDelete(id: number) {
    deleteTask(id)
    toast('Task deleted.', 'success')
    setPendingDeleteId(null)
    if (selectedTaskId === id) setSelectedTaskId(null)
  }

  if (!hydrated) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <BoardFilters filters={filters} onChange={setFilters} users={users} />
        <div className="flex items-center gap-2">
          <ActivityHistoryButton />
          <Button leftIcon={<Plus className="size-4" aria-hidden="true" />} onClick={() => setCreateStatus('backlog')}>
            New task
          </Button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-4 sm:flex-row sm:overflow-x-auto sm:pb-2">
          {TASK_STATUSES.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              tasks={getColumnTasks(filteredTasks, status)}
              usersById={usersById}
              onOpenTask={setSelectedTaskId}
              onDeleteTask={setPendingDeleteId}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDragTask && (
            <div className="w-[270px] rotate-1 rounded-lg border border-border-strong bg-surface p-3.5 shadow-popover">
              <p className="mb-3 text-sm font-medium text-text-primary">{activeDragTask.title}</p>
              <div className="flex items-center justify-between gap-2">
                <PriorityBadge priority={activeDragTask.priority} />
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  {formatShortDate(activeDragTask.dueDate)}
                </span>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <TaskDrawer task={selectedTask} users={users} usersById={usersById} onClose={() => setSelectedTaskId(null)} />

      <CreateTaskModal
        isOpen={createStatus !== null}
        onClose={() => setCreateStatus(null)}
        defaultStatus={createStatus ?? 'backlog'}
        users={users}
        currentSprint={currentSprint}
      />

      <ConfirmDialog
        isOpen={pendingDeleteTask !== undefined}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => pendingDeleteTask && handleDelete(pendingDeleteTask.id)}
        title="Delete task"
        description={`Are you sure you want to delete "${pendingDeleteTask?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  )
}
