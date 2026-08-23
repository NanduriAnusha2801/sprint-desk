import { useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { NotificationPanel } from '@/features/notifications/NotificationPanel'
import { useNotificationsStore } from '@/store/notificationsStore'
import { useNotificationsBootstrap } from '@/hooks/useNotificationsBootstrap'
import { useNotificationsPolling } from '@/hooks/useNotificationsPolling'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const unreadCount = useNotificationsStore((s) => s.notifications.filter((n) => !n.read).length)

  useNotificationsBootstrap()
  useNotificationsPolling(isOpen)
  useOnClickOutside(containerRef, isOpen, () => setIsOpen(false))

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        className="relative inline-flex size-9 items-center justify-center rounded-md text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
      >
        <Bell className="size-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-40 mt-2">
          <NotificationPanel />
        </div>
      )}
    </div>
  )
}
