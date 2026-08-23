import loadMockData from '@/services/mockData/mockDataClient'
import type { AppNotification } from '@/types'

export async function getSeedNotifications(): Promise<AppNotification[]> {
  const data = await loadMockData()
  return data.notifications.map((n) => ({ ...n, source: 'seed' as const }))
}

export interface JsonPlaceholderPost {
  id: number
  title: string
  body: string
  userId: number
}

export async function pollLatestPosts(): Promise<JsonPlaceholderPost[]> {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')
  if (!res.ok) throw new Error('Failed to poll notifications')
  return res.json() as Promise<JsonPlaceholderPost[]>
}
