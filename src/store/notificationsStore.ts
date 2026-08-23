import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppNotification } from '@/types'
import type { JsonPlaceholderPost } from '@/services/notifications/notificationsApi'

/** Namespaces polled notification ids away from seed ids (101-104) and any future ones. */
const POLLED_ID_OFFSET = 1_000_000

function truncate(text: string, max: number): string {
  const trimmed = text.trim()
  return trimmed.length > max ? `${trimmed.slice(0, max).trimEnd()}…` : trimmed
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * JSONPlaceholder posts are lorem-ipsum, not real activity — using each
 * post's own (capitalized, truncated) title/body as the notification's
 * title/message keeps every entry visually distinct, rather than five
 * notifications all sharing one generic "New activity" heading.
 */
function toNotificationContent(post: JsonPlaceholderPost): { title: string; message: string } {
  return {
    title: truncate(capitalize(post.title), 60),
    message: truncate(capitalize(post.body.split('\n')[0] ?? post.body), 100),
  }
}

interface NotificationsState {
  notifications: AppNotification[]
  processedPostIds: number[]
  seeded: boolean
  seedIfEmpty: (seed: AppNotification[]) => void
  ingestPosts: (posts: JsonPlaceholderPost[]) => AppNotification[]
  markAsRead: (id: number) => void
  markAllAsRead: () => void
  pruneDuplicates: () => void
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],
      processedPostIds: [],
      seeded: false,

      seedIfEmpty: (seed) => {
        if (get().seeded) return
        set({ notifications: seed, seeded: true })
      },

      /**
       * A post id is only ever turned into a notification the first time it
       * is seen; the processed-id set persists across polls and refreshes so
       * the same post can never be re-notified. As a second, independent
       * guard (in case processedPostIds and notifications ever drift out of
       * sync, e.g. state persisted by an older build), a post is also
       * skipped if its deterministic notification id is already present in
       * the current list.
       */
      ingestPosts: (posts) => {
        const state = get()
        const seenPostIds = new Set(state.processedPostIds)
        const existingIds = new Set(state.notifications.map((n) => n.id))
        const fresh = posts.filter((p) => !seenPostIds.has(p.id) && !existingIds.has(POLLED_ID_OFFSET + p.id))
        if (fresh.length === 0) return []

        const created: AppNotification[] = fresh.map((p) => ({
          id: POLLED_ID_OFFSET + p.id,
          ...toNotificationContent(p),
          type: 'update',
          read: false,
          createdAt: new Date().toISOString(),
          source: 'poll',
          sourcePostId: p.id,
        }))

        set((state) => ({
          notifications: [...created, ...state.notifications],
          processedPostIds: [...state.processedPostIds, ...fresh.map((p) => p.id)],
        }))

        return created
      },

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      markAllAsRead: () =>
        set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })) })),

      /**
       * Recovery pass for state persisted by an earlier build. Two kinds of
       * bad record are possible there: literal duplicates of the same post,
       * and pre-format entries still carrying the old generic "New activity"
       * title (before notifications were given distinct, per-post text).
       * Both are evicted outright — including freeing their post id back out
       * of processedPostIds when known — rather than kept in a merged form,
       * so the next poll cycle legitimately (re-)creates a single,
       * correctly-formatted notification instead of a stale-looking one.
       */
      pruneDuplicates: () =>
        set((state) => {
          const seenPostIds = new Set<number>()
          const evictedPostIds = new Set<number>()
          const kept: AppNotification[] = []

          for (const n of state.notifications) {
            const isPoll = n.source === 'poll'
            const isLegacyFormat = isPoll && n.title === 'New activity'

            if (isLegacyFormat) {
              if (n.sourcePostId !== undefined) evictedPostIds.add(n.sourcePostId)
              continue
            }

            if (isPoll && n.sourcePostId !== undefined) {
              if (seenPostIds.has(n.sourcePostId)) continue
              seenPostIds.add(n.sourcePostId)
            }

            kept.push(n)
          }

          if (kept.length === state.notifications.length) return state

          return {
            notifications: kept,
            processedPostIds: state.processedPostIds.filter((id) => !evictedPostIds.has(id)),
          }
        }),
    }),
    {
      name: 'sprintdesk.notifications',
      partialize: (state) => ({
        notifications: state.notifications,
        processedPostIds: state.processedPostIds,
        seeded: state.seeded,
      }),
    },
  ),
)

/**
 * Runs once, synchronously, right after persisted state has hydrated from
 * localStorage — and before any component (including the notification bell,
 * which reads this store during its own first render) ever sees it. Doing
 * this here rather than in a React effect closes the brief window where a
 * child component's effects (which React fires before an ancestor's) could
 * otherwise run against not-yet-cleaned-up state.
 */
useNotificationsStore.getState().pruneDuplicates()
