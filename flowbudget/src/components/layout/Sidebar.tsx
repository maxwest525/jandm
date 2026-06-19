import { RotateCcw } from 'lucide-react'
import type { ViewKey } from '../../types'
import { NAV_ITEMS } from './nav'
import { Logo } from './Logo'
import { useData } from '../../context/DataContext'

export function Sidebar({
  view,
  onChange,
}: {
  view: ViewKey
  onChange: (v: ViewKey) => void
}) {
  const { resetData } = useData()

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[248px] flex-col border-r border-border bg-surface lg:flex">
      <div className="flex h-16 items-center px-6">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Primary">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const active = view === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              aria-current={active ? 'page' : undefined}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand-soft text-brand'
                  : 'text-muted hover:bg-surface-2 hover:text-content'
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.4 : 2} />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={() => {
            if (window.confirm('Reset all data back to the seeded sample? This clears your saved changes.'))
              resetData()
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-content"
        >
          <RotateCcw size={17} />
          Reset sample data
        </button>
        <p className="px-3 pb-1 pt-3 text-[11px] leading-relaxed text-subtle">
          Demo app · data is mock and stored locally in your browser.
        </p>
      </div>
    </aside>
  )
}
