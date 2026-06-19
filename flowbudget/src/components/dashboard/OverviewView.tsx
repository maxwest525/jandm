import { useMemo } from 'react'
import type { ViewKey } from '../../types'
import { useData } from '../../context/DataContext'
import {
  budgetProgress,
  cashFlowSeries,
  computeKpis,
  spendingByCategory,
} from '../../lib/analytics'
import { KpiGrid } from './KpiGrid'
import { SpendingDonut } from './SpendingDonut'
import { CashFlowChart } from './CashFlowChart'
import { BudgetSummary } from './BudgetSummary'
import { RecentTransactions } from './RecentTransactions'

export function OverviewView({ onNavigate }: { onNavigate: (v: ViewKey) => void }) {
  const { transactions, budgets } = useData()

  const monthLabel = useMemo(
    () => new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    [],
  )
  const kpis = useMemo(() => computeKpis(transactions), [transactions])
  const spending = useMemo(() => spendingByCategory(transactions), [transactions])
  const cashflow = useMemo(() => cashFlowSeries(transactions), [transactions])
  const budgets6 = useMemo(() => budgetProgress(transactions, budgets), [transactions, budgets])

  return (
    <div className="space-y-5">
      <KpiGrid kpis={kpis} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <CashFlowChart data={cashflow} />
        </div>
        <div className="xl:col-span-2">
          <SpendingDonut data={spending} month={monthLabel} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <BudgetSummary items={budgets6} onViewAll={() => onNavigate('budgets')} />
        </div>
        <div className="xl:col-span-3">
          <RecentTransactions
            transactions={transactions}
            onViewAll={() => onNavigate('transactions')}
          />
        </div>
      </div>
    </div>
  )
}
