import { useMemo, useState } from 'react'
import { SprintOverviewCard } from '@/features/dashboard/SprintOverviewCard'
import { MyTasksList } from '@/features/dashboard/MyTasksList'
import { UpcomingDeadlines } from '@/features/dashboard/UpcomingDeadlines'
import { TeamWorkloadTable } from '@/features/dashboard/TeamWorkloadTable'
import { TaskDrawer } from '@/features/board/TaskDrawer'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useUsersQuery } from '@/hooks/useUsersQuery'
import { useSprintsQuery } from '@/hooks/useSprintsQuery'
import { useBoardStore } from '@/store/boardStore'
import { useAuthStore } from '@/store/authStore'
import { resolveCurrentMockUser } from '@/lib/currentUser'
import { getSprintStats, getUserTasks, getUpcomingDeadlines, getTeamWorkload } from '@/features/dashboard/dashboardSelectors'
import { getCurrentSprint } from '@/lib/sprint'

export default function DashboardPage() {
  const tasks = useBoardStore((s) => s.tasks)
  const hydrated = useBoardStore((s) => s.hydrated)
  const authUser = useAuthStore((s) => s.user)
  const { data: users = [] } = useUsersQuery()
  const { data: sprints = [] } = useSprintsQuery()
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)

  const usersById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users])
  const currentSprint = useMemo(() => getCurrentSprint(sprints), [sprints])
  const currentMockUser = useMemo(() => resolveCurrentMockUser(authUser, users), [authUser, users])
  const selectedTask = tasks.find((t) => t.id === selectedTaskId)

  const sprintStats = useMemo(
    () => (currentSprint ? getSprintStats(tasks, currentSprint.id) : null),
    [tasks, currentSprint],
  )
  const myTasks = useMemo(
    () => (currentMockUser ? getUserTasks(tasks, currentMockUser.id) : []),
    [tasks, currentMockUser],
  )
  const upcoming = useMemo(() => getUpcomingDeadlines(tasks), [tasks])
  const workload = useMemo(() => getTeamWorkload(tasks, users), [tasks, users])

  if (!hydrated || !currentSprint || !sprintStats) {
    return (
      <div className="flex flex-col gap-4">
        <SkeletonCard />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <SprintOverviewCard sprint={currentSprint} stats={sprintStats} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MyTasksList
          tasks={myTasks}
          viewAllHref={currentMockUser ? `/board?assignee=${currentMockUser.id}` : '/board'}
          onTaskClick={setSelectedTaskId}
        />
        <UpcomingDeadlines tasks={upcoming} usersById={usersById} onTaskClick={setSelectedTaskId} />
      </div>

      <TeamWorkloadTable rows={workload} />

      <TaskDrawer task={selectedTask} users={users} usersById={usersById} onClose={() => setSelectedTaskId(null)} />
    </div>
  )
}
