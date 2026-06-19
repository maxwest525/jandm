import { CheckCircle2, Inbox } from 'lucide-react'
import type { Status, Task } from '../types'
import { STATUS_META, STATUS_ORDER } from '../lib/constants'
import { useApp } from '../store/AppData'
import { useMyTasks } from '../api/queries'
import { useTaskFilters } from '../hooks/useTaskFilters'
import { useTaskPanel } from '../hooks/useTaskPanel'
import { Toolbar } from '../components/board/Toolbar'
import { TaskCard } from '../components/task/TaskCard'
import { EmptyState } from '../components/states/EmptyState'
import { InlineError } from '../components/states/InlineError'

export function MyWorkView() {
  const { currentUser, users, labels } = useApp()
  const { data: tasks, isLoading, isError, error, refetch } = useMyTasks(currentUser.id)
  const { filters, helpers, activeCount, apply } = useTaskFilters('due')
  const { openTask } = useTaskPanel()

  const filtered = apply(tasks ?? [])
  const grouped = STATUS_ORDER.map((status) => ({
    status,
    items: filtered.filter((t) => t.status === status),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border px-4 pb-1 pt-4 sm:px-6">
        <h1 className="text-[17px] font-semibold tracking-tight">My Work</h1>
        <p className="mt-1 text-[13px] text-muted">
          Everything assigned to {currentUser.name.split(' ')[0]}, across all projects.
        </p>
      </header>

      <Toolbar
        filters={filters}
        helpers={helpers}
        activeCount={activeCount}
        users={users}
        labels={labels}
        resultCount={filtered.length}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-10 sm:px-6">
        {isLoading ? (
          <MyWorkSkeleton />
        ) : isError ? (
          <InlineError message={(error as Error)?.message ?? 'Unknown error'} onRetry={() => refetch()} />
        ) : filtered.length === 0 ? (
          <div className="grid h-full place-items-center">
            <EmptyState
              icon={tasks && tasks.length ? Inbox : CheckCircle2}
              title={tasks && tasks.length ? 'No tasks match your filters' : 'You’re all caught up'}
              description={
                tasks && tasks.length
                  ? 'Try clearing a filter to see more.'
                  : 'Nothing is assigned to you right now. Enjoy the calm.'
              }
              action={
                activeCount > 0 ? (
                  <button
                    onClick={helpers.clear}
                    className="h-8 rounded-lg border border-border px-3 text-[13px] font-medium text-muted hover:bg-surface-2 hover:text-content"
                  >
                    Clear filters
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 py-4">
            {grouped.map(({ status, items }) => (
              <StatusGroup key={status} status={status} items={items} onOpen={openTask} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusGroup({
  status,
  items,
  onOpen,
}: {
  status: Status
  items: Task[]
  onOpen: (id: string) => void
}) {
  const meta = STATUS_META[status]
  const Icon = meta.icon
  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <Icon size={15} style={{ color: meta.color }} />
        <h2 className="text-[13px] font-semibold text-content">{meta.label}</h2>
        <span className="rounded-full bg-surface-2 px-1.5 text-2xs font-medium text-subtle tnum">
          {items.length}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((t) => (
          <TaskCard key={t.id} task={t} onOpen={() => onOpen(t.id)} showProject />
        ))}
      </div>
    </section>
  )
}

function MyWorkSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 py-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="shimmer rounded-xl border border-border" style={{ height: 76 }} />
      ))}
    </div>
  )
}
