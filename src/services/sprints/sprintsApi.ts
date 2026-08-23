import loadMockData from '@/services/mockData/mockDataClient'
import type { Sprint } from '@/types'

export async function getSprints(): Promise<Sprint[]> {
  const data = await loadMockData()
  return data.sprints
}
