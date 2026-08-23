import { useQuery } from '@tanstack/react-query'
import { getUsers } from '@/services/users/usersApi'

export function useUsersQuery() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: Infinity,
  })
}
