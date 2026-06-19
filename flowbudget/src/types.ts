// Core domain model for FlowBudget.

export type Category =
  | 'Income'
  | 'Housing'
  | 'Groceries'
  | 'Dining'
  | 'Transport'
  | 'Utilities'
  | 'Entertainment'
  | 'Shopping'
  | 'Health'
  | 'Savings'
  | 'Other'

export interface Transaction {
  id: string
  /** ISO date, `YYYY-MM-DD`. */
  date: string
  /** Positive = money in (income), negative = money out (expense). */
  amount: number
  category: Category
  note: string
}

export interface Budget {
  category: Category
  /** Monthly spending limit in dollars. */
  limit: number
}

export type ViewKey = 'overview' | 'transactions' | 'budgets'
