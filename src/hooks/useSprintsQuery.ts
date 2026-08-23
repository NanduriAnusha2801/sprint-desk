import { useQuery } from '@tanstack/react-query'
import { getSprints } from '@/services/sprints/sprintsApi'

export function useSprintsQuery() {
  return useQuery({
    queryKey: ['sprints'],
    queryFn: getSprints,
    staleTime: Infinity,
  })
}
