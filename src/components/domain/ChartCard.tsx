import type { ReactNode } from 'react'

export function ChartCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-5">
      <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-text-muted">{description}</p>}
      <div className="mt-4 h-64">{children}</div>
    </div>
  )
}
