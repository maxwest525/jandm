import type { Budget, Category, Transaction } from '../types'
import { lastNMonths, monthKey, monthKeyOf } from './date'

export interface Kpis {
  balance: number
  income: number
  expenses: number
  savingsRate: number
  /** Percent change vs the previous month (null when there's no baseline). */
  incomeTrend: number | null
  expenseTrend: number | null
  savingsTrend: number | null
}

const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0)

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / Math.abs(previous)) * 100
}

function incomeFor(txns: Transaction[], key: string): number {
  return sum(txns.filter((t) => monthKey(t.date) === key && t.amount > 0).map((t) => t.amount))
}

function expenseFor(txns: Transaction[], key: string): number {
  return sum(
    txns.filter((t) => monthKey(t.date) === key && t.amount < 0).map((t) => Math.abs(t.amount)),
  )
}

export function computeKpis(txns: Transaction[], ref: Date = new Date()): Kpis {
  const thisKey = monthKeyOf(ref)
  const prev = new Date(ref.getFullYear(), ref.getMonth() - 1, 1)
  const prevKey = monthKeyOf(prev)

  const income = incomeFor(txns, thisKey)
  const expenses = expenseFor(txns, thisKey)
  const prevIncome = incomeFor(txns, prevKey)
  const prevExpenses = expenseFor(txns, prevKey)

  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0
  const prevSavingsRate = prevIncome > 0 ? ((prevIncome - prevExpenses) / prevIncome) * 100 : 0

  return {
    balance: sum(txns.map((t) => t.amount)),
    income,
    expenses,
    savingsRate,
    incomeTrend: pctChange(income, prevIncome),
    expenseTrend: pctChange(expenses, prevExpenses),
    savingsTrend:
      prevSavingsRate === 0 ? null : Number((savingsRate - prevSavingsRate).toFixed(1)),
  }
}

export interface CategorySlice {
  category: Category
  value: number
}

/** Expense totals by category for a given month (defaults to current month). */
export function spendingByCategory(txns: Transaction[], ref: Date = new Date()): CategorySlice[] {
  const key = monthKeyOf(ref)
  const totals = new Map<Category, number>()
  for (const t of txns) {
    if (t.amount >= 0 || monthKey(t.date) !== key) continue
    totals.set(t.category, (totals.get(t.category) ?? 0) + Math.abs(t.amount))
  }
  return [...totals.entries()]
    .map(([category, value]) => ({ category, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value)
}

export interface CashFlowPoint {
  key: string
  label: string
  income: number
  expenses: number
  net: number
}

export function cashFlowSeries(
  txns: Transaction[],
  months = 6,
  ref: Date = new Date(),
): CashFlowPoint[] {
  return lastNMonths(months, ref).map(({ key, label }) => {
    const income = incomeFor(txns, key)
    const expenses = expenseFor(txns, key)
    return { key, label, income: round(income), expenses: round(expenses), net: round(income - expenses) }
  })
}

export interface BudgetProgress {
  category: Category
  limit: number
  spent: number
  ratio: number
  remaining: number
}

export function budgetProgress(
  txns: Transaction[],
  budgets: Budget[],
  ref: Date = new Date(),
): BudgetProgress[] {
  const key = monthKeyOf(ref)
  const spentByCat = new Map<Category, number>()
  for (const t of txns) {
    if (t.amount >= 0 || monthKey(t.date) !== key) continue
    spentByCat.set(t.category, (spentByCat.get(t.category) ?? 0) + Math.abs(t.amount))
  }
  return budgets
    .map((b) => {
      const spent = round(spentByCat.get(b.category) ?? 0)
      return {
        category: b.category,
        limit: b.limit,
        spent,
        ratio: b.limit > 0 ? spent / b.limit : 0,
        remaining: round(b.limit - spent),
      }
    })
    .sort((a, b) => b.ratio - a.ratio)
}

const round = (n: number) => Math.round(n * 100) / 100
