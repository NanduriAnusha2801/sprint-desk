# API documentation

SprintDesk talks to three data sources. This document covers the external endpoints it
calls and the internal service-layer functions that wrap them.

## External APIs

### DummyJSON — authentication

Base URL: `https://dummyjson.com`

#### `POST /auth/login`

Called by `services/auth/authApi.ts#login`.

Request body:

```json
{ "username": "emilys", "password": "emilyspass", "expiresInMins": 1 }
```

`expiresInMins` is deliberately short (1 minute) so the silent-refresh flow is exercised
during normal use rather than simulated.

Response `200`:

```json
{
  "id": 1,
  "username": "emilys",
  "email": "emily.johnson@x.dummyjson.com",
  "firstName": "Emily",
  "lastName": "Johnson",
  "gender": "female",
  "image": "https://dummyjson.com/icon/emilys/128",
  "accessToken": "...",
  "refreshToken": "..."
}
```

Errors: `400`/`401` with `{ "message": "Invalid credentials" }` — surfaced to the user via
`AuthApiError` and rendered under the login form.

#### `POST /auth/refresh`

Called by `services/http/httpClient.ts#performRefresh` (never called directly by UI code).

Request body:

```json
{ "refreshToken": "...", "expiresInMins": 1 }
```

Response `200`: `{ "accessToken": "...", "refreshToken": "..." }`.

On failure, the stored refresh token is cleared and the session is torn down (the user is
redirected to `/login` on next route check).

#### `GET /auth/me`

Called by `services/auth/sessionService.ts#restoreSession` via `httpClient.authorizedFetch`
(the one place in the app that exercises the Bearer-token interceptor against a real
protected endpoint).

Headers: `Authorization: Bearer <accessToken>`

Response `200`: the `AuthUser` shape (`id`, `username`, `email`, `firstName`, `lastName`,
`image`).

### JSONPlaceholder — notification polling

Base URL: `https://jsonplaceholder.typicode.com`

#### `GET /posts?_limit=5`

Called by `services/notifications/notificationsApi.ts#pollLatestPosts`, on a 15-second
`refetchInterval` (paused automatically while the tab is hidden — see ARCHITECTURE.md).

Response `200`: an array of `{ id, title, body, userId }`. Each `id` is checked against a
persisted `processedPostIds` set; unseen ids become notifications, seen ids are ignored.
This endpoint requires no authentication.

### Local data source — `mock-data.json`

Served as a static asset from `/mock-data.json` (copied from `public/` at build time),
fetched once and memoized by `services/mockData/mockDataClient.ts`. Shape:

```ts
{
  users: User[]
  sprints: Sprint[]
  tasks: Task[]
  comments: Comment[]
  notifications: Notification[]
}
```

See `src/types/index.ts` for the full field-level types. This file is read-only; it is
never written back to, and it is never fetched more than once (every consumer awaits the
same memoized promise).

## Internal service layer

Every module below is the single call site for its resource — UI components and hooks
never fetch directly.

| Module | Function | Purpose |
|---|---|---|
| `services/auth/authApi.ts` | `login`, `refreshTokens` | Raw DummyJSON auth calls |
| `services/auth/tokenStorage.ts` | `saveRefreshToken`, `readRefreshToken`, `clearRefreshToken` | Refresh-token persistence with expiry |
| `services/auth/sessionService.ts` | `signIn`, `signOut`, `restoreSession` | Orchestrates auth store + token storage + API calls |
| `services/http/httpClient.ts` | `authorizedFetch`, `silentRefresh` | The Bearer-token interceptor with single-flight refresh |
| `services/tasks/tasksApi.ts` | `getInitialTasks` | First 30 tasks from mock data |
| `services/users/usersApi.ts` | `getUsers` | All users |
| `services/sprints/sprintsApi.ts` | `getSprints` | All sprints |
| `services/comments/commentsApi.ts` | `getInitialComments` | Seed comments |
| `services/notifications/notificationsApi.ts` | `getSeedNotifications`, `pollLatestPosts` | Seed notifications + JSONPlaceholder polling |

These are consumed by TanStack Query hooks in `src/hooks/` (`useUsersQuery`,
`useSprintsQuery`, `useBoardBootstrap`, `useNotificationsBootstrap`,
`useNotificationsPolling`, `useLoginMutation`), which is the only layer that knows about
caching, loading states, and refetch behavior.
