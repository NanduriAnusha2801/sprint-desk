import { beforeEach, describe, expect, it } from 'vitest'
import { useBoardStore } from '@/store/boardStore'
import { useActivityStore } from '@/store/activityStore'
import type { Task } from '@/types'

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 1,
    title: 'Task',
    description: '',
    status: 'backlog',
    priority: 'medium',
    assigneeId: 1,
    dueDate: '2026-09-01',
    sprintId: 1,
    order: 0,
    createdAt: '2026-08-01T00:00:00Z',
    completedAt: null,
    updatedAt: '2026-08-01T00:00:00Z',
    ...overrides,
  }
}

beforeEach(() => {
  useBoardStore.setState({ tasks: [], comments: [], hydrated: false })
  useActivityStore.setState({ entries: [] })
})

describe('boardStore', () => {
  it('seeds tasks and comments only once', () => {
    const seed = [makeTask({ id: 1 })]
    useBoardStore.getState().seedIfEmpty(seed, [])
    useBoardStore.getState().seedIfEmpty([makeTask({ id: 2 })], [])

    expect(useBoardStore.getState().tasks).toHaveLength(1)
    expect(useBoardStore.getState().tasks[0]?.id).toBe(1)
  })

  describe('addTask', () => {
    it('appends a task to the end of the target column with an incrementing id', () => {
      useBoardStore.setState({
        tasks: [makeTask({ id: 1, status: 'backlog', order: 0 })],
        comments: [],
        hydrated: true,
      })

      const newId = useBoardStore.getState().addTask({
        title: 'New task',
        priority: 'high',
        assigneeId: 2,
        dueDate: '2026-09-10',
        sprintId: 1,
        status: 'backlog',
      })

      const tasks = useBoardStore.getState().tasks
      expect(newId).toBe(2)
      expect(tasks).toHaveLength(2)
      const created = tasks.find((t) => t.id === newId)
      expect(created).toMatchObject({ title: 'New task', status: 'backlog', order: 1, completedAt: null })
    })
  })

  describe('moveTask', () => {
    it('reorders tasks within the same column', () => {
      useBoardStore.setState({
        tasks: [
          makeTask({ id: 1, status: 'backlog', order: 0 }),
          makeTask({ id: 2, status: 'backlog', order: 1 }),
          makeTask({ id: 3, status: 'backlog', order: 2 }),
        ],
        comments: [],
        hydrated: true,
      })

      useBoardStore.getState().moveTask(3, 'backlog', 0)

      const ordered = useBoardStore
        .getState()
        .tasks.filter((t) => t.status === 'backlog')
        .sort((a, b) => a.order - b.order)
        .map((t) => t.id)
      expect(ordered).toEqual([3, 1, 2])
    })

    it('moves a task across columns and reindexes both columns', () => {
      useBoardStore.setState({
        tasks: [
          makeTask({ id: 1, status: 'backlog', order: 0 }),
          makeTask({ id: 2, status: 'backlog', order: 1 }),
          makeTask({ id: 3, status: 'in-progress', order: 0 }),
        ],
        comments: [],
        hydrated: true,
      })

      useBoardStore.getState().moveTask(1, 'in-progress', 1)

      const state = useBoardStore.getState()
      const moved = state.tasks.find((t) => t.id === 1)
      expect(moved?.status).toBe('in-progress')
      expect(moved?.order).toBe(1)

      const backlog = state.tasks.filter((t) => t.status === 'backlog').sort((a, b) => a.order - b.order)
      expect(backlog.map((t) => t.id)).toEqual([2])
      expect(backlog[0]?.order).toBe(0)
    })

    it('sets completedAt when a task moves into done and clears it when it leaves', () => {
      useBoardStore.setState({
        tasks: [makeTask({ id: 1, status: 'backlog', order: 0 })],
        comments: [],
        hydrated: true,
      })

      useBoardStore.getState().moveTask(1, 'done', 0)
      expect(useBoardStore.getState().tasks[0]?.completedAt).not.toBeNull()

      useBoardStore.getState().moveTask(1, 'backlog', 0)
      expect(useBoardStore.getState().tasks[0]?.completedAt).toBeNull()
    })
  })

  describe('updateTaskStatus', () => {
    it('moves the task to the end of the destination column', () => {
      useBoardStore.setState({
        tasks: [
          makeTask({ id: 1, status: 'review', order: 0 }),
          makeTask({ id: 2, status: 'done', order: 0 }),
        ],
        comments: [],
        hydrated: true,
      })

      useBoardStore.getState().updateTaskStatus(1, 'done')

      const done = useBoardStore.getState().tasks.filter((t) => t.status === 'done').sort((a, b) => a.order - b.order)
      expect(done.map((t) => t.id)).toEqual([2, 1])
    })
  })

  describe('deleteTask', () => {
    it('removes the task and its comments, and reindexes the remaining column', () => {
      useBoardStore.setState({
        tasks: [
          makeTask({ id: 1, status: 'backlog', order: 0 }),
          makeTask({ id: 2, status: 'backlog', order: 1 }),
        ],
        comments: [{ id: 1, taskId: 1, authorId: 1, message: 'hi', createdAt: '2026-08-01T00:00:00Z' }],
        hydrated: true,
      })

      useBoardStore.getState().deleteTask(1)

      const state = useBoardStore.getState()
      expect(state.tasks.map((t) => t.id)).toEqual([2])
      expect(state.tasks[0]?.order).toBe(0)
      expect(state.comments).toHaveLength(0)
    })
  })

  describe('addComment', () => {
    it('appends a comment with an incrementing id', () => {
      useBoardStore.setState({ tasks: [], comments: [], hydrated: true })

      useBoardStore.getState().addComment(1, 2, 'A comment')

      expect(useBoardStore.getState().comments).toEqual([
        expect.objectContaining({ id: 1, taskId: 1, authorId: 2, message: 'A comment' }),
      ])
    })
  })

  describe('activity logging', () => {
    it('logs task creation, cross-column moves and deletion, but not same-column reordering', () => {
      useBoardStore.setState({
        tasks: [
          makeTask({ id: 1, title: 'Alpha', status: 'backlog', order: 0 }),
          makeTask({ id: 2, title: 'Beta', status: 'backlog', order: 1 }),
        ],
        comments: [],
        hydrated: true,
      })

      const newId = useBoardStore.getState().addTask({
        title: 'Gamma',
        priority: 'low',
        assigneeId: 1,
        dueDate: '2026-09-10',
        sprintId: 1,
        status: 'backlog',
      })
      useBoardStore.getState().moveTask(2, 'backlog', 0) // reorder only, same column
      useBoardStore.getState().moveTask(1, 'in-progress', 0) // real status change
      useBoardStore.getState().deleteTask(newId)

      const messages = useActivityStore.getState().entries.map((e) => `${e.taskTitle}: ${e.message}`)
      expect(messages).toEqual(['Gamma: Deleted', 'Alpha: Moved to In Progress', 'Gamma: Created'])
    })

    it('logs a status change made through updateTaskStatus (the drawer dropdown)', () => {
      useBoardStore.setState({ tasks: [makeTask({ id: 1, title: 'Alpha', status: 'review' })], comments: [], hydrated: true })

      useBoardStore.getState().updateTaskStatus(1, 'done')

      expect(useActivityStore.getState().entries[0]).toMatchObject({ taskTitle: 'Alpha', message: 'Moved to Done' })
    })

    it('logs a field edit as "Details updated"', () => {
      useBoardStore.setState({ tasks: [makeTask({ id: 1, title: 'Alpha' })], comments: [], hydrated: true })

      useBoardStore.getState().updateTask(1, { priority: 'high' })

      expect(useActivityStore.getState().entries[0]).toMatchObject({ taskTitle: 'Alpha', message: 'Details updated' })
    })
  })
})
