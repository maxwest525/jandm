import type { Budget, Category, Transaction } from '../types'
import { toISO } from './date'

/** Deterministic PRNG so the seeded dataset looks identical on first load. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const GROCERS = ['Whole Foods', 'Trader Joe’s', 'Safeway', 'Costco', 'Local Market']
const DINING = [
  'Blue Bottle Coffee',
  'Sweetgreen',
  'Tacos El Primo',
  'Ramen House',
  'Pizzeria Uno',
  'Thai Basil',
  'Corner Bistro',
  'Shake Shack',
]
const TRANSPORT = ['Shell Gas', 'Uber', 'Metro Card', 'Chevron', 'Lyft', 'Parking']
const SHOPPING = ['Amazon', 'Uniqlo', 'IKEA', 'Best Buy', 'Target', 'Nike']
const ENTERTAINMENT = ['Cinema City', 'Steam', 'Concert — The Fillmore', 'Museum of Art']
const OTHER = ['ATM Withdrawal', 'Gift', 'Postage', 'Charity — Red Cross', 'Misc']
const FREELANCE = ['Northwind Co.', 'Pixel Studio', 'Greenfield LLC']

/**
 * Build ~6 months of realistic transactions up to today, including recurring
 * income, rent, subscriptions, and variable day-to-day spending.
 */
export function generateSeed(ref: Date = new Date()): Transaction[] {
  const rng = mulberry32(0x10ad17)
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]
  const between = (lo: number, hi: number) => lo + rng() * (hi - lo)
  const money = (n: number) => Math.round(n * 100) / 100

  const txns: Transaction[] = []
  let seq = 0
  const push = (date: Date, amount: number, category: Category, note: string) =>
    txns.push({ id: `seed_${seq++}`, date: toISO(date), amount: money(amount), category, note })

  const start = new Date(ref.getFullYear(), ref.getMonth() - 5, 1)

  for (let m = 0; m < 6; m++) {
    const year = start.getFullYear()
    const month = start.getMonth() + m
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const isCurrent = year === ref.getFullYear() && month === ref.getMonth()
    const maxDay = isCurrent ? ref.getDate() : daysInMonth

    const on = (day: number, amount: number, category: Category, note: string) => {
      if (day < 1 || day > maxDay) return
      push(new Date(year, month, Math.min(day, daysInMonth)), amount, category, note)
    }
    const rand = (lo: number, hi: number) => Math.floor(between(lo, hi + 1))

    // --- Recurring income ---
    on(1, between(3160, 3260), 'Income', 'Paycheck — Acme Corp')
    on(15, between(3160, 3260), 'Income', 'Paycheck — Acme Corp')
    if (rng() > 0.55) on(rand(8, 24), between(220, 720), 'Income', `Freelance — ${pick(FREELANCE)}`)

    // --- Recurring expenses ---
    on(1, -1850, 'Housing', 'Rent')
    on(4, -between(96, 168), 'Utilities', 'Electric & gas')
    on(7, -59.99, 'Utilities', 'Internet — Fiberlink')
    on(9, -between(38, 72), 'Utilities', 'Water & trash')
    on(3, -15.99, 'Entertainment', 'Netflix')
    on(11, -10.99, 'Entertainment', 'Spotify')
    on(2, -38.99, 'Health', 'Gym — PulseFit')
    on(16, -500, 'Savings', 'Transfer to savings')

    // --- Groceries: roughly weekly ---
    for (let w = 0; w < 5; w++) on(3 + w * 7 + rand(0, 2), -between(46, 138), 'Groceries', pick(GROCERS))

    // --- Variable everyday spend ---
    for (let i = 0, n = rand(8, 12); i < n; i++)
      on(rand(1, daysInMonth), -between(8, 56), 'Dining', pick(DINING))
    for (let i = 0, n = rand(4, 8); i < n; i++)
      on(rand(1, daysInMonth), -between(12, 74), 'Transport', pick(TRANSPORT))
    for (let i = 0, n = rand(2, 5); i < n; i++)
      on(rand(1, daysInMonth), -between(18, 215), 'Shopping', pick(SHOPPING))
    for (let i = 0, n = rand(1, 3); i < n; i++)
      on(rand(1, daysInMonth), -between(14, 78), 'Entertainment', pick(ENTERTAINMENT))
    if (rng() > 0.5) on(rand(1, daysInMonth), -between(9, 64), 'Health', 'Pharmacy')
    if (rng() > 0.45) on(rand(1, daysInMonth), -between(10, 95), 'Other', pick(OTHER))
  }

  // Newest first.
  return txns.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

export const DEFAULT_BUDGETS: Budget[] = [
  { category: 'Housing', limit: 1900 },
  { category: 'Groceries', limit: 600 },
  { category: 'Dining', limit: 360 },
  { category: 'Transport', limit: 300 },
  { category: 'Utilities', limit: 280 },
  { category: 'Entertainment', limit: 160 },
  { category: 'Shopping', limit: 420 },
  { category: 'Health', limit: 130 },
  { category: 'Savings', limit: 600 },
  { category: 'Other', limit: 150 },
]
