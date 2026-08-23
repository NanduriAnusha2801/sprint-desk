import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '@/components/domain/ChartCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { useChartPalette } from '@/hooks/useChartPalette'
import { formatShortDate } from '@/lib/date'
import { TrendingUp } from 'lucide-react'
import type { CompletionTrendPoint } from '@/features/analytics/analyticsSelectors'

export function CompletionTrendChart({ data }: { data: CompletionTrendPoint[] }) {
  const palette = useChartPalette()

  return (
    <ChartCard title="Completion trend" description="Cumulative tasks completed over time">
      {data.length === 0 ? (
        <EmptyState icon={<TrendingUp className="size-5" aria-hidden="true" />} title="No completed tasks yet" />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value: string) => formatShortDate(value)}
              tick={{ fill: palette.text, fontSize: 12 }}
              axisLine={{ stroke: palette.grid }}
              tickLine={false}
            />
            <YAxis allowDecimals={false} tick={{ fill: palette.text, fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              labelFormatter={(value) => formatShortDate(String(value))}
              contentStyle={{ background: 'rgb(var(--color-surface-raised))', border: `1px solid ${palette.grid}`, borderRadius: 8, fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="cumulativeCompleted"
              name="Completed"
              stroke={palette.success}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
