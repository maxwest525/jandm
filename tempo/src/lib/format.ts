export function parseISODate(iso: string): Date {
  // `iso` may be a full timestamp or a YYYY-MM-DD date.
  const datePart = iso.slice(0, 10)
  const [y, m, d] = datePart.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export interface DueInfo {
  label: string
  tone: 'overdue' | 'today' | 'soon' | 'normal'
}

export function formatDue(iso: string | null): DueInfo | null {
  if (!iso) return null
  const due = startOfDay(parseISODate(iso))
  const today = startOfDay(new Date())
  const diff = Math.round((due.getTime() - today.getTime()) / 86_400_000)

  if (diff < 0) return { label: diff === -1 ? 'Yesterday' : `${Math.abs(diff)}d overdue`, tone: 'overdue' }
  if (diff === 0) return { label: 'Today', tone: 'today' }
  if (diff === 1) return { label: 'Tomorrow', tone: 'soon' }
  if (diff <= 6) return { label: `${diff}d`, tone: 'soon' }
  return {
    label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    tone: 'normal',
  }
}

export function formatDateInput(iso: string | null): string {
  return iso ? iso.slice(0, 10) : ''
}

export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const diff = Date.now() - then
  const mins = Math.round(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
