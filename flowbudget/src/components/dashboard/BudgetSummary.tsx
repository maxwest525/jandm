import type { BudgetProgress } from '../../lib/analytics'
import { Card, CardHeader } from '../ui/Card'
import { BudgetBar } from '../budgets/BudgetBar'

export function BudgetSummary({
  items,
  onViewAll,
}: {
  items: BudgetProgress[]
  onViewAll: () => void
}) {
  return (
    <Card className="pb-5">
      <CardHeader
        title="Budget watch"
        subtitle="Closest to their limit"
        action={
          <button
            onClick={onViewAll}
            className="rounded-lg px-2 py-1 text-[13px] font-medium text-brand transition-colors hover:bg-brand-soft"
          >
            View all
          </button>
        }
      />
      <div className="space-y-4 px-5 pt-4">
        {items.slice(0, 4).map((item) => (
          <BudgetBar key={item.category} item={item} />
        ))}
      </div>
    </Card>
  )
}
