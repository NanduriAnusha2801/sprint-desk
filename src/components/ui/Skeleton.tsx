import { cn } from '@/lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div role="presentation" aria-hidden="true" className={cn('animate-pulse rounded-md bg-surface-sunken', className)} />
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-raised p-4">
      <Skeleton className="h-4 w-3/4" />
      <SkeletonText lines={2} />
      <div className="flex items-center gap-2">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}
