import type { BudgetProgress } from '../../lib/analytics'
import { CATEGORY_META } from '../../lib/categories'
import { formatCurrency } from '../../lib/format'

export function BudgetBar({ item }: { item: BudgetProgress }) {
  const pct = Math.min(item.ratio * 100, 100)
  const over = item.ratio > 1
  const near = item.ratio >= 0.85 && !over
  const barColor = over ? 'var(--negative)' : near ? 'var(--warning)' : CATEGORY_META[item.category].color

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: CATEGORY_META[item.category].color }}
          />
          <span className="text-sm font-medium text-content">{item.category}</span>
        </div>
        <span className="text-[13px] text-muted tnum">
          <span className="font-semibold text-content">{formatCurrency(item.spent, { cents: false })}</span>
          {' / '}
          {formatCurrency(item.limit, { cents: false })}
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-valuenow={Math.round(item.ratio * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${item.category} budget used`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${Math.max(pct, 2)}%`, background: barColor }}
        />
      </div>
      <p className="mt-1 text-[12px] tnum">
        {over ? (
          <span className="font-medium text-negative">
            {formatCurrency(Math.abs(item.remaining))} over budget
          </span>
        ) : (
          <span className="text-subtle">{formatCurrency(item.remaining)} left</span>
        )}
      </p>
    </div>
  )
}
