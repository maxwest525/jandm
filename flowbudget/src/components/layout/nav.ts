import { LayoutDashboard, ReceiptText, Target, type LucideIcon } from 'lucide-react'
import type { ViewKey } from '../../types'

export const NAV_ITEMS: { key: ViewKey; label: string; icon: LucideIcon }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'transactions', label: 'Transactions', icon: ReceiptText },
  { key: 'budgets', label: 'Budgets', icon: Target },
]
