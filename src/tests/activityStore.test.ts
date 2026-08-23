import { beforeEach, describe, expect, it } from 'vitest'
import { useActivityStore } from '@/store/activityStore'

beforeEach(() => {
  useActivityStore.setState({ entries: [] })
})

describe('activityStore', () => {
  it('logs an entry with an incrementing id, newest first', () => {
    useActivityStore.getState().log('Build Kanban board', 'Created')
    useActivityStore.getState().log('Build Kanban board', 'Moved to In Progress')

    const entries = useActivityStore.getState().entries
    expect(entries).toHaveLength(2)
    expect(entries[0]).toMatchObject({ taskTitle: 'Build Kanban board', message: 'Moved to In Progress' })
    expect(entries[1]).toMatchObject({ taskTitle: 'Build Kanban board', message: 'Created' })
    expect(entries[0]!.id).toBeGreaterThan(entries[1]!.id)
  })

  it('caps the log at 25 entries, dropping the oldest', () => {
    for (let i = 0; i < 30; i++) {
      useActivityStore.getState().log(`Task ${i}`, 'Created')
    }

    const entries = useActivityStore.getState().entries
    expect(entries).toHaveLength(25)
    expect(entries[0]?.taskTitle).toBe('Task 29')
    expect(entries.at(-1)?.taskTitle).toBe('Task 5')
  })
})
