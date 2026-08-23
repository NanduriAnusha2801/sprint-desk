import type { Sprint } from '@/types'

export function getCurrentSprint(sprints: Sprint[]): Sprint | undefined {
  const today = new Date()
  return (
    sprints.find((s) => today >= new Date(s.startDate) && today <= new Date(s.endDate)) ??
    sprints[sprints.length - 1]
  )
}
