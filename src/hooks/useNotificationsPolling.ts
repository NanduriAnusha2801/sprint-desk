import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { pollLatestPosts } from '@/services/notifications/notificationsApi'
import { useNotificationsStore } from '@/store/notificationsStore'
import { useToast } from '@/hooks/useToast'

const POLL_INTERVAL_MS = 15000

/**
 * refetchInterval is left to TanStack Query's default focus manager, which
 * already pauses/resumes background polling on document.visibilityState —
 * a second manual listener would just duplicate that behavior.
 */
export function useNotificationsPolling(isPanelOpen: boolean) {
  const ingestPosts = useNotificationsStore((s) => s.ingestPosts)
  const { toast } = useToast()
  const isPanelOpenRef = useRef(isPanelOpen)
  isPanelOpenRef.current = isPanelOpen

  const query = useQuery({
    queryKey: ['notifications', 'poll'],
    queryFn: pollLatestPosts,
    refetchInterval: POLL_INTERVAL_MS,
  })

  useEffect(() => {
    if (!query.data) return
    const created = ingestPosts(query.data)
    if (created.length > 0 && !isPanelOpenRef.current) {
      const message = created.length === 1 ? created[0]!.message : `${created.length} new notifications arrived`
      toast(message, 'info', 'New notification')
    }
  }, [query.data, ingestPosts, toast])
}
