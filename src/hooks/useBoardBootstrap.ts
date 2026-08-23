import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getInitialTasks } from '@/services/tasks/tasksApi'
import { getInitialComments } from '@/services/comments/commentsApi'
import { useBoardStore } from '@/store/boardStore'

/**
 * Seeds the board store from mock data exactly once. On subsequent visits
 * the persisted Zustand state (which may include user edits) is the source
 * of truth, so the query is skipped entirely.
 */
export function useBoardBootstrap() {
  const seedIfEmpty = useBoardStore((s) => s.seedIfEmpty)
  const hydrated = useBoardStore((s) => s.hydrated)

  const query = useQuery({
    queryKey: ['bootstrap', 'board'],
    queryFn: async () => {
      const [tasks, comments] = await Promise.all([getInitialTasks(), getInitialComments()])
      return { tasks, comments }
    },
    enabled: !hydrated,
    staleTime: Infinity,
  })

  useEffect(() => {
    if (query.data) seedIfEmpty(query.data.tasks, query.data.comments)
  }, [query.data, seedIfEmpty])

  return { isLoading: !hydrated && query.isLoading, isError: query.isError }
}
