import { Avatar } from '@/components/ui/Avatar'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import type { WorkloadRow } from '@/features/dashboard/dashboardSelectors'

const columns: DataTableColumn<WorkloadRow>[] = [
  {
    key: 'member',
    header: 'Team member',
    render: (row) => (
      <div className="flex items-center gap-2">
        <Avatar src={row.user.avatar} name={row.user.name} size="sm" />
        <span className="font-medium">{row.user.name}</span>
      </div>
    ),
  },
  { key: 'assigned', header: 'Assigned', align: 'center', render: (row) => row.assigned },
  { key: 'inProgress', header: 'In progress', align: 'center', render: (row) => row.inProgress },
  { key: 'completed', header: 'Completed', align: 'center', render: (row) => row.completed },
  {
    key: 'completion',
    header: 'Completion',
    render: (row) => (
      <div className="flex items-center gap-2">
        <div className="w-24">
          <ProgressBar value={row.completionPct} label={`${row.user.name} completion`} />
        </div>
        <span className="text-xs text-text-secondary">{row.completionPct}%</span>
      </div>
    ),
  },
]

export function TeamWorkloadTable({ rows }: { rows: WorkloadRow[] }) {
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-5">
      <h2 className="mb-3 text-sm font-semibold text-text-primary">Team workload</h2>
      <DataTable columns={columns} data={rows} getRowId={(row) => row.user.id} caption="Team workload by member" />
    </div>
  )
}
