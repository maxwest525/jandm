import { ArrowRight, Receipt } from 'lucide-react'
import type { Transaction } from '../../types'
import { formatDateShort, formatSigned } from '../../lib/format'
import { Card, CardHeader } from '../ui/Card'
import { CategoryIcon } from '../ui/CategoryBadge'
import { EmptyState } from '../ui/EmptyState'

export function RecentTransactions({
  transactions,
  onViewAll,
}: {
  transactions: Transaction[]
  onViewAll: () => void
}) {
  const recent = transactions.slice(0, 6)

  return (
    <Card className="pb-2">
      <CardHeader
        title="Recent activity"
        action={
          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[13px] font-medium text-brand transition-colors hover:bg-brand-soft"
          >
            View all <ArrowRight size={14} />
          </button>
        }
      />
      {recent.length === 0 ? (
        <EmptyState icon={Receipt} title="No transactions yet" />
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {recent.map((t) => (
            <li key={t.id} className="flex items-center gap-3 px-5 py-2.5">
              <CategoryIcon category={t.category} size={16} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-content">{t.note}</p>
                <p className="text-[12px] text-subtle">
                  {t.category} · {formatDateShort(t.date)}
                </p>
              </div>
              <span
                className={`text-sm font-semibold tnum ${
                  t.amount >= 0 ? 'text-positive' : 'text-content'
                }`}
              >
                {formatSigned(t.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
