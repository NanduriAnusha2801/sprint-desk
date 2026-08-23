import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ChevronDown } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/store/authStore'
import { signOut } from '@/services/auth/sessionService'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'

export function UserMenu() {
  const user = useAuthStore((s) => s.user)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useOnClickOutside(containerRef, isOpen, () => setIsOpen(false))

  if (!user) return null
  const fullName = `${user.firstName} ${user.lastName}`

  function handleLogout() {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-md p-1 pr-2 hover:bg-surface-sunken"
      >
        <Avatar src={user.image} name={fullName} size="sm" />
        <span className="hidden text-sm font-medium text-text-primary sm:inline">{fullName}</span>
        <ChevronDown className="size-4 text-text-muted" aria-hidden="true" />
      </button>
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-48 rounded-lg border border-border bg-surface-raised p-1 shadow-popover"
        >
          <p className="truncate px-3 py-2 text-xs text-text-muted">{user.email}</p>
          <button
            role="menuitem"
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger/10"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
