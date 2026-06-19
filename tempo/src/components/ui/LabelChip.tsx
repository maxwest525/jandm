import type { Label } from '../../types'

export function LabelChip({ label, onRemove }: { label: Label; onRemove?: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-2xs font-medium"
      style={{ color: label.color, borderColor: `${label.color}55`, background: `${label.color}14` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: label.color }} />
      {label.name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="-mr-0.5 ml-0.5 rounded-full opacity-60 hover:opacity-100"
          aria-label={`Remove ${label.name} label`}
        >
          ×
        </button>
      )}
    </span>
  )
}
