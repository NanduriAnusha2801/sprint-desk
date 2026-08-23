import type { Task, User } from '@/types'

export interface SprintStats {
  total: number
  done: number
  inProgress: number
  review: number
  backlog: number
}

export function getSprintStats(tasks: Task[], sprintId: number): SprintStats {
  const sprintTasks = tasks.filter((t) => t.sprintId === sprintId)
  return {
    total: sprintTasks.length,
    done: sprintTasks.filter((t) => t.status === 'done').length,
    inProgress: sprintTasks.filter((t) => t.status === 'in-progress').length,
    review: sprintTasks.filter((t) => t.status === 'review').length,
    backlog: sprintTasks.filter((t) => t.status === 'backlog').length,
  }
}

export function getUserTasks(tasks: Task[], userId: number): Task[] {
  return tasks.filter((t) => t.assigneeId === userId && t.status !== 'done')
}

export function getUpcomingDeadlines(tasks: Task[], limit = 6): Task[] {
  return tasks
    .filter((t) => t.status !== 'done')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, limit)
}

export interface WorkloadRow {
  user: User
  assigned: number
  inProgress: number
  completed: number
  completionPct: number
}

export function getTeamWorkload(tasks: Task[], users: User[]): WorkloadRow[] {
  return users.map((user) => {
    const userTasks = tasks.filter((t) => t.assigneeId === user.id)
    const completed = userTasks.filter((t) => t.status === 'done').length
    return {
      user,
      assigned: userTasks.length,
      inProgress: userTasks.filter((t) => t.status === 'in-progress').length,
      completed,
      completionPct: userTasks.length === 0 ? 0 : Math.round((completed / userTasks.length) * 100),
    }
  })
}
