import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Activity as ActivityIcon, FolderX, SquareKanban } from 'lucide-react'
import type { Status } from '../types'
import { useApp } from '../store/AppData'
import { useProjectTasks } from '../api/queries'
import { useTaskFilters } from '../hooks/useTaskFilters'
import { useTaskPanel } from '../hooks/useTaskPanel'
import { useIsDesktop } from '../hooks/useMediaQuery'
import { Board, ReadOnlyBoard } from '../components/board/Board'
import { MobileBoard } from '../components/board/MobileBoard'
import { Toolbar } from '../components/board/Toolbar'
import { BoardSkeleton } from '../components/board/BoardSkeleton'
import { ActivityFeed } from '../components/activity/ActivityFeed'
import { InlineError } from '../components/states/InlineError'
import { EmptyState } from '../components/states/EmptyState'
import { CreateTaskModal } from '../components/task/CreateTaskModal'
import { cx } from '../lib/format'

type ViewMode = 'board' | 'activity'

export function BoardView() {
  const { projectId } = useParams<{ projectId: string }>()
  const { projectById, users, labels, canEdit } = useApp()
  const project = projectId ? projectById(projectId) : undefined
  const { data: tasks, isLoading, isError, error, refetch } = useProjectTasks(projectId)
  const { openTask } = useTaskPanel()
  const isDesktop = useIsDesktop()
  const { filters, helpers, activeCount, apply } = useTaskFilters('manual')
  const [mode, setMode] = useState<ViewMode>('board')
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
      <header className="border-b border-border px-4 pb-2 pt-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="h-3 w-3 rounded-[5px]" style={{ background: project.color }} />
          <h1 className="truncate text-[17px] font-semibold tracking-tight">{project.name}</h1>
          <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-2xs text-subtle">{project.key}</span>
          {!canEdit && (
            <span className="rounded-full border border-border-2 px-2 py-0.5 text-2xs font-medium text-subtle">Read-only</span>
          )}
        </div>
        {project.description && (
          <p className="mt-1 hidden max-w-2xl text-[13px] text-muted sm:block">{project.description}</p>
        )}

        {/* Board / Activity switch */}
        <div className="mt-3 flex gap-1">
          <SegTab active={mode === 'board'} onClick={() => setMode('board')} icon={<SquareKanban size={14} />}>
            Board
          </SegTab>
          <SegTab active={mode === 'activity'} onClick={() => setMode('activity')} icon={<ActivityIcon size={14} />}>
            Activity
          </SegTab>
        </div>
      </header>

      {mode === 'board' && (
        <Toolbar
          filters={filters}
          helpers={helpers}
          activeCount={activeCount}
          users={users}
          labels={labels}
          resultCount={filtered.length}
          onNewTask={canEdit ? () => setCreateState({ status: 'backlog' }) : undefined}
        />
      )}

      <div className="min-h-0 flex-1">
        {mode === 'activity' ? (
          <div className="h-full overflow-y-auto">
            <ActivityFeed projectId={project.id} />
          </div>
        ) : isLoading ? (
          <BoardSkeleton />
        ) : isError ? (
          <InlineError message={(error as Error)?.message ?? 'Unknown error'} onRetry={() => refetch()} />
        ) : isDesktop ? (
          canEdit ? (
            <Board tasks={filtered} onOpenTask={openTask} onAddTask={(s) => setCreateState({ status: s })} />
          ) : (
            <ReadOnlyBoard tasks={filtered} onOpenTask={openTask} />
          )
        ) : (
          <MobileBoard
            tasks={filtered}
            onOpenTask={openTask}
            onAddTask={(s) => setCreateState({ status: s })}
            canEdit={canEdit}
          />
        )}
      </div>

      {canEdit && (
        <CreateTaskModal
          open={!!createState}
          onClose={() => setCreateState(null)}
          projectId={project.id}
          projectKey={project.key}
          defaultStatus={createState?.status}
        />
      )}
    </div>
  )
}

function SegTab({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors',
        active ? 'bg-surface-2 text-content' : 'text-muted hover:text-content',
      )}
    >
      {icon}
      {children}
    </button>
  )
}
