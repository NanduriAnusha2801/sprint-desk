import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '@/components/domain/ChartCard'
import { useChartPalette } from '@/hooks/useChartPalette'
import type { VelocityPoint } from '@/features/analytics/analyticsSelectors'

export function SprintVelocityChart({ data }: { data: VelocityPoint[] }) {
  const palette = useChartPalette()

  return (
    <ChartCard title="Sprint velocity" description="Completed tasks per sprint">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
          <XAxis dataKey="sprint" tick={{ fill: palette.text, fontSize: 12 }} axisLine={{ stroke: palette.grid }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: palette.text, fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'rgb(var(--color-surface-raised))', border: `1px solid ${palette.grid}`, borderRadius: 8, fontSize: 12 }}
          />
          <Bar dataKey="completed" name="Completed tasks" fill={palette.accent} radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
