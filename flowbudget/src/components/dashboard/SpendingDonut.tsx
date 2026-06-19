import { PieChart as PieChartIcon } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import type { CategorySlice } from '../../lib/analytics'
import { CATEGORY_META } from '../../lib/categories'
import { formatCurrency } from '../../lib/format'
import { Card, CardHeader } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'

export function SpendingDonut({ data, month }: { data: CategorySlice[]; month: string }) {
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <Card className="flex flex-col pb-5">
      <CardHeader title="Spending by category" subtitle={month} />
      {data.length === 0 ? (
        <EmptyState
          icon={PieChartIcon}
          title="No spending yet"
          description="Add an expense this month to see the breakdown here."
        />
      ) : (
        <div className="flex flex-col items-center gap-6 px-5 pt-4 sm:flex-row sm:items-center">
          <div className="relative h-[180px] w-[180px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={86}
                  paddingAngle={2}
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                  isAnimationActive
                  animationDuration={650}
                >
                  {data.map((d) => (
                    <Cell key={d.category} fill={CATEGORY_META[d.category].color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[11px] font-medium uppercase tracking-wide text-subtle">
                Total
              </span>
              <span className="text-xl font-bold tracking-tight text-content tnum">
                {formatCurrency(total, { cents: false })}
              </span>
            </div>
          </div>

          <ul className="w-full flex-1 space-y-1.5" aria-label="Spending breakdown">
            {data.slice(0, 6).map((d) => {
              const pct = total > 0 ? (d.value / total) * 100 : 0
              return (
                <li key={d.category} className="flex items-center gap-3 text-sm">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: CATEGORY_META[d.category].color }}
                  />
                  <span className="flex-1 truncate text-content">{d.category}</span>
                  <span className="text-[12px] text-subtle tnum">{pct.toFixed(0)}%</span>
                  <span className="w-20 text-right font-medium text-content tnum">
                    {formatCurrency(d.value, { cents: false })}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </Card>
  )
}
