import loadMockData from '@/services/mockData/mockDataClient'
import type { Comment } from '@/types'

export async function getInitialComments(): Promise<Comment[]> {
  const data = await loadMockData()
  return data.comments
}
