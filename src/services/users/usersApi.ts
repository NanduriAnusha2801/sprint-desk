import loadMockData from '@/services/mockData/mockDataClient'
import type { User } from '@/types'

export async function getUsers(): Promise<User[]> {
  const data = await loadMockData()
  return data.users
}
