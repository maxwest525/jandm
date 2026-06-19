import type { Budget, Transaction } from '../types'

const KEYS = {
  transactions: 'flowbudget.transactions.v1',
  budgets: 'flowbudget.budgets.v1',
  theme: 'flowbudget.theme',
} as const

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage may be full or disabled (private mode); fail silently — the app
    // still works for the current session.
  }
}

export const storage = {
  loadTransactions: () => read<Transaction[]>(KEYS.transactions),
  saveTransactions: (t: Transaction[]) => write(KEYS.transactions, t),
  loadBudgets: () => read<Budget[]>(KEYS.budgets),
  saveBudgets: (b: Budget[]) => write(KEYS.budgets, b),
  loadTheme: () => read<'light' | 'dark'>(KEYS.theme) ?? readRawTheme(),
  saveTheme: (t: 'light' | 'dark') => {
    try {
      localStorage.setItem(KEYS.theme, t)
    } catch {
      /* ignore */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(KEYS.transactions)
      localStorage.removeItem(KEYS.budgets)
    } catch {
      /* ignore */
    }
  },
}

// The pre-paint script in index.html writes the theme as a bare string, not
// JSON — support both shapes.
function readRawTheme(): 'light' | 'dark' | null {
  try {
    const raw = localStorage.getItem(KEYS.theme)
    return raw === 'dark' || raw === 'light' ? raw : null
  } catch {
    return null
  }
}
