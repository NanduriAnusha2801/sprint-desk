import { Badge } from '@/components/ui/Badge'
import { STATUS_LABELS, type TaskStatus } from '@/types'

const TONE: Record<TaskStatus, 'neutral' | 'info' | 'warning' | 'success'> = {
  backlog: 'neutral',
  'in-progress': 'info',
  review: 'warning',
  done: 'success',
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <Badge tone={TONE[status]}>{STATUS_LABELS[status]}</Badge>
}
