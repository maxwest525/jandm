import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CashFlowPoint } from '../../lib/analytics'
import { useTheme } from '../../context/ThemeContext'
import { formatCompact, formatCurrency } from '../../lib/format'
import { Card, CardHeader } from '../ui/Card'

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const income = payload.find((p: any) => p.dataKey === 'income')?.value ?? 0
  const expenses = payload.find((p: any) => p.dataKey === 'expenses')?.value ?? 0
  return (
    <div className="rounded-xl border border-border bg-surface px-3.5 py-2.5 shadow-pop">
      <p className="mb-1.5 text-[12px] font-semibold text-content">{label}</p>
      <Row color="var(--positive)" label="Income" value={income} />
      <Row color="var(--negative)" label="Expenses" value={expenses} />
      <div className="mt-1.5 border-t border-border pt-1.5">
        <Row color="var(--brand)" label="Net" value={income - expenses} />
      </div>
    </div>
  )
}

function Row({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-[12px]">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      <span className="text-muted">{label}</span>
      <span className="ml-auto pl-4 font-medium text-content tnum">{formatCurrency(value)}</span>
    </div>
  )
}

export function CashFlowChart({ data }: { data: CashFlowPoint[] }) {
  const { theme } = useTheme()
  const axis = theme === 'dark' ? '#69717f' : '#9aa2b1'
  const grid = theme === 'dark' ? '#242a36' : '#eceef3'

  const latest = data[data.length - 1]

  return (
    <Card className="pb-4">
      <CardHeader
        title="Cash flow"
        subtitle="Income vs. expenses, last 6 months"
        action={
          latest && (
            <div className="text-right">
              <p className="text-[11px] font-medium uppercase tracking-wide text-subtle">
                Net this month
              </p>
              <p
                className={`text-base font-bold tnum ${
                  latest.net >= 0 ? 'text-positive' : 'text-negative'
                }`}
              >
                {formatCurrency(latest.net, { cents: false })}
              </p>
            </div>
          )
        }
      />
      <div className="mt-4 h-[260px] w-full px-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--positive)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--positive)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--negative)" stopOpacity={0.24} />
                <stop offset="100%" stopColor="var(--negative)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: axis, fontSize: 12 }}
              dy={6}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={48}
              tick={{ fill: axis, fontSize: 12 }}
              tickFormatter={(v) => formatCompact(v)}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: axis, strokeDasharray: '4 4', strokeOpacity: 0.5 }}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="var(--positive)"
              strokeWidth={2.5}
              fill="url(#incomeFill)"
              animationDuration={700}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="var(--negative)"
              strokeWidth={2.5}
              fill="url(#expenseFill)"
              animationDuration={700}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-5 pt-1 text-[12px]">
        <Legend color="var(--positive)" label="Income" />
        <Legend color="var(--negative)" label="Expenses" />
      </div>
    </Card>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  )
}
