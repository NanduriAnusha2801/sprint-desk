import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSeedNotifications } from '@/services/notifications/notificationsApi'
import { useNotificationsStore } from '@/store/notificationsStore'

export function useNotificationsBootstrap() {
  const seedIfEmpty = useNotificationsStore((s) => s.seedIfEmpty)
  const seeded = useNotificationsStore((s) => s.seeded)

  const query = useQuery({
    queryKey: ['bootstrap', 'notifications'],
    queryFn: getSeedNotifications,
    enabled: !seeded,
    staleTime: Infinity,
  })

  useEffect(() => {
    if (query.data) seedIfEmpty(query.data)
  }, [query.data, seedIfEmpty])
}
