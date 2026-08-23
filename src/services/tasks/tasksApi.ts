import loadMockData from '@/services/mockData/mockDataClient'
import type { Task } from '@/types'

const BOARD_TASK_LIMIT = 30

export async function getInitialTasks(): Promise<Task[]> {
  const data = await loadMockData()
  return data.tasks.slice(0, BOARD_TASK_LIMIT)
}
