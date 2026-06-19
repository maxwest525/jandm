import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'
import type { Kpis } from '../../lib/analytics'
import { formatCurrency, formatPercent } from '../../lib/format'
import { KpiCard } from './KpiCard'

export function KpiGrid({ kpis }: { kpis: Kpis }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Current balance"
        value={formatCurrency(kpis.balance, { cents: false })}
        icon={Wallet}
        accent="#7c3aed"
        caption="Across all accounts"
      />
      <KpiCard
        label="Income this month"
        value={formatCurrency(kpis.income, { cents: false })}
        icon={TrendingUp}
        accent="#12a06a"
        trend={kpis.incomeTrend}
        trendGood
        caption="vs. last month"
      />
      <KpiCard
        label="Spending this month"
        value={formatCurrency(kpis.expenses, { cents: false })}
        icon={TrendingDown}
        accent="#e0484d"
        trend={kpis.expenseTrend}
        trendGood={false}
        caption="vs. last month"
      />
      <KpiCard
        label="Savings rate"
        value={formatPercent(kpis.savingsRate)}
        icon={PiggyBank}
        accent="#3b82f6"
        trend={kpis.savingsTrend}
        trendGood
        trendSuffix="pt"
        caption="of income kept"
      />
    </div>
  )
}
