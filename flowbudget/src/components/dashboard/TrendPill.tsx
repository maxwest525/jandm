import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'

/**
 * @param value  signed change (percentage points or %)
 * @param good   whether a *positive* value is a good thing (income up = good,
 *               expenses up = bad). Controls the color, not the arrow.
 */
export function TrendPill({
  value,
  good = true,
  suffix = '%',
}: {
  value: number | null
  good?: boolean
  suffix?: string
}) {
  if (value === null || Number.isNaN(value)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[12px] font-medium text-subtle">
        <Minus size={12} /> new
      </span>
    )
  }

  const up = value > 0
  const flat = Math.abs(value) < 0.05
  const isGood = flat ? null : up === good
  const color = isGood === null ? 'text-subtle bg-surface-2' : isGood ? 'text-positive' : 'text-negative'
  const bg = isGood === null ? '' : isGood ? 'bg-positive/10' : 'bg-negative/10'
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[12px] font-semibold tnum ${color} ${bg}`}
    >
      <Icon size={13} strokeWidth={2.5} />
      {Math.abs(value).toFixed(1)}
      {suffix}
    </span>
  )
}
