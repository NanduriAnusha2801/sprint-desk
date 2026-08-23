import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-6 py-10 text-center">
      <span className="text-text-muted">{icon}</span>
      <p className="text-sm font-medium text-text-primary">{title}</p>
      {description && <p className="max-w-xs text-sm text-text-muted">{description}</p>}
      {action}
    </div>
  )
}
