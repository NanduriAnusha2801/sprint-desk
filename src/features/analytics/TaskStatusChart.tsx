import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartCard } from '@/components/domain/ChartCard'
import { useChartPalette } from '@/hooks/useChartPalette'
import type { StatusPoint } from '@/features/analytics/analyticsSelectors'

export function TaskStatusChart({ data }: { data: StatusPoint[] }) {
  const palette = useChartPalette()
  const colors = [palette.neutral, palette.info, palette.warning, palette.success]

  return (
    <ChartCard title="Task status" description="Distribution across board columns">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="status" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
            {data.map((entry, index) => (
              <Cell key={entry.status} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: 'rgb(var(--color-surface-raised))', border: `1px solid ${palette.grid}`, borderRadius: 8, fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: palette.text }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
