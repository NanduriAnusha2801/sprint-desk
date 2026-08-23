import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '@/components/domain/ChartCard'
import { useChartPalette } from '@/hooks/useChartPalette'
import type { PriorityBreakdownPoint } from '@/features/analytics/analyticsSelectors'

export function PriorityBreakdownChart({ data }: { data: PriorityBreakdownPoint[] }) {
  const palette = useChartPalette()

  return (
    <ChartCard title="Priority breakdown" description="Task priorities across columns">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
          <XAxis dataKey="status" tick={{ fill: palette.text, fontSize: 12 }} axisLine={{ stroke: palette.grid }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: palette.text, fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'rgb(var(--color-surface-raised))', border: `1px solid ${palette.grid}`, borderRadius: 8, fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: palette.text }} />
          <Bar dataKey="high" name="High" stackId="priority" fill={palette.danger} radius={[0, 0, 0, 0]} maxBarSize={40} />
          <Bar dataKey="medium" name="Medium" stackId="priority" fill={palette.warning} maxBarSize={40} />
          <Bar dataKey="low" name="Low" stackId="priority" fill={palette.info} radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
