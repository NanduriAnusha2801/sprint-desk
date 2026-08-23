import type { Task, TaskPriority, TaskStatus } from '@/types'

export interface BoardFilters {
  priority: TaskPriority | 'all'
  assigneeId: number | 'all'
}

export const DEFAULT_FILTERS: BoardFilters = { priority: 'all', assigneeId: 'all' }

export function applyFilters(tasks: Task[], filters: BoardFilters): Task[] {
  return tasks.filter((task) => {
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false
    if (filters.assigneeId !== 'all' && task.assigneeId !== filters.assigneeId) return false
    return true
  })
}

export function getColumnTasks(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order)
}
