# SprintDesk

A sprint management dashboard for software teams — a Kanban board with drag-and-drop,
a sprint dashboard, analytics, and a simulated real-time notification system, built as
a production-oriented React application.

## Table of contents

- [Features](#features)
- [Technology stack](#technology-stack)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Environment variables](#environment-variables)
- [Architecture](#architecture)
- [Authentication](#authentication)
- [Kanban board](#kanban-board)
- [Notifications](#notifications)
- [Theming](#theming)
- [Testing](#testing)
- [Performance & accessibility](#performance--accessibility)
- [Known limitations](#known-limitations)
- [Future improvements](#future-improvements)

## Features

**Required**

- Full authentication flow against DummyJSON (login, silent token refresh, retry-after-refresh, protected routes, session persistence, logout)
- Four-column Kanban board (Backlog / In Progress / Review / Done) with `@dnd-kit` drag-and-drop, cross-column moves, and reordering
- Task detail drawer — edit fields, change status/priority/assignee/due date, add comments
- Task creation with validation (due date must be after today) and deletion with confirmation
- Sprint dashboard — current sprint overview, "my tasks", upcoming deadlines, team workload
- Analytics page — sprint velocity, task status distribution, priority breakdown, completion trend (Recharts, all derived from live board data)
- Simulated real-time notifications — polls JSONPlaceholder, deduplicates by post id, bell + panel with pagination, read/unread state, toasts for new arrivals while the panel is closed
- Light/dark theme with persistence (neutral, non-blue dark palette)
- Reusable component library (Button, Input, Select, Modal, Drawer, Toast, DataTable, Skeleton, and more)
- Responsive from 375px through desktop; keyboard accessible; route-level code splitting

**Bonus**

- Remember me (simulated 30-day refresh-token persistence)
- Password strength indicator
- Filter the board by priority / assignee
- Progressive "Show more" per column instead of paginating the whole board
- Board activity history — a running log of creates, moves, edits, and deletions
- Per-card 24-hour countdown for tasks approaching their due date, with an overdue state

## Technology stack

| Area | Choice |
|---|---|
| Framework | React 19 (satisfies "React 18+") |
| Language | TypeScript, strict mode |
| Build tool | Vite |
| Data fetching | TanStack Query v5 |
| Global state | Zustand |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Charts | Recharts |
| Drag & drop | @dnd-kit/core + @dnd-kit/sortable |
| Testing | Vitest + React Testing Library |
| Icons | lucide-react |

No other UI component library is used, per the assignment's restrictions.

## Getting started

```bash
npm install
npm run dev
```

The app runs on the port Vite prints (defaults to `http://localhost:5173`). Sign in with
the DummyJSON demo account:

```
username: emilys
password: emilyspass
```

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run lint` | Run oxlint |

## Environment variables

None. The app talks directly to two public APIs (`https://dummyjson.com` and
`https://jsonplaceholder.typicode.com`) and to the local `/mock-data.json` file — no API
keys or secrets are required.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full breakdown (data flow, folder
structure, state management boundaries) and [API.md](./API.md) for the external and
internal API surface.

In short:

```
UI components → feature hooks (TanStack Query / Zustand selectors)
             → service layer (src/services/*)
             → data source (mock-data.json, DummyJSON, JSONPlaceholder)
```

No component calls `fetch()` directly — every data access goes through a dedicated
service module, so the mock data source could be swapped for a real backend without
touching the UI layer.

- **Server state** (mock task/user/sprint data, DummyJSON auth calls, notification
  polling) is owned by TanStack Query.
- **Client/application state** (auth session, the Kanban board, notifications, theme) is
  owned by Zustand, with the board and notifications stores persisted to `localStorage`.
- **Local UI state** (form inputs, open/closed drawers and modals, per-column "show more"
  counters) stays in `useState`/`useReducer` inside the component that owns it.

## Authentication

- `POST https://dummyjson.com/auth/login` returns a short-lived access token (requested
  with `expiresInMins: 1`) and a refresh token.
- The **access token lives only in memory** (a Zustand store, never persisted).
- The **refresh token is persisted to `localStorage`** with an explicit expiry — 1 day by
  default, 30 days with "Remember me" — since DummyJSON has no real server session to
  rely on.
- `src/services/http/httpClient.ts` is the interceptor: it attaches `Authorization: Bearer
  <token>`, refreshes proactively when the token is near expiry, and — as a fallback —
  refreshes and retries once on a `401`. Concurrent callers share a single in-flight
  refresh promise so simultaneous requests never trigger duplicate `/auth/refresh` calls.
- On boot, `restoreSession()` checks for a valid stored refresh token, silently refreshes,
  and re-fetches the user via `GET /auth/me` — this is what persists the session across a
  page reload. A full-screen loader is shown while this resolves.
- The access token's one-minute lifetime is intentional: it lets the refresh flow be
  exercised naturally during normal use (and in the screen recording) instead of being
  simulated with a fake timer.

**Identity mapping.** DummyJSON's user database is a separate dataset from
`mock-data.json`. The two happen to share the same first users by id and name (DummyJSON's
`emilys` **is** "Emily Johnson", mock-data user id `1`), so `resolveCurrentMockUser`
(`src/lib/currentUser.ts`) links the signed-in DummyJSON account to a `mock-data.json`
user by id first, then by name, and falls back to the first mock user. This is what
"My tasks" on the dashboard and comment authorship use to determine "the current user."

## Kanban board

- The first 30 tasks from `mock-data.json` seed a Zustand store (`src/store/boardStore.ts`)
  on first load only; after that, the persisted store (including any edits) is the source
  of truth, so a refresh never overwrites your changes with pristine mock data.
- Each task carries an `order` field, scoped per status column. Dragging (`@dnd-kit`)
  removes the task from its source column, re-indexes it, inserts it into the destination
  column at the drop position, and re-indexes that column — all inside one store action, so
  reordering, cross-column moves, add, update, and delete all go through the same,
  independently-tested code path.
- The entire task card is both the drag surface and the click target — there is no separate
  drag handle to grab. `useSortable`'s `attributes`/`listeners` and the card's `onClick` sit
  on the same element; a `PointerSensor` activation constraint (`delay: 200ms, tolerance:
  8px`) tells them apart, so a quick click/tap opens the drawer while a press-and-hold-and-
  move starts a drag. Keyboard dragging is scoped to <kbd>Space</kbd> only (lift/move/drop),
  which leaves <kbd>Enter</kbd> free to activate the card's click handler.
- Columns render only the first few tasks and reveal more via "Show more" — a per-column
  `useState` counter, not a second copy of the task list — so counts, filters, and drag-and-
  drop all keep reading from the one Zustand array.

## Notifications

- The four notifications in `mock-data.json` seed the notifications store once.
- Polling hits `GET https://jsonplaceholder.typicode.com/posts?_limit=5` via TanStack
  Query's `refetchInterval`. TanStack Query's default focus manager already pauses
  interval refetching when `document.visibilityState` is `hidden` and resumes on
  visibility — no extra listener was needed.
- Every post id that has ever been turned into a notification is recorded in a persisted
  `processedPostIds` array; a poll only creates notifications for ids not already in that
  set, so the same post can never produce a duplicate notification, across polls or
  across a page refresh.
- A toast is shown for newly-created notifications only while the notification panel is
  closed.

## Theming

Theme is a small Zustand store persisted to `localStorage`; a `useApplyTheme` hook toggles
a `dark` class on `<html>`. All colors are CSS custom properties (see
`src/styles/globals.css`) consumed through Tailwind tokens, so components never hardcode a
light/dark color directly. The dark palette is a neutral charcoal (`rgb(24 24 26)` base),
not a blue-tinted one.

## Testing

```bash
npm run test
```

63 tests across 12 files, covering (per the assignment's minimum bar):

- `useToast` — creation, variants, dismissal, auto-dismiss, multiple toasts
- The board store — add, move (same-column reorder, cross-column, completedAt handling),
  status update, delete (including cascading comment deletion), and activity logging
- The auth interceptor — attaching a valid token, proactive refresh, reactive 401
  refresh-and-retry, single-flight refresh under concurrency, and clearing the session
  when no refresh token is available
- The notifications store — seeding, deduplication across repeated and partially-
  overlapping polls, mark-as-read, mark-all-as-read
- The theme store — toggling, setting, and persistence
- Login form validation and focus retention while typing
- Route guards — redirect unauthenticated users to `/login`, redirect authenticated users
  away from `/login`, and the full-screen loader during session initialization
- Board column pagination — the visible ("Show more") page always matches the set of
  sortable nodes registered with `@dnd-kit`, and a quick click opens a task without needing
  the drag gesture
- The dashboard's "my tasks"/"upcoming deadlines" links open the drawer in place rather than
  navigating to `/board`
- The 24-hour deadline countdown — label/urgency transitions as a due date approaches and
  passes
- Task creation modal validation

## Performance & accessibility

Measured locally with Lighthouse against the production build (`npm run build && npm run
preview`), on the `/login` route:

- **Accessibility: 100/100** (fixed during development: a color-contrast issue on muted
  text in both themes, an undersized touch target, and a missing `<main>` landmark)
- **Performance: 90–95/100** in most runs; occasional dips into the low 80s under heavy
  CPU contention from other processes on the machine used for testing. Total Blocking
  Time (50ms) and Cumulative Layout Shift (0) were consistently excellent across every
  run — the variance was isolated to First Contentful Paint/Largest Contentful Paint
  timing, which is sensitive to CPU scheduling noise rather than app-level work.

## Known limitations

- **DummyJSON identity vs. mock-data identity.** As described above, "the current user"
  for dashboard/comment purposes is resolved by matching the DummyJSON account to a
  `mock-data.json` user by id/name. Logging in with a DummyJSON account that has no
  counterpart in `mock-data.json` falls back to the first mock user (Emily Johnson) rather
  than showing an empty state — a reasonable default for a demo dataset, but worth calling
  out.
- **Notification "read" state for polled items** lives only in the local notifications
  store; there's no server to reconcile against, which matches the assignment's "simulated
  real-time" scope.
- **Export analytics as PNG** and **custom date-range filtering** (both explicitly listed
  as optional bonuses) were not implemented, to keep scope disciplined around the required
  feature set.
- **Storybook** and **axe-core automated a11y testing** (both optional bonuses for the
  component library) were not added; accessibility was instead verified manually (focus
  trapping, keyboard drag-and-drop, labels, contrast).

## Future improvements

With more time: an "undo last drag-and-drop" toast action, optimistic UI for the (currently
synchronous, local) task mutations, and axe-core wired into CI for automated accessibility
regressions.
