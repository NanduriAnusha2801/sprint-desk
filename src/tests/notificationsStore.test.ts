import { beforeEach, describe, expect, it } from 'vitest'
import { useNotificationsStore } from '@/store/notificationsStore'
import type { JsonPlaceholderPost } from '@/services/notifications/notificationsApi'
import type { AppNotification } from '@/types'

beforeEach(() => {
  useNotificationsStore.setState({ notifications: [], processedPostIds: [], seeded: false })
})

const posts: JsonPlaceholderPost[] = [
  { id: 1, title: 'first post title', body: 'first post body', userId: 1 },
  { id: 2, title: 'second post title', body: 'second post body', userId: 1 },
]

describe('notificationsStore', () => {
  it('seeds the initial mock notifications only once', () => {
    const seed = [
      { id: 101, title: 'Task assigned', message: 'msg', type: 'task' as const, read: false, createdAt: '2026-08-19T11:10:00Z', source: 'seed' as const },
    ]
    useNotificationsStore.getState().seedIfEmpty(seed)
    useNotificationsStore.getState().seedIfEmpty([])

    expect(useNotificationsStore.getState().notifications).toHaveLength(1)
  })

  it('creates notifications for unseen post ids and records them as processed', () => {
    const created = useNotificationsStore.getState().ingestPosts(posts)

    expect(created).toHaveLength(2)
    expect(useNotificationsStore.getState().notifications).toHaveLength(2)
    expect(useNotificationsStore.getState().processedPostIds.sort()).toEqual([1, 2])
  })

  it('never creates duplicate notifications for the same post id across polling cycles', () => {
    useNotificationsStore.getState().ingestPosts(posts)
    const secondPoll = useNotificationsStore.getState().ingestPosts(posts)

    expect(secondPoll).toHaveLength(0)
    expect(useNotificationsStore.getState().notifications).toHaveLength(2)
  })

  it('honors processedPostIds restored from a previous session (simulated reload) and ignores those posts', () => {
    // Simulates what zustand's persist middleware hands back on rehydration:
    // processedPostIds already populated from localStorage, no in-memory ingest yet this session.
    useNotificationsStore.setState({ processedPostIds: [1, 2], notifications: [] })

    const created = useNotificationsStore.getState().ingestPosts(posts)

    expect(created).toHaveLength(0)
    expect(useNotificationsStore.getState().notifications).toHaveLength(0)
  })

  it('only ingests the genuinely new post ids when a poll partially overlaps', () => {
    useNotificationsStore.getState().ingestPosts([posts[0]!])
    const created = useNotificationsStore.getState().ingestPosts(posts)

    expect(created).toHaveLength(1)
    expect(created[0]?.title).toBe('Second post title')
    expect(created[0]?.message).toBe('Second post body')
    expect(useNotificationsStore.getState().notifications).toHaveLength(2)
  })

  it('derives a distinct, capitalized title and message per post so entries never look like generic repeats', () => {
    const created = useNotificationsStore.getState().ingestPosts(posts)

    expect(created.map((n) => n.title)).toEqual(['First post title', 'Second post title'])
    expect(new Set(created.map((n) => n.title)).size).toBe(created.length)
  })

  it('marks a single notification as read', () => {
    useNotificationsStore.getState().ingestPosts(posts)
    const [first] = useNotificationsStore.getState().notifications

    useNotificationsStore.getState().markAsRead(first!.id)

    const updated = useNotificationsStore.getState().notifications.find((n) => n.id === first!.id)
    expect(updated?.read).toBe(true)
  })

  it('marks all notifications as read', () => {
    useNotificationsStore.getState().ingestPosts(posts)

    useNotificationsStore.getState().markAllAsRead()

    expect(useNotificationsStore.getState().notifications.every((n) => n.read)).toBe(true)
  })

  it('derives a deterministic notification id from the post id, guarding against StrictMode-style double ingestion', () => {
    useNotificationsStore.getState().ingestPosts(posts)
    const idsFirstPass = useNotificationsStore.getState().notifications.map((n) => n.id)

    useNotificationsStore.setState({ processedPostIds: [] })
    useNotificationsStore.getState().ingestPosts(posts)
    const idsSecondPass = useNotificationsStore.getState().notifications.map((n) => n.id)

    expect(new Set(idsSecondPass).size).toBe(idsSecondPass.length)
    expect(idsFirstPass.sort()).toEqual(idsSecondPass.sort())
  })

  it('handles a realistic multi-cycle sequence: repeats add nothing, a growing/shifting window adds only what is genuinely new', () => {
    const post = (id: number): JsonPlaceholderPost => ({ id, title: `post ${id} title`, body: `post ${id} body`, userId: 1 })

    const cycle1 = useNotificationsStore.getState().ingestPosts([1, 2, 3, 4, 5].map(post))
    expect(cycle1).toHaveLength(5)

    const cycle2 = useNotificationsStore.getState().ingestPosts([1, 2, 3, 4, 5].map(post))
    expect(cycle2).toHaveLength(0)

    const cycle3 = useNotificationsStore.getState().ingestPosts([1, 2, 3, 4, 5].map(post))
    expect(cycle3).toHaveLength(0)
    expect(useNotificationsStore.getState().notifications).toHaveLength(5)

    const cycle4 = useNotificationsStore.getState().ingestPosts([1, 2, 3, 4, 5, 6].map(post))
    expect(cycle4).toHaveLength(1)
    expect(cycle4[0]?.sourcePostId).toBe(6)
    expect(useNotificationsStore.getState().notifications).toHaveLength(6)

    const cycle5 = useNotificationsStore.getState().ingestPosts([4, 5, 6, 7, 8].map(post))
    expect(cycle5.map((n) => n.sourcePostId).sort()).toEqual([7, 8])
    expect(useNotificationsStore.getState().notifications).toHaveLength(8)
    expect(useNotificationsStore.getState().processedPostIds.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  describe('pruneDuplicates', () => {
    it('evicts legacy "New activity"-titled entries and frees their post id for correct re-ingestion', () => {
      useNotificationsStore.setState({
        notifications: [
          { id: 1000001, title: 'New activity', message: 'first post title', type: 'update', read: false, createdAt: '2026-08-19T00:00:00Z', source: 'poll', sourcePostId: 1 },
          { id: 101, title: 'Task assigned', message: 'msg', type: 'task', read: false, createdAt: '2026-08-19T11:10:00Z', source: 'seed' },
        ],
        processedPostIds: [1],
      })

      useNotificationsStore.getState().pruneDuplicates()

      const afterPrune = useNotificationsStore.getState()
      expect(afterPrune.notifications).toHaveLength(1)
      expect(afterPrune.notifications[0]?.source).toBe('seed')
      expect(afterPrune.processedPostIds).not.toContain(1)

      const created = useNotificationsStore.getState().ingestPosts([posts[0]!])
      expect(created).toHaveLength(1)
      expect(created[0]?.title).toBe('First post title')
      expect(useNotificationsStore.getState().notifications.filter((n) => n.sourcePostId === 1)).toHaveLength(1)
    })

    it('collapses exact duplicate well-formed poll notifications for the same post id, keeping processedPostIds intact', () => {
      useNotificationsStore.setState({
        notifications: [
          { id: 1000001, title: 'First post title', message: 'First post body', type: 'update', read: false, createdAt: '2026-08-20T00:00:00Z', source: 'poll', sourcePostId: 1 },
          { id: 1000001, title: 'First post title', message: 'First post body', type: 'update', read: true, createdAt: '2026-08-19T00:00:00Z', source: 'poll', sourcePostId: 1 },
        ],
        processedPostIds: [1],
      })

      useNotificationsStore.getState().pruneDuplicates()

      const state = useNotificationsStore.getState()
      expect(state.notifications).toHaveLength(1)
      expect(state.processedPostIds).toEqual([1])
    })

    it('is a no-op when there is nothing to clean up', () => {
      useNotificationsStore.getState().ingestPosts(posts)
      const before = useNotificationsStore.getState().notifications

      useNotificationsStore.getState().pruneDuplicates()

      expect(useNotificationsStore.getState().notifications).toEqual(before)
    })

    it('evicts a "New activity" record even when it predates the `source` field entirely (oldest persisted shape)', () => {
      useNotificationsStore.setState({
        notifications: [
          // No `source`/`sourcePostId` at all — the shape persisted by the very first
          // (pre-dedup) implementation. This must not survive just because it doesn't
          // match `source === 'poll'`.
          { id: 1, title: 'New activity', message: 'msg', type: 'update', read: false, createdAt: '2026-08-01T00:00:00Z' } as unknown as AppNotification,
          { id: 101, title: 'Task assigned', message: 'msg', type: 'task', read: false, createdAt: '2026-08-19T11:10:00Z', source: 'seed' },
        ],
        processedPostIds: [],
      })

      useNotificationsStore.getState().pruneDuplicates()

      const afterPrune = useNotificationsStore.getState().notifications
      expect(afterPrune).toHaveLength(1)
      expect(afterPrune[0]?.title).toBe('Task assigned')
    })

    it('never leaves a stale record that recreates itself as a duplicate on the next poll', () => {
      useNotificationsStore.setState({
        notifications: [
          { id: 1000001, title: 'New activity', message: 'first post title', type: 'update', read: false, createdAt: '2026-08-19T00:00:00Z', source: 'poll', sourcePostId: 1 },
        ],
        processedPostIds: [1],
      })

      useNotificationsStore.getState().pruneDuplicates()
      useNotificationsStore.getState().ingestPosts(posts)

      const ids = useNotificationsStore.getState().notifications.map((n) => n.sourcePostId).filter((id) => id === 1)
      expect(ids).toHaveLength(1)
    })
  })
})
