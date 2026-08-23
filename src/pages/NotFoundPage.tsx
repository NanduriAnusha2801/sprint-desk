import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-surface-sunken p-4 text-center">
      <Compass className="size-10 text-text-muted" aria-hidden="true" />
      <h1 className="text-lg font-semibold text-text-primary">Page not found</h1>
      <p className="max-w-xs text-sm text-text-secondary">The page you are looking for does not exist or has moved.</p>
      <Link
        to="/dashboard"
        className="mt-2 inline-flex h-9 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg hover:bg-accent-hover"
      >
        Back to dashboard
      </Link>
    </main>
  )
}
