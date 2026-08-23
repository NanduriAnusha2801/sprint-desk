import { STATUS_LABELS, TASK_STATUSES, type Sprint, type Task } from '@/types'

export interface VelocityPoint {
  sprint: string
  completed: number
}

export function getVelocityData(tasks: Task[], sprints: Sprint[]): VelocityPoint[] {
  return sprints.map((sprint) => ({
    sprint: sprint.name,
    completed: tasks.filter((t) => t.sprintId === sprint.id && t.status === 'done').length,
  }))
}

export interface StatusPoint {
  status: string
  count: number
}

export function getStatusDistribution(tasks: Task[]): StatusPoint[] {
  return TASK_STATUSES.map((status) => ({
    status: STATUS_LABELS[status],
    count: tasks.filter((t) => t.status === status).length,
  }))
}

export interface PriorityBreakdownPoint {
  status: string
  high: number
  medium: number
  low: number
}

export function getPriorityBreakdown(tasks: Task[]): PriorityBreakdownPoint[] {
  return TASK_STATUSES.map((status) => {
    const inColumn = tasks.filter((t) => t.status === status)
    return {
      status: STATUS_LABELS[status],
      high: inColumn.filter((t) => t.priority === 'high').length,
      medium: inColumn.filter((t) => t.priority === 'medium').length,
      low: inColumn.filter((t) => t.priority === 'low').length,
    }
  })
}

export interface CompletionTrendPoint {
  date: string
  cumulativeCompleted: number
}

export function getCompletionTrend(tasks: Task[]): CompletionTrendPoint[] {
  const completions = tasks
    .filter((t): t is Task & { completedAt: string } => t.completedAt !== null)
    .map((t) => t.completedAt.slice(0, 10))
    .sort()

  if (completions.length === 0) return []

  const countsByDay = new Map<string, number>()
  for (const day of completions) countsByDay.set(day, (countsByDay.get(day) ?? 0) + 1)

  let cumulative = 0
  return [...countsByDay.entries()].map(([date, count]) => {
    cumulative += count
    return { date, cumulativeCompleted: cumulative }
  })
}
