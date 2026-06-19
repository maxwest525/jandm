import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  SearchX,
  Trash2,
} from 'lucide-react'
import type { Category, Transaction } from '../../types'
import { ALL_CATEGORIES } from '../../lib/categories'
import { formatDateLong, formatDateShort, formatSigned } from '../../lib/format'
import { useData } from '../../context/DataContext'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { CategoryBadge, CategoryIcon } from '../ui/CategoryBadge'

type SortKey = 'date' | 'amount'
type SortDir = 'asc' | 'desc'
const PAGE_SIZE = 10

export function TransactionsView({ onAdd }: { onAdd: () => void }) {
  const { transactions, deleteTransaction } = useData()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'All'>('All')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const rows = transactions.filter((t) => {
      if (category !== 'All' && t.category !== category) return false
      if (q && !t.note.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q))
        return false
      return true
    })
    rows.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'amount') return (a.amount - b.amount) * dir
      return (a.date < b.date ? -1 : a.date > b.date ? 1 : 0) * dir
    })
    return rows
  }, [transactions, query, category, sortKey, sortDir])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  // Keep the page in range when filters shrink the result set.
  useEffect(() => {
    setPage(1)
  }, [query, category, sortKey, sortDir])
  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir(key === 'date' ? 'desc' : 'desc')
    }
  }

  return (
    <Card className="overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search description or category…"
            aria-label="Search transactions"
            className="h-10 w-full rounded-lg border border-border-strong bg-surface pl-9 pr-3 text-sm text-content placeholder:text-subtle outline-none transition-colors focus:border-brand"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category | 'All')}
          aria-label="Filter by category"
          className="h-10 rounded-lg border border-border-strong bg-surface px-3 text-sm text-content outline-none transition-colors focus:border-brand"
        >
          <option value="All">All categories</option>
          {ALL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matching transactions"
          description={
            transactions.length === 0
              ? 'Add your first transaction to get started.'
              : 'Try a different search or clear the category filter.'
          }
          action={
            transactions.length === 0 ? (
              <Button onClick={onAdd}>
                <Plus size={16} /> Add transaction
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setQuery('')
                  setCategory('All')
                }}
              >
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[12px] uppercase tracking-wide text-subtle">
                  <th className="px-5 py-3 font-medium">
                    <SortButton
                      label="Date"
                      active={sortKey === 'date'}
                      dir={sortDir}
                      onClick={() => toggleSort('date')}
                    />
                  </th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 text-right font-medium">
                    <SortButton
                      label="Amount"
                      active={sortKey === 'amount'}
                      dir={sortDir}
                      onClick={() => toggleSort('amount')}
                      alignRight
                    />
                  </th>
                  <th className="w-12 px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {pageRows.map((t) => (
                  <TableRow key={t.id} t={t} onDelete={() => deleteTransaction(t.id)} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="divide-y divide-border md:hidden">
            {pageRows.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-3">
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

          {/* Pagination */}
          <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-3">
            <p className="text-[13px] text-muted tnum">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of{' '}
              {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-strong text-muted transition-colors hover:text-content disabled:opacity-40 disabled:hover:text-muted"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 text-[13px] font-medium text-content tnum">
                {page} / {pageCount}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={page === pageCount}
                aria-label="Next page"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-strong text-muted transition-colors hover:text-content disabled:opacity-40 disabled:hover:text-muted"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}

function TableRow({ t, onDelete }: { t: Transaction; onDelete: () => void }) {
  return (
    <tr className="group border-b border-border last:border-0 transition-colors hover:bg-surface-2/60">
      <td className="whitespace-nowrap px-5 py-3 text-muted tnum">{formatDateLong(t.date)}</td>
      <td className="px-5 py-3 font-medium text-content">{t.note}</td>
      <td className="px-5 py-3">
        <CategoryBadge category={t.category} />
      </td>
      <td
        className={`whitespace-nowrap px-5 py-3 text-right font-semibold tnum ${
          t.amount >= 0 ? 'text-positive' : 'text-content'
        }`}
      >
        {formatSigned(t.amount)}
      </td>
      <td className="px-5 py-3 text-right">
        <button
          onClick={onDelete}
          aria-label={`Delete ${t.note}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-subtle opacity-0 transition-all hover:bg-negative/10 hover:text-negative focus-visible:opacity-100 group-hover:opacity-100"
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  )
}

function SortButton({
  label,
  active,
  dir,
  onClick,
  alignRight,
}: {
  label: string
  active: boolean
  dir: SortDir
  onClick: () => void
  alignRight?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-content ${
        active ? 'text-content' : ''
      } ${alignRight ? 'flex-row-reverse' : ''}`}
    >
      {label}
      <span className={active ? 'opacity-100' : 'opacity-0'}>
        {dir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
      </span>
    </button>
  )
}
