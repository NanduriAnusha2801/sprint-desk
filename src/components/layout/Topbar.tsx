import { Menu } from 'lucide-react'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { NotificationBell } from '@/features/notifications/NotificationBell'
import { UserMenu } from '@/features/auth/UserMenu'

interface TopbarProps {
  title: string
  onOpenMobileNav: () => void
}

export function Topbar({ title, onOpenMobileNav }: TopbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface-raised px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
          className="-ml-1 inline-flex size-9 items-center justify-center rounded-md text-text-secondary hover:bg-surface-sunken md:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
        <h1 className="text-base font-semibold text-text-primary">{title}</h1>
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  )
}
