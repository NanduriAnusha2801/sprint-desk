import { useMemo } from 'react'
import { SprintVelocityChart } from '@/features/analytics/SprintVelocityChart'
import { TaskStatusChart } from '@/features/analytics/TaskStatusChart'
import { PriorityBreakdownChart } from '@/features/analytics/PriorityBreakdownChart'
import { CompletionTrendChart } from '@/features/analytics/CompletionTrendChart'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useSprintsQuery } from '@/hooks/useSprintsQuery'
import { useBoardStore } from '@/store/boardStore'
import {
  getVelocityData,
  getStatusDistribution,
  getPriorityBreakdown,
  getCompletionTrend,
} from '@/features/analytics/analyticsSelectors'

export default function AnalyticsPage() {
  const tasks = useBoardStore((s) => s.tasks)
  const hydrated = useBoardStore((s) => s.hydrated)
  const { data: sprints = [] } = useSprintsQuery()

  const velocity = useMemo(() => getVelocityData(tasks, sprints), [tasks, sprints])
  const statusDistribution = useMemo(() => getStatusDistribution(tasks), [tasks])
  const priorityBreakdown = useMemo(() => getPriorityBreakdown(tasks), [tasks])
  const completionTrend = useMemo(() => getCompletionTrend(tasks), [tasks])

  if (!hydrated) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <SprintVelocityChart data={velocity} />
      <TaskStatusChart data={statusDistribution} />
      <PriorityBreakdownChart data={priorityBreakdown} />
      <CompletionTrendChart data={completionTrend} />
    </div>
  )
}
