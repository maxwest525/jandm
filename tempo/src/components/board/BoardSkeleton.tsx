import { STATUS_META, STATUS_ORDER } from '../../lib/constants'

export function BoardSkeleton() {
  return (
    <div className="flex h-full gap-4 overflow-hidden px-4 pb-4 sm:px-6">
      {STATUS_ORDER.map((status, col) => {
        const meta = STATUS_META[status]
        const Icon = meta.icon
        return (
          <div key={status} className="flex h-full w-[300px] shrink-0 flex-col">
            <div className="mb-2 flex items-center gap-2 px-1">
              <Icon size={15} style={{ color: meta.color }} />
              <span className="text-[13px] font-semibold text-content">{meta.label}</span>
            </div>
            <div className="space-y-2 p-1">
              {Array.from({ length: 3 - (col % 2) }).map((_, i) => (
                <div key={i} className="shimmer rounded-xl border border-border p-3" style={{ height: 88 }} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
