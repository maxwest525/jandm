import type { LucideIcon } from 'lucide-react'
import { Card } from '../ui/Card'
import { TrendPill } from './TrendPill'

export function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
  trend,
  trendGood = true,
  trendSuffix = '%',
  caption,
}: {
  label: string
  value: string
  icon: LucideIcon
  accent: string
  trend?: number | null
  trendGood?: boolean
  trendSuffix?: string
  caption: string
}) {
  return (
    <Card className="p-5 transition-shadow hover:shadow-pop">
      <div className="flex items-center justify-between">
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ color: accent, background: `${accent}1f` }}
        >
          <Icon size={18} strokeWidth={2.2} />
        </span>
        {trend !== undefined && <TrendPill value={trend} good={trendGood} suffix={trendSuffix} />}
      </div>
      <p className="mt-4 text-[13px] font-medium text-muted">{label}</p>
      <p className="mt-1 text-[26px] font-bold leading-none tracking-tight text-content tnum">
        {value}
      </p>
      <p className="mt-2 text-[12px] text-subtle">{caption}</p>
    </Card>
  )
}
