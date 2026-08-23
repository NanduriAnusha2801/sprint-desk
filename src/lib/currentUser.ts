import type { AuthUser } from '@/types/auth'
import type { User } from '@/types'

/**
 * DummyJSON (auth) and mock-data.json (application domain) are separate
 * seed datasets. Both happen to share the same first users by id/name
 * (e.g. DummyJSON's "emilys" is Emily Johnson, mock-data user #1), so we
 * link them by id first and fall back to a name match, defaulting to the
 * first mock user if the signed-in account has no counterpart.
 */
export function resolveCurrentMockUser(authUser: AuthUser | null, mockUsers: User[]): User | undefined {
  if (!authUser || mockUsers.length === 0) return undefined

  const byId = mockUsers.find((u) => u.id === authUser.id)
  if (byId) return byId

  const fullName = `${authUser.firstName} ${authUser.lastName}`.toLowerCase()
  const byName = mockUsers.find((u) => u.name.toLowerCase() === fullName)
  return byName ?? mockUsers[0]
}
