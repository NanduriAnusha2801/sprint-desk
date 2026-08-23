import { NavLink } from 'react-router-dom'
import { LayoutDashboard, PanelsTopLeft, BarChart3, FolderKanban, X } from 'lucide-react'
import { cn } from '@/lib/cn'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/board', label: 'Board', icon: PanelsTopLeft },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

interface SidebarProps {
  isMobileOpen: boolean
  onCloseMobile: () => void
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 px-3" aria-label="Primary">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-surface-sunken hover:text-text-primary',
            )
          }
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export function Sidebar({ isMobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      <aside className="hidden w-56 shrink-0 border-r border-border bg-surface-raised py-4 md:flex md:flex-col">
        <div className="mb-4 flex items-center gap-2 px-4">
          <FolderKanban className="size-5 text-accent" aria-hidden="true" />
          <span className="text-sm font-bold text-text-primary">SprintDesk</span>
        </div>
        <NavItems />
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onCloseMobile} aria-hidden="true" />
          <div className="relative flex w-64 flex-col bg-surface-raised py-4 shadow-popover">
            <div className="mb-4 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <FolderKanban className="size-5 text-accent" aria-hidden="true" />
                <span className="text-sm font-bold text-text-primary">SprintDesk</span>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close navigation"
                className="rounded-md p-1 text-text-muted hover:bg-surface-sunken"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <NavItems onNavigate={onCloseMobile} />
          </div>
        </div>
      )}
    </>
  )
}
