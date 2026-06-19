import { parseISO } from './date'

const usd = (cents: boolean) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  })

export function formatCurrency(value: number, opts?: { cents?: boolean }): string {
  return usd(opts?.cents ?? true).format(value)
}

/** Always shows an explicit + / − sign. Uses the magnitude for the number. */
export function formatSigned(value: number, opts?: { cents?: boolean }): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  return `${sign}${usd(opts?.cents ?? true).format(Math.abs(value))}`
}

/** Compact form for axis labels, e.g. $1.2k. */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`
}

export function formatDateShort(iso: string): string {
  return parseISO(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatDateLong(iso: string): string {
  return parseISO(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
