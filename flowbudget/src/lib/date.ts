// Timezone-safe date helpers. We always store dates as `YYYY-MM-DD` and parse
// them as *local* dates so a calendar day never shifts across timezones.

const pad = (n: number) => String(n).padStart(2, '0')

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function toISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function todayISO(): string {
  return toISO(new Date())
}

/** `YYYY-MM` key for grouping by month. */
export function monthKey(iso: string): string {
  return iso.slice(0, 7)
}

export function monthKeyOf(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

/** The last `n` months ending at `ref`, oldest first. */
export function lastNMonths(n: number, ref: Date = new Date()) {
  const out: { key: string; label: string; full: string }[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1)
    out.push({
      key: monthKeyOf(d),
      label: d.toLocaleString('en-US', { month: 'short' }),
      full: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    })
  }
  return out
}
