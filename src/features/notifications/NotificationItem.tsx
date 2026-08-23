import { Briefcase, MessageSquareText, Bell } from 'lucide-react'
import { formatRelativeTime } from '@/lib/date'
import { cn } from '@/lib/cn'
import type { AppNotification, NotificationType } from '@/types'

const ICONS: Record<NotificationType, typeof Bell> = {
  task: Briefcase,
  review: MessageSquareText,
  update: Bell,
}

interface NotificationItemProps {
  notification: AppNotification
  onMarkRead: (id: number) => void
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const Icon = ICONS[notification.type]

  return (
    <li>
      <button
        type="button"
        onClick={() => !notification.read && onMarkRead(notification.id)}
        className={cn(
          'flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left hover:bg-surface-sunken',
          !notification.read && 'bg-accent/5',
        )}
      >
        <span
          className={cn(
            'mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full',
            notification.read ? 'bg-surface-sunken text-text-muted' : 'bg-accent/15 text-accent',
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-text-primary">{notification.title}</span>
            {!notification.read && <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-label="Unread" />}
          </span>
          <span className="block truncate text-sm text-text-secondary">{notification.message}</span>
          <span className="text-xs text-text-muted">{formatRelativeTime(notification.createdAt)}</span>
        </span>
      </button>
    </li>
  )
}
