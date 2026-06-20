import { useState } from 'react'
import { Plus, MoveRight } from 'lucide-react'
import type { Status, Task } from '../../types'
import { STATUS_META, STATUS_ORDER } from '../../lib/constants'
import { useUpdateTask } from '../../api/queries'
import { TaskCard } from '../task/TaskCard'
import { Dropdown, DropdownItem } from '../ui/Dropdown'
import { cx } from '../../lib/format'

function group(tasks: Task[]): Record<Status, Task[]> {
  const cols: Record<Status, Task[]> = { backlog: [], in_progress: [], in_review: [], done: [] }
  for (const t of tasks) cols[t.status].push(t)
  return cols
}

export function MobileBoard({
  tasks,
  onOpenTask,
  onAddTask,
  canEdit,
}: {
  tasks: Task[]
  onOpenTask: (id: string) => void
  onAddTask: (status: Status) => void
  canEdit: boolean
}) {
  const update = useUpdateTask()
  const [active, setActive] = useState<Status>('backlog')
  const cols = group(tasks)

  const move = (task: Task, to: Status) => {
    const bottom = cols[to].reduce((m, t) => Math.max(m, t.position), 0) + 1024
    update.mutate({ id: task.id, patch: { status: to, position: bottom } })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Status tabs */}
      <div className="flex gap-1.5 overflow-x-auto border-b border-border px-3 pb-2" role="tablist" aria-label="Board columns">
        {STATUS_ORDER.map((status) => {
          const meta = STATUS_META[status]
          const Icon = meta.icon
          const selected = active === status
          return (
            <button
              key={status}
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(status)}
              className={cx(
                'flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[13px] font-medium transition-colors',
                selected ? 'border-accent/40 bg-accent-soft text-accent' : 'border-border text-muted',
              )}
            >
              <Icon size={14} style={{ color: selected ? undefined : meta.color }} />
              {meta.label}
              <span className="rounded-full bg-surface-2 px-1.5 text-2xs text-subtle tnum">{cols[status].length}</span>
            </button>
          )
        })}
      </div>

      {/* Active column */}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {cols[active].length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center text-[13px] text-subtle">
            Nothing in {STATUS_META[active].label}.
            {canEdit && (
              <button onClick={() => onAddTask(active)} className="mt-2 block w-full text-accent">
                + Add a task
              </button>
            )}
          </div>
        ) : (
          cols[active].map((task) => (
            <div key={task.id}>
              <TaskCard task={task} onOpen={() => onOpenTask(task.id)} />
              {canEdit && (
                <div className="mt-1 flex justify-end">
                  <Dropdown label={<span className="flex items-center gap-1"><MoveRight size={13} /> Move</span>} align="right" width={190}>
                    {(close) => (
                      <>
                        {STATUS_ORDER.filter((s) => s !== task.status).map((s) => {
                          const m = STATUS_META[s]
                          const Icon = m.icon
                          return (
                            <DropdownItem key={s} onClick={() => { move(task, s); close() }}>
                              <Icon size={14} style={{ color: m.color }} /> {m.label}
                            </DropdownItem>
                          )
                        })}
                      </>
                    )}
                  </Dropdown>
                </div>
              )}
            </div>
          ))
        )}

        {canEdit && cols[active].length > 0 && (
          <button
            onClick={() => onAddTask(active)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-3 text-[13px] text-subtle transition-colors hover:text-muted"
          >
            <Plus size={14} /> New task
          </button>
        )}
      </div>
    </div>
  )
}
