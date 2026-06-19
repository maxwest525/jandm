import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-subtle">
        <Icon size={22} strokeWidth={1.8} />
      </div>
      <p className="text-sm font-semibold text-content">{title}</p>
      {description && <p className="mt-1 max-w-xs text-[13px] text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
