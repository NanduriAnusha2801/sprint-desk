import { X } from 'lucide-react'
import { Select } from '@/components/ui/Select'
import { PRIORITY_LABELS, type User } from '@/types'
import { DEFAULT_FILTERS, type BoardFilters as BoardFiltersState } from '@/features/board/boardHelpers'

interface BoardFiltersProps {
  filters: BoardFiltersState
  onChange: (filters: BoardFiltersState) => void
  users: User[]
}

export function BoardFilters({ filters, onChange, users }: BoardFiltersProps) {
  const isActive = filters.priority !== 'all' || filters.assigneeId !== 'all'

  return (
    <div className="flex flex-wrap items-end gap-2.5">
      <div className="w-32">
        <Select
          label="Priority"
          value={filters.priority}
          onChange={(e) => onChange({ ...filters, priority: e.target.value as BoardFiltersState['priority'] })}
          options={[{ value: 'all', label: 'All priorities' }, ...Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label }))]}
          uiSize="sm"
        />
      </div>
      <div className="w-40">
        <Select
          label="Assignee"
          value={String(filters.assigneeId)}
          onChange={(e) => onChange({ ...filters, assigneeId: e.target.value === 'all' ? 'all' : Number(e.target.value) })}
          options={[{ value: 'all', label: 'All assignees' }, ...users.map((u) => ({ value: String(u.id), label: u.name }))]}
          uiSize="sm"
        />
      </div>
      {isActive && (
        <button
          type="button"
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="mb-1.5 flex items-center gap-1 text-xs font-medium text-text-muted hover:text-text-primary"
        >
          <X className="size-3.5" aria-hidden="true" />
          Clear
        </button>
      )}
    </div>
  )
}
