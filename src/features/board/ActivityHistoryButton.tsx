import { useRef, useState } from 'react'
import { History } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useActivityStore } from '@/store/activityStore'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { formatRelativeTime } from '@/lib/date'

export function ActivityHistoryButton() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const entries = useActivityStore((s) => s.entries)
  useOnClickOutside(containerRef, isOpen, () => setIsOpen(false))

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="secondary"
        leftIcon={<History className="size-4" aria-hidden="true" />}
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        Activity
      </Button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Recent board activity"
          className="absolute right-0 top-full z-40 mt-2 w-80 rounded-lg border border-border bg-surface-raised shadow-popover"
        >
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-text-primary">Recent activity</h2>
          </div>

          {entries.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={<History className="size-5" aria-hidden="true" />}
                title="No recent changes"
                description="Task moves, edits and creations will show up here."
              />
            </div>
          ) : (
            <ul className="scrollbar-thin max-h-80 overflow-y-auto p-2">
              {entries.map((entry) => (
                <li key={entry.id} className="rounded-md px-3 py-2 hover:bg-surface-sunken">
                  <p className="truncate text-sm font-medium text-text-primary">{entry.taskTitle}</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-text-secondary">{entry.message}</p>
                    <p className="shrink-0 text-xs text-text-muted">{formatRelativeTime(entry.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
