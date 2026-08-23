import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { MyTasksList } from '@/features/dashboard/MyTasksList'
import { UpcomingDeadlines } from '@/features/dashboard/UpcomingDeadlines'
import type { Task, User } from '@/types'

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 6,
    title: 'Implement task drawer',
    description: '',
    status: 'in-progress',
    priority: 'medium',
    assigneeId: 1,
    dueDate: '2026-08-24',
    sprintId: 3,
    order: 0,
    createdAt: '2026-08-17T10:30:00Z',
    completedAt: null,
    updatedAt: '2026-08-19T09:00:00Z',
    ...overrides,
  }
}

const emily: User = { id: 1, name: 'Emily Johnson', email: 'emily@example.com', avatar: '' }

describe('Dashboard task interactions', () => {
  it('opens the task drawer inline (not a navigation) when a "My tasks" row is clicked', async () => {
    const user = userEvent.setup()
    const onTaskClick = vi.fn()
    render(
      <MemoryRouter>
        <MyTasksList tasks={[makeTask({ id: 6 })]} viewAllHref="/board?assignee=1" onTaskClick={onTaskClick} />
      </MemoryRouter>,
    )

    const row = screen.getByRole('button', { name: /implement task drawer/i })
    await user.click(row)

    expect(onTaskClick).toHaveBeenCalledWith(6)
  })

  it('still links "View all" to the board pre-filtered by the current user', () => {
    render(
      <MemoryRouter>
        <MyTasksList tasks={[]} viewAllHref="/board?assignee=1" onTaskClick={() => {}} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /view all/i })).toHaveAttribute('href', '/board?assignee=1')
  })

  it('opens the task drawer inline when an upcoming-deadline row is clicked', async () => {
    const user = userEvent.setup()
    const onTaskClick = vi.fn()
    render(
      <MemoryRouter>
        <UpcomingDeadlines
          tasks={[makeTask({ id: 8, title: 'Improve mobile board layout' })]}
          usersById={new Map([[1, emily]])}
          onTaskClick={onTaskClick}
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /improve mobile board layout/i }))

    expect(onTaskClick).toHaveBeenCalledWith(8)
  })
})
