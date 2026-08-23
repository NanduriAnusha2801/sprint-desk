import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { ToastViewport } from '@/components/ui/Toast'
import { useBoardBootstrap } from '@/hooks/useBoardBootstrap'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/board': 'Sprint Board',
  '/analytics': 'Analytics',
}

export function AppShell() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const { pathname } = useLocation()
  useBoardBootstrap()

  return (
    <div className="flex h-dvh bg-surface-sunken">
      <Sidebar isMobileOpen={isMobileNavOpen} onCloseMobile={() => setIsMobileNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={PAGE_TITLES[pathname] ?? 'SprintDesk'} onOpenMobileNav={() => setIsMobileNavOpen(true)} />
        <main className="scrollbar-thin flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
      <ToastViewport />
    </div>
  )
}
