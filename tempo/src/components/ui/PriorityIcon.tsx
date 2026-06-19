import type { Priority } from '../../types'
import { PRIORITY_META } from '../../lib/constants'

export function PriorityIcon({ priority, size = 15 }: { priority: Priority; size?: number }) {
  const meta = PRIORITY_META[priority]
  const Icon = meta.icon
  return (
    <span title={meta.label} aria-label={`Priority: ${meta.label}`} style={{ color: meta.color, display: 'inline-flex' }}>
      <Icon size={size} strokeWidth={2.4} />
    </span>
  )
}
