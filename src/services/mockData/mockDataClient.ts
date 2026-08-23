import type { MockData } from '@/types'

let cache: Promise<MockData> | null = null

/**
 * Single fetch of the mock data source, memoized so every feature-level
 * service reads from the same in-flight/resolved promise instead of issuing
 * its own fetch('/mock-data.json') call.
 */
function loadMockData(): Promise<MockData> {
  if (!cache) {
    cache = fetch('/mock-data.json').then((res) => {
      if (!res.ok) throw new Error('Failed to load mock data')
      return res.json() as Promise<MockData>
    })
  }
  return cache
}

export default loadMockData
