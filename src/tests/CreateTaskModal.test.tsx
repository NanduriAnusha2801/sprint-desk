import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { CreateTaskModal } from '@/features/board/CreateTaskModal'
import { useBoardStore } from '@/store/boardStore'
import type { User } from '@/types'

const users: User[] = [{ id: 1, name: 'Emily Johnson', email: 'emily@example.com', avatar: '' }]

beforeEach(() => {
  useBoardStore.setState({ tasks: [], comments: [], hydrated: true })
})

describe('CreateTaskModal', () => {
  it('keeps focus in the title field while typing multiple characters (regression: focus trap re-stealing focus)', async () => {
    const user = userEvent.setup()
    render(
      <CreateTaskModal
        isOpen
        onClose={() => {}}
        defaultStatus="backlog"
        users={users}
        currentSprint={{ id: 3, name: 'Sprint 3', startDate: '2026-08-17', endDate: '2026-08-28' }}
      />,
    )

    const titleInput = screen.getByLabelText(/title/i)
    await user.click(titleInput)
    await user.type(titleInput, 'Implement task drawer')

    expect(titleInput).toHaveValue('Implement task drawer')
    expect(document.activeElement).toBe(titleInput)
  })

  it('keeps focus in the description field while typing', async () => {
    const user = userEvent.setup()
    render(
      <CreateTaskModal
        isOpen
        onClose={() => {}}
        defaultStatus="backlog"
        users={users}
        currentSprint={{ id: 3, name: 'Sprint 3', startDate: '2026-08-17', endDate: '2026-08-28' }}
      />,
    )

    const description = screen.getByLabelText(/description/i)
    await user.click(description)
    await user.type(description, 'Multiple words in a row')

    expect(description).toHaveValue('Multiple words in a row')
    expect(document.activeElement).toBe(description)
  })
})
