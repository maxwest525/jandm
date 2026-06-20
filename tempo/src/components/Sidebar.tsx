import { NavLink } from 'react-router-dom'
import { Inbox, LogOut, Moon, Search, Sun, X } from 'lucide-react'
import { useApp } from '../store/AppData'
import { useTheme } from '../store/Theme'
import { useCommandBar } from '../store/CommandBar'
import { useLogout } from '../api/auth'
import { Avatar } from './ui/Avatar'
import { cx } from '../lib/format'

const ROLE_LABEL: Record<string, string> = { owner: 'Owner', member: 'Member', viewer: 'Viewer' }

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const { projects, currentUser } = useApp()
  const { theme, toggle } = useTheme()
  const { setOpen } = useCommandBar()
  const logout = useLogout()

  const navItem = (active: boolean) =>
    cx(
      'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors',
      active ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-surface-2 hover:text-content',
    )

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden />
      )}

      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-200 lg:static lg:z-0 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand */}
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-contrast">
              <svg viewBox="0 0 32 32" width="16" height="16" aria-hidden>
                <rect x="7" y="8" width="7" height="16" rx="2" fill="currentColor" />
                <rect x="18" y="8" width="7" height="10" rx="2" fill="currentColor" opacity="0.6" />
              </svg>
            </div>
            <span className="text-[15px] font-semibold tracking-tight">Tempo</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggle}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-content"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={onClose} aria-label="Close menu" className="rounded-lg p-1.5 text-muted hover:bg-surface-2 lg:hidden">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Search / command bar trigger */}
        <div className="px-3 pb-2">
          <button
            onClick={() => setOpen(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface-2/60 px-2.5 py-1.5 text-[13px] text-subtle transition-colors hover:border-border-2 hover:text-muted"
          >
            <Search size={14} />
            <span>Search…</span>
            <kbd className="ml-auto rounded border border-border-2 bg-surface px-1.5 py-0.5 font-mono text-2xs text-subtle">
              ⌘K
            </kbd>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="Primary">
          <NavLink to="/my-work" className={({ isActive }) => navItem(isActive)} onClick={onClose}>
            <Inbox size={16} />
            My Work
          </NavLink>

          <p className="px-2.5 pb-1.5 pt-5 text-2xs font-semibold uppercase tracking-wider text-subtle">
            Projects
          </p>
          <div className="space-y-0.5">
            {projects.map((p) => (
              <NavLink
                key={p.id}
                to={`/projects/${p.id}`}
                className={({ isActive }) => navItem(isActive)}
                onClick={onClose}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-[4px]" style={{ background: p.color }} />
                <span className="truncate">{p.name}</span>
                <span className="ml-auto font-mono text-2xs text-subtle">{p.key}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Current user */}
        <div className="flex items-center gap-2.5 border-t border-border px-4 py-3">
          <Avatar user={currentUser} size={28} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[13px] font-medium text-content">{currentUser.name}</p>
              <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-muted">
                {ROLE_LABEL[currentUser.role] ?? currentUser.role}
              </span>
            </div>
            <p className="truncate text-2xs text-subtle">{currentUser.email}</p>
          </div>
          <button
            onClick={() => logout.mutate()}
            aria-label="Sign out"
            title="Sign out"
            className="rounded-lg p-1.5 text-subtle transition-colors hover:bg-surface-2 hover:text-content"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>
    </>
  )
}
