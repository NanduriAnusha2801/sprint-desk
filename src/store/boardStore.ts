import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useActivityStore } from '@/store/activityStore'
import { STATUS_LABELS, type Comment, type Task, type TaskPriority, type TaskStatus } from '@/types'

export interface NewTaskInput {
  title: string
  description?: string
  priority: TaskPriority
  assigneeId: number
  dueDate: string
  sprintId: number
  status?: TaskStatus
}

export interface TaskEditInput {
  title?: string
  description?: string
  priority?: TaskPriority
  assigneeId?: number
  dueDate?: string
}

interface BoardState {
  tasks: Task[]
  comments: Comment[]
  hydrated: boolean
  seedIfEmpty: (tasks: Task[], comments: Comment[]) => void
  addTask: (input: NewTaskInput) => number
  updateTask: (id: number, patch: TaskEditInput) => void
  updateTaskStatus: (id: number, status: TaskStatus) => void
  moveTask: (taskId: number, toStatus: TaskStatus, toIndex: number) => void
  deleteTask: (id: number) => void
  addComment: (taskId: number, authorId: number, message: string) => void
}

function reindex(tasks: Task[]): Task[] {
  return tasks.map((t, i) => ({ ...t, order: i }))
}

function nextId(items: { id: number }[]): number {
  return items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1
}

function moveWithinBoard(tasks: Task[], taskId: number, toStatus: TaskStatus, toIndex: number): Task[] {
  const moving = tasks.find((t) => t.id === taskId)
  if (!moving) return tasks

  const fromStatus = moving.status
  const now = new Date().toISOString()
  const others = tasks.filter((t) => t.id !== taskId)

  const wasDone = fromStatus === 'done'
  const isDone = toStatus === 'done'
  const updatedMoving: Task = {
    ...moving,
    status: toStatus,
    updatedAt: now,
    completedAt: isDone ? (moving.completedAt ?? now) : wasDone && !isDone ? null : moving.completedAt,
  }

  const destColumn = others.filter((t) => t.status === toStatus).sort((a, b) => a.order - b.order)
  const clampedIndex = Math.max(0, Math.min(toIndex, destColumn.length))
  destColumn.splice(clampedIndex, 0, updatedMoving)
  const reindexedDest = reindex(destColumn)

  let reindexedSource: Task[] = []
  if (fromStatus !== toStatus) {
    const sourceColumn = others.filter((t) => t.status === fromStatus).sort((a, b) => a.order - b.order)
    reindexedSource = reindex(sourceColumn)
  }

  const touchedIds = new Set([...reindexedDest.map((t) => t.id), ...reindexedSource.map((t) => t.id)])
  const untouched = others.filter((t) => !touchedIds.has(t.id))

  return [...untouched, ...reindexedDest, ...reindexedSource]
}

/** Central place for the "recent activity" log so every entry point (drag, drawer, create, delete) stays consistent. */
function logActivity(taskTitle: string, message: string): void {
  useActivityStore.getState().log(taskTitle, message)
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      tasks: [],
      comments: [],
      hydrated: false,

      seedIfEmpty: (tasks, comments) => {
        if (get().hydrated) return
        set({ tasks, comments, hydrated: true })
      },

      addTask: (input) => {
        const id = nextId(get().tasks)
        const status = input.status ?? 'backlog'
        const order = get().tasks.filter((t) => t.status === status).length
        const now = new Date().toISOString()
        const task: Task = {
          id,
          title: input.title,
          description: input.description ?? '',
          status,
          priority: input.priority,
          assigneeId: input.assigneeId,
          dueDate: input.dueDate,
          sprintId: input.sprintId,
          order,
          createdAt: now,
          completedAt: null,
          updatedAt: now,
        }
        set((state) => ({ tasks: [...state.tasks, task] }))
        logActivity(task.title, 'Created')
        return id
      },

      updateTask: (id, patch) => {
        let updatedTitle: string | undefined
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== id) return t
            const updated = { ...t, ...patch, updatedAt: new Date().toISOString() }
            updatedTitle = updated.title
            return updated
          }),
        }))
        if (updatedTitle) logActivity(updatedTitle, 'Details updated')
      },

      updateTaskStatus: (id, status) =>
        set((state) => {
          const target = state.tasks.find((t) => t.id === id)
          if (!target || target.status === status) return state
          const destCount = state.tasks.filter((t) => t.status === status).length
          logActivity(target.title, `Moved to ${STATUS_LABELS[status]}`)
          return { tasks: moveWithinBoard(state.tasks, id, status, destCount) }
        }),

      moveTask: (taskId, toStatus, toIndex) =>
        set((state) => {
          const moving = state.tasks.find((t) => t.id === taskId)
          if (moving && moving.status !== toStatus) logActivity(moving.title, `Moved to ${STATUS_LABELS[toStatus]}`)
          return { tasks: moveWithinBoard(state.tasks, taskId, toStatus, toIndex) }
        }),

      deleteTask: (id) =>
        set((state) => {
          const target = state.tasks.find((t) => t.id === id)
          if (!target) return state
          const remainingColumn = reindex(
            state.tasks.filter((t) => t.status === target.status && t.id !== id).sort((a, b) => a.order - b.order),
          )
          const rest = state.tasks.filter((t) => t.status !== target.status)
          logActivity(target.title, 'Deleted')
          return {
            tasks: [...rest, ...remainingColumn],
            comments: state.comments.filter((c) => c.taskId !== id),
          }
        }),

      addComment: (taskId, authorId, message) =>
        set((state) => ({
          comments: [
            ...state.comments,
            { id: nextId(state.comments), taskId, authorId, message, createdAt: new Date().toISOString() },
          ],
        })),
    }),
    {
      name: 'sprintdesk.board',
      partialize: (state) => ({ tasks: state.tasks, comments: state.comments, hydrated: state.hydrated }),
    },
  ),
)
