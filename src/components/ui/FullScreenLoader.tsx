import { Loader2 } from 'lucide-react'

export function FullScreenLoader({ label = 'Loading SprintDesk…' }: { label?: string }) {
  return (
    <div role="status" className="flex h-dvh flex-col items-center justify-center gap-3 bg-surface-sunken">
      <Loader2 className="size-8 animate-spin text-accent" aria-hidden="true" />
      <p className="text-sm text-text-secondary">{label}</p>
    </div>
  )
}
