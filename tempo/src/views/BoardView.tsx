import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { FolderX } from 'lucide-react'
import type { Status } from '../types'
import { useApp } from '../store/AppData'
import { useProjectTasks } from '../api/queries'
import { useTaskFilters } from '../hooks/useTaskFilters'
import { useTaskPanel } from '../hooks/useTaskPanel'
import { Board } from '../components/board/Board'
import { Toolbar } from '../components/board/Toolbar'
import { BoardSkeleton } from '../components/board/BoardSkeleton'
import { InlineError } from '../components/states/InlineError'
import { EmptyState } from '../components/states/EmptyState'
import { CreateTaskModal } from '../components/task/CreateTaskModal'

export function BoardView() {
  const { projectId } = useParams<{ projectId: string }>()
  const { projectById, users, labels } = useApp()
  const project = projectId ? projectById(projectId) : undefined
  const { data: tasks, isLoading, isError, error, refetch } = useProjectTasks(projectId)
  const { openTask } = useTaskPanel()
  const { filters, helpers, activeCount, apply } = useTaskFilters('manual')
  const [createState, setCreateState] = useState<{ status: Status } | null>(null)

  if (!project) {
    return (
      <div className="grid h-full place-items-center">
        <EmptyState icon={FolderX} title="Project not found" description="This project may have been removed." />
      </div>
    )
  }

  const filtered = apply(tasks ?? [])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 pb-1 pt-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="h-3 w-3 rounded-[5px]" style={{ background: project.color }} />
          <h1 className="text-[17px] font-semibold tracking-tight">{project.name}</h1>
          <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-2xs text-subtle">{project.key}</span>
        </div>
        {project.description && <p className="mt-1 max-w-2xl text-[13px] text-muted">{project.description}</p>}
      </header>

      <Toolbar
        filters={filters}
        helpers={helpers}
        activeCount={activeCount}
        users={users}
        labels={labels}
        resultCount={filtered.length}
        onNewTask={() => setCreateState({ status: 'backlog' })}
      />

      <div className="min-h-0 flex-1">
        {isLoading ? (
          <BoardSkeleton />
        ) : isError ? (
          <InlineError message={(error as Error)?.message ?? 'Unknown error'} onRetry={() => refetch()} />
        ) : (
          <Board
            tasks={filtered}
            onOpenTask={openTask}
            onAddTask={(status) => setCreateState({ status })}
          />
        )}
      </div>

      <CreateTaskModal
        open={!!createState}
        onClose={() => setCreateState(null)}
        projectId={project.id}
        projectKey={project.key}
        defaultStatus={createState?.status}
      />
    </div>
  )
}
