export type TaskStatus = 'backlog' | 'in-progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface User {
  id: number
  name: string
  email: string
  avatar: string
}

export interface Sprint {
  id: number
  name: string
  startDate: string
  endDate: string
}

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: number
  dueDate: string
  sprintId: number
  order: number
  createdAt: string
  completedAt: string | null
  updatedAt: string
}

export interface Comment {
  id: number
  taskId: number
  authorId: number
  message: string
  createdAt: string
}

export type NotificationType = 'task' | 'review' | 'update'

export interface AppNotification {
  id: number
  title: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: string
  source: 'seed' | 'poll'
  /** JSONPlaceholder post id, for polled notifications only — the dedup key. */
  sourcePostId?: number
}

export interface MockData {
  users: User[]
  sprints: Sprint[]
  tasks: Task[]
  comments: Comment[]
  notifications: Omit<AppNotification, 'source'>[]
}

export const TASK_STATUSES: TaskStatus[] = ['backlog', 'in-progress', 'review', 'done']

export const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}
