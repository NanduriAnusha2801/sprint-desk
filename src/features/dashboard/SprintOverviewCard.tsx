import { SprintCompletionRing } from '@/features/dashboard/SprintCompletionRing'
import { formatDate } from '@/lib/date'
import type { Sprint } from '@/types'
import type { SprintStats } from '@/features/dashboard/dashboardSelectors'

interface SprintOverviewCardProps {
  sprint: Sprint
  stats: SprintStats
}

const STAT_ITEMS = (stats: SprintStats) => [
  { label: 'Completed', value: stats.done, dot: 'bg-success' },
  { label: 'In progress', value: stats.inProgress, dot: 'bg-info' },
  { label: 'Review', value: stats.review, dot: 'bg-warning' },
  { label: 'Backlog', value: stats.backlog, dot: 'bg-text-muted' },
]

export function SprintOverviewCard({ sprint, stats }: SprintOverviewCardProps) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Current sprint</p>
          <h2 className="text-lg font-semibold text-text-primary">{sprint.name}</h2>
        </div>
        <p className="text-sm text-text-secondary">
          {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}
        </p>
      </div>

      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-5">
          <SprintCompletionRing stats={stats} />
          <div>
            <p className="text-2xl font-semibold text-text-primary">
              {stats.done} <span className="text-base font-normal text-text-muted">/ {stats.total} completed</span>
            </p>
            <p className="mt-0.5 text-sm text-text-secondary">{stats.total - stats.done} tasks remaining this sprint</p>
          </div>
        </div>

        <dl className="grid w-full grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-5 sm:ml-auto sm:w-auto sm:grid-cols-4 sm:border-0 sm:pt-0">
          {STAT_ITEMS(stats).map((item) => (
            <div key={item.label}>
              <dt className="flex items-center gap-1.5 text-xs text-text-muted">
                <span className={`size-1.5 rounded-full ${item.dot}`} aria-hidden="true" />
                {item.label}
              </dt>
              <dd className="mt-0.5 text-xl font-semibold text-text-primary">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
