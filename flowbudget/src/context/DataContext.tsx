import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Budget, Category, Transaction } from '../types'
import { storage } from '../lib/storage'
import { DEFAULT_BUDGETS, generateSeed } from '../lib/seed'

type Status = 'loading' | 'ready' | 'error'

export interface NewTransaction {
  date: string
  amount: number
  category: Category
  note: string
}

interface DataState {
  status: Status
  transactions: Transaction[]
  budgets: Budget[]
  addTransaction: (t: NewTransaction) => void
  deleteTransaction: (id: string) => void
  updateBudget: (category: Category, limit: number) => void
  resetData: () => void
}

const DataContext = createContext<DataState | null>(null)

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

export function DataProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const hydrated = useRef(false)

  // Initial load — hydrate from localStorage or seed. A small delay lets the
  // skeleton loading states render genuinely on first paint.
  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      try {
        const storedTx = storage.loadTransactions()
        const storedBudgets = storage.loadBudgets()
        const tx = storedTx ?? generateSeed()
        const bg = storedBudgets ?? DEFAULT_BUDGETS
        if (cancelled) return
        setTransactions(tx)
        setBudgets(bg)
        if (!storedTx) storage.saveTransactions(tx)
        if (!storedBudgets) storage.saveBudgets(bg)
        hydrated.current = true
        setStatus('ready')
      } catch {
        if (!cancelled) setStatus('error')
      }
    }, 600)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])

  // Persist after hydration whenever data changes.
  useEffect(() => {
    if (hydrated.current && status === 'ready') storage.saveTransactions(transactions)
  }, [transactions, status])

  useEffect(() => {
    if (hydrated.current && status === 'ready') storage.saveBudgets(budgets)
  }, [budgets, status])

  const addTransaction = useCallback((t: NewTransaction) => {
    const entry: Transaction = { id: uid(), ...t }
    setTransactions((prev) =>
      [entry, ...prev].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    )
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const updateBudget = useCallback((category: Category, limit: number) => {
    setBudgets((prev) => {
      const exists = prev.some((b) => b.category === category)
      const next = exists
        ? prev.map((b) => (b.category === category ? { ...b, limit } : b))
        : [...prev, { category, limit }]
      return next
    })
  }, [])

  const resetData = useCallback(() => {
    storage.clear()
    const tx = generateSeed()
    setTransactions(tx)
    setBudgets(DEFAULT_BUDGETS)
    storage.saveTransactions(tx)
    storage.saveBudgets(DEFAULT_BUDGETS)
  }, [])

  const value = useMemo<DataState>(
    () => ({
      status,
      transactions,
      budgets,
      addTransaction,
      deleteTransaction,
      updateBudget,
      resetData,
    }),
    [status, transactions, budgets, addTransaction, deleteTransaction, updateBudget, resetData],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
