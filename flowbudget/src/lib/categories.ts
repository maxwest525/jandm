import {
  Briefcase,
  Home,
  ShoppingCart,
  UtensilsCrossed,
  Car,
  Zap,
  Clapperboard,
  ShoppingBag,
  HeartPulse,
  PiggyBank,
  Shapes,
  type LucideIcon,
} from 'lucide-react'
import type { Category } from '../types'

interface CategoryMeta {
  color: string
  icon: LucideIcon
}

/** Fixed, curated palette — readable on both light and dark surfaces. */
export const CATEGORY_META: Record<Category, CategoryMeta> = {
  Income: { color: '#22c55e', icon: Briefcase },
  Housing: { color: '#6366f1', icon: Home },
  Groceries: { color: '#10b981', icon: ShoppingCart },
  Dining: { color: '#f59e0b', icon: UtensilsCrossed },
  Transport: { color: '#06b6d4', icon: Car },
  Utilities: { color: '#8b5cf6', icon: Zap },
  Entertainment: { color: '#ec4899', icon: Clapperboard },
  Shopping: { color: '#f43f5e', icon: ShoppingBag },
  Health: { color: '#14b8a6', icon: HeartPulse },
  Savings: { color: '#3b82f6', icon: PiggyBank },
  Other: { color: '#94a3b8', icon: Shapes },
}

export const ALL_CATEGORIES = Object.keys(CATEGORY_META) as Category[]

/** Categories that represent money leaving the account. */
export const EXPENSE_CATEGORIES = ALL_CATEGORIES.filter((c) => c !== 'Income')
