import type { SprintStats } from '@/features/dashboard/dashboardSelectors'

const SIZE = 112
const STROKE = 11
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const SEGMENTS: { key: keyof Pick<SprintStats, 'done' | 'inProgress' | 'review' | 'backlog'>; color: string }[] = [
  { key: 'done', color: 'rgb(var(--color-success))' },
  { key: 'inProgress', color: 'rgb(var(--color-info))' },
  { key: 'review', color: 'rgb(var(--color-warning))' },
  { key: 'backlog', color: 'rgb(var(--color-text-muted))' },
]

/**
 * A compact multi-segment ring — one arc per status, sized proportionally to
 * its share of the sprint — with the overall completion percentage at the
 * center. Deliberately hand-built (not Recharts) and small: Analytics owns
 * the full status-distribution chart, this is just a glanceable summary.
 */
export function SprintCompletionRing({ stats }: { stats: SprintStats }) {
  const total = stats.total
  const completionPct = total === 0 ? 0 : Math.round((stats.done / total) * 100)

  let cumulative = 0
  const arcs = SEGMENTS.map((segment) => {
    const count = stats[segment.key]
    const length = total === 0 ? 0 : (count / total) * CIRCUMFERENCE
    const arc = { ...segment, count, length, offset: cumulative }
    cumulative += length
    return arc
  })

  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90" role="img" aria-label={`${completionPct}% of sprint tasks completed`}>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="rgb(var(--color-border))" strokeWidth={STROKE} />
        {arcs.map(
          (arc) =>
            arc.length > 0 && (
              <circle
                key={arc.key}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={arc.color}
                strokeWidth={STROKE}
                strokeDasharray={`${arc.length} ${CIRCUMFERENCE - arc.length}`}
                strokeDashoffset={-arc.offset}
              />
            ),
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-text-primary">{completionPct}%</span>
        <span className="text-[11px] text-text-muted">complete</span>
      </div>
    </div>
  )
}
