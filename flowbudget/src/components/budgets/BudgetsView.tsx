import { useMemo } from 'react'
import { Wallet } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { budgetProgress } from '../../lib/analytics'
import { CATEGORY_META } from '../../lib/categories'
import { formatCurrency } from '../../lib/format'
import { Card } from '../ui/Card'
import { BudgetBar } from './BudgetBar'

export function BudgetsView() {
  const { transactions, budgets, updateBudget } = useData()
  const items = useMemo(() => budgetProgress(transactions, budgets), [transactions, budgets])

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0)
  const totalSpent = items.reduce((s, i) => s + i.spent, 0)
  const overallPct = totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0

  return (
    <div className="space-y-5">
      {/* Summary banner */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Wallet size={20} />
            </span>
            <div>
              <p className="text-[13px] font-medium text-muted">Total spent this month</p>
              <p className="text-2xl font-bold tracking-tight text-content tnum">
                {formatCurrency(totalSpent, { cents: false })}
                <span className="text-base font-medium text-subtle">
                  {' '}
                  / {formatCurrency(totalLimit, { cents: false })}
                </span>
              </p>
            </div>
          </div>
          <div className="w-full sm:w-64">
            <div className="mb-1 flex justify-between text-[12px] text-muted">
              <span>Overall</span>
              <span className="tnum">{overallPct.toFixed(0)}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-500"
                style={{ width: `${Math.max(overallPct, 2)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Editable category budgets */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {items.map((item) => {
          const Icon = CATEGORY_META[item.category].icon
          return (
            <Card key={item.category} className="p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      color: CATEGORY_META[item.category].color,
                      background: `${CATEGORY_META[item.category].color}1f`,
                    }}
                  >
                    <Icon size={18} strokeWidth={2.1} />
                  </span>
                  <span className="text-[15px] font-semibold text-content">{item.category}</span>
                </div>
                <label className="flex items-center gap-1.5 text-[13px] text-muted">
                  <span className="hidden sm:inline">Limit</span>
                  <span className="relative">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-subtle">
                      $
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={10}
                      value={item.limit}
                      onChange={(e) =>
                        updateBudget(item.category, Math.max(0, Number(e.target.value) || 0))
                      }
                      aria-label={`${item.category} monthly limit`}
                      className="h-9 w-28 rounded-lg border border-border-strong bg-surface pl-6 pr-2 text-sm font-medium text-content outline-none transition-colors focus:border-brand tnum"
                    />
                  </span>
                </label>
              </div>
              <BudgetBar item={item} />
            </Card>
          )
        })}
      </div>
    </div>
  )
}
