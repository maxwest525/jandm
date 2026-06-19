import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Inbox, Plus, SquareKanban, CornerDownLeft } from 'lucide-react'
import type { Task } from '../../types'
import { useApp } from '../../store/AppData'
import { useCommandBar } from '../../store/CommandBar'
import { useTaskPanel } from '../../hooks/useTaskPanel'
import { PriorityIcon } from '../ui/PriorityIcon'
import { CreateTaskModal } from '../task/CreateTaskModal'

export function CommandBar() {
  const { open, setOpen } = useCommandBar()
  const { projects, projectById } = useApp()
  const navigate = useNavigate()
  const { openTask } = useTaskPanel()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [createProjectId, setCreateProjectId] = useState<string | null>(null)

  // Search across every task currently in the cache (boards + My Work).
  const cachedTasks = useMemo(() => {
    if (!open) return []
    const lists = [
      ...qc.getQueriesData<Task[]>({ queryKey: ['project'] }),
      ...qc.getQueriesData<Task[]>({ queryKey: ['myTasks'] }),
    ]
    const map = new Map<string, Task>()
    for (const [, arr] of lists) (arr ?? []).forEach((t) => map.set(t.id, t))
    return [...map.values()]
  }, [open, qc])

  const run = (fn: () => void) => {
    fn()
    setOpen(false)
    setSearch('')
  }

  const createProject = createProjectId ? projectById(createProjectId) : undefined

  return (
    <>
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[14vh]"
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0 animate-fade-in bg-black/55 backdrop-blur-sm" aria-hidden />
            <Command
              label="Command menu"
              shouldFilter
              className="relative w-full max-w-xl animate-scale-in overflow-hidden rounded-2xl border border-border bg-surface shadow-pop"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false)
              }}
            >
              <Command.Input
                value={search}
                onValueChange={setSearch}
                autoFocus
                placeholder="Search tasks, jump to a project, or create…"
                className="w-full border-b border-border bg-transparent px-4 py-3.5 text-[15px] text-content outline-none placeholder:text-subtle"
              />
              <Command.List className="max-h-[min(420px,60vh)] overflow-y-auto p-2">
                <Command.Empty className="px-3 py-8 text-center text-[13px] text-subtle">
                  No results for “{search}”.
                </Command.Empty>

                <Command.Group heading="Create" className="cmd-group">
                  {projects.map((p) => (
                    <Command.Item
                      key={`create-${p.id}`}
                      value={`new task create ${p.name} ${p.key}`}
                      onSelect={() => run(() => setCreateProjectId(p.id))}
                      className="cmd-item"
                    >
                      <Plus size={16} className="text-accent" />
                      <span>
                        New task in <span className="font-medium text-content">{p.name}</span>
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group heading="Navigation" className="cmd-group">
                  <Command.Item value="my work assigned" onSelect={() => run(() => navigate('/my-work'))} className="cmd-item">
                    <Inbox size={16} className="text-muted" />
                    My Work
                  </Command.Item>
                  {projects.map((p) => (
                    <Command.Item
                      key={`nav-${p.id}`}
                      value={`project ${p.name} ${p.key} board`}
                      onSelect={() => run(() => navigate(`/projects/${p.id}`))}
                      className="cmd-item"
                    >
                      <span className="flex h-4 w-4 items-center justify-center">
                        <SquareKanban size={15} style={{ color: p.color }} />
                      </span>
                      {p.name}
                      <span className="ml-auto font-mono text-2xs text-subtle">{p.key}</span>
                    </Command.Item>
                  ))}
                </Command.Group>

                {search.trim() && (
                  <Command.Group heading="Tasks" className="cmd-group">
                    {cachedTasks.slice(0, 50).map((t) => (
                      <Command.Item
                        key={t.id}
                        value={`${t.key} ${t.title}`}
                        onSelect={() => run(() => openTask(t.id))}
                        className="cmd-item"
                      >
                        <PriorityIcon priority={t.priority} />
                        <span className="font-mono text-2xs text-subtle">{t.key}</span>
                        <span className="truncate">{t.title}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </Command.List>

              <div className="flex items-center justify-end gap-3 border-t border-border px-3 py-2 text-2xs text-subtle">
                <span className="flex items-center gap-1">
                  <CornerDownLeft size={11} /> to select
                </span>
                <span>esc to close</span>
              </div>
            </Command>
          </div>,
          document.body,
        )}

      {createProject && (
        <CreateTaskModal
          open={!!createProject}
          onClose={() => setCreateProjectId(null)}
          projectId={createProject.id}
          projectKey={createProject.key}
        />
      )}
    </>
  )
}
