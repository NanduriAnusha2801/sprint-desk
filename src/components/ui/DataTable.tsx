import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface DataTableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  align?: 'left' | 'right' | 'center'
  className?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowId: (row: T) => string | number
  emptyMessage?: string
  caption?: string
}

const ALIGN_CLASSES = { left: 'text-left', right: 'text-right', center: 'text-center' }

export function DataTable<T>({ columns, data, getRowId, emptyMessage = 'No data available.', caption }: DataTableProps<T>) {
  if (data.length === 0) {
    return <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-text-muted">{emptyMessage}</p>
  }

  return (
    <div className="scrollbar-thin overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[480px] border-collapse text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-border bg-surface-sunken">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn('px-4 py-2.5 font-medium text-text-secondary', ALIGN_CLASSES[col.align ?? 'left'])}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={getRowId(row)} className="border-b border-border last:border-0 hover:bg-surface-sunken/60">
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-2.5 text-text-primary', ALIGN_CLASSES[col.align ?? 'left'], col.className)}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
