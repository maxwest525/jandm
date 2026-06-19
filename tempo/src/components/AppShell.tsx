import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, Search } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { CommandBar } from './command/CommandBar'
import { TaskPanel } from './task/TaskPanel'
import { useTaskPanel } from '../hooks/useTaskPanel'
import { useCommandBar } from '../store/CommandBar'

export function AppShell() {
  const [mobileNav, setMobileNav] = useState(false)
  const { taskId, closeTask } = useTaskPanel()
  const { setOpen } = useCommandBar()

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-content">
      <Sidebar mobileOpen={mobileNav} onClose={() => setMobileNav(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-3 lg:hidden">
          <button
            onClick={() => setMobileNav(true)}
            aria-label="Open menu"
            className="rounded-lg p-2 text-muted hover:bg-surface-2"
          >
            <Menu size={18} />
          </button>
          <span className="text-sm font-semibold">Tempo</span>
          <button
            onClick={() => setOpen(true)}
            aria-label="Search"
            className="rounded-lg p-2 text-muted hover:bg-surface-2"
          >
            <Search size={18} />
          </button>
        </div>

        <main className="min-h-0 flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>

      <CommandBar />
      {taskId && <TaskPanel taskId={taskId} onClose={closeTask} />}
    </div>
  )
}
