import { useMemo, useState } from 'react'
import { BellOff } from 'lucide-react'
import { NotificationItem } from '@/features/notifications/NotificationItem'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/EmptyState'
import { useNotificationsStore } from '@/store/notificationsStore'

const PAGE_SIZE = 20

export function NotificationPanel() {
  const notifications = useNotificationsStore((s) => s.notifications)
  const markAsRead = useNotificationsStore((s) => s.markAsRead)
  const markAllAsRead = useNotificationsStore((s) => s.markAllAsRead)
  const [page, setPage] = useState(1)

  const sorted = useMemo(
    () => [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notifications],
  )
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const hasUnread = notifications.some((n) => !n.read)

  return (
    <div className="w-80 rounded-lg border border-border bg-surface-raised shadow-popover sm:w-96">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-text-primary">Notifications</h2>
        <button
          type="button"
          onClick={markAllAsRead}
          disabled={!hasUnread}
          className="text-xs font-medium text-accent hover:underline disabled:pointer-events-none disabled:text-text-muted"
        >
          Mark all as read
        </button>
      </div>

      {pageItems.length === 0 ? (
        <div className="p-4">
          <EmptyState icon={<BellOff className="size-6" aria-hidden="true" />} title="No notifications yet" />
        </div>
      ) : (
        <ul className="scrollbar-thin max-h-96 overflow-y-auto p-2">
          {pageItems.map((n) => (
            <NotificationItem key={n.id} notification={n} onMarkRead={markAsRead} />
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="px-4 pb-3">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
