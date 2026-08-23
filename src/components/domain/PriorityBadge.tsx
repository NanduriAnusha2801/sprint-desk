import { ArrowUp, ArrowRight, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { PRIORITY_LABELS, type TaskPriority } from '@/types'

const CONFIG: Record<TaskPriority, { textClass: string; icon: typeof ArrowUp }> = {
  high: { textClass: 'text-danger', icon: ArrowUp },
  medium: { textClass: 'text-warning', icon: ArrowRight },
  low: { textClass: 'text-info', icon: ArrowDown },
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const { textClass, icon: Icon } = CONFIG[priority]
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', textClass)}>
      <Icon className="size-3" aria-hidden="true" />
      {PRIORITY_LABELS[priority]}
    </span>
  )
}
