import { useRef, useState, type ReactNode } from 'react'
import { ChevronDown, type LucideIcon } from 'lucide-react'
import { useOutsideClick } from '../../hooks/useOutsideClick'
import { cx } from '../../lib/format'

/** Small accessible popover menu used for filters and pickers. */
export function Dropdown({
  label,
  icon: Icon,
  badge,
  align = 'left',
  width = 220,
  children,
}: {
  label: ReactNode
  icon?: LucideIcon
  badge?: number
  align?: 'left' | 'right'
  width?: number
  children: (close: () => void) => ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOutsideClick(ref, () => setOpen(false), open)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cx(
          'flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[13px] font-medium transition-colors',
          badge
            ? 'border-accent/40 bg-accent-soft text-accent'
            : 'border-border bg-surface text-muted hover:border-border-2 hover:text-content',
        )}
      >
        {Icon && <Icon size={14} />}
        {label}
        {badge ? (
          <span className="rounded bg-accent px-1 text-2xs font-semibold text-accent-contrast">{badge}</span>
        ) : (
          <ChevronDown size={13} className="opacity-60" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={cx(
            'absolute z-30 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-pop animate-pop-in',
            align === 'right' ? 'right-0' : 'left-0',
          )}
          style={{ width }}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}

export function DropdownItem({
  active,
  onClick,
  children,
}: {
  active?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      role="menuitemcheckbox"
      aria-checked={active}
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] text-content transition-colors hover:bg-surface-2"
    >
      <span
        className={cx(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
          active ? 'border-accent bg-accent text-accent-contrast' : 'border-border-2',
        )}
      >
        {active && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {children}
    </button>
  )
}
