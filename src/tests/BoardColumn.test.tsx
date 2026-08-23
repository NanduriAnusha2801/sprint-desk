import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { BoardColumn } from '@/features/board/BoardColumn'
import type { Task } from '@/types'

/** Mirrors BoardPage's real sensor config so click-vs-drag behaves the same in tests as in the app. */
function TestDndContext({ children }: { children: ReactNode }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { delay: 200, tolerance: 8 } }))
  return <DndContext sensors={sensors}>{children}</DndContext>
}

function makeTasks(count: number): Task[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Task ${i + 1}`,
    description: '',
    status: 'backlog',
    priority: 'medium',
    assigneeId: 1,
    dueDate: '2026-09-01',
    sprintId: 1,
    order: i,
    createdAt: '2026-08-01T00:00:00Z',
    completedAt: null,
    updatedAt: '2026-08-01T00:00:00Z',
  }))
}

function renderColumn(tasks: Task[], onOpenTask: (id: number) => void = () => {}) {
  return render(
    <TestDndContext>
      <BoardColumn status="backlog" tasks={tasks} usersById={new Map()} onOpenTask={onOpenTask} onDeleteTask={() => {}} />
    </TestDndContext>,
  )
}

describe('BoardColumn pagination', () => {
  it('renders only the first page of tasks, matching what is registered as sortable/draggable', () => {
    renderColumn(makeTasks(14))

    // Regression guard for the SortableContext/pagination bug: the number of
    // task cards actually mounted (and therefore registered with useSortable)
    // must equal the visible page, never the full column.
    expect(screen.getAllByText(/^Task \d+$/)).toHaveLength(6)
    expect(screen.getByText('Show more (8)')).toBeInTheDocument()
  })

  it('reveals more tasks — and grows the sortable set — when "Show more" is clicked', async () => {
    const user = userEvent.setup()
    renderColumn(makeTasks(14))

    await user.click(screen.getByRole('button', { name: /show more/i }))

    expect(screen.getAllByText(/^Task \d+$/)).toHaveLength(14)
    expect(screen.queryByText(/show more/i)).not.toBeInTheDocument()
  })

  it('shows the total column count in the header, independent of how many are currently visible', () => {
    renderColumn(makeTasks(14))

    expect(screen.getByText('14')).toBeInTheDocument()
  })

  it('does not paginate columns smaller than the initial page size', () => {
    renderColumn(makeTasks(3))

    expect(screen.getAllByText(/^Task \d+$/)).toHaveLength(3)
    expect(screen.queryByText(/show more/i)).not.toBeInTheDocument()
  })

  it('opens a task via a quick click, without needing the drag handle', async () => {
    const user = userEvent.setup()
    const onOpenTask = vi.fn()
    renderColumn(makeTasks(1), onOpenTask)

    await user.click(screen.getByText('Task 1'))

    expect(onOpenTask).toHaveBeenCalledWith(1)
  })
})
