import { GripVertical, MessageSquare } from 'lucide-react'
import type { HTMLAttributes } from 'react'
import type { Task } from '../../types'
import { useApp } from '../../store/AppData'
import { formatDue } from '../../lib/format'
import { cx } from '../../lib/format'
import { Avatar } from '../ui/Avatar'
import { PriorityIcon } from '../ui/PriorityIcon'
import { LabelChip } from '../ui/LabelChip'

interface Props {
  task: Task
  onOpen?: () => void
  handleProps?: HTMLAttributes<HTMLButtonElement>
  overlay?: boolean
  showProject?: boolean
}

const dueTone: Record<string, string> = {
  overdue: 'text-red-400',
  today: 'text-amber-400',
  soon: 'text-muted',
  normal: 'text-subtle',
}

export function TaskCard({ task, onOpen, handleProps, overlay, showProject }: Props) {
  const { userById, labelById } = useApp()
  const assignee = userById(task.assigneeId)
  const labels = task.labelIds.map((id) => labelById(id)).filter(Boolean)
  const due = formatDue(task.dueDate)

  return (
    <div
      className={cx(
        'group relative rounded-xl border bg-surface p-2.5 transition-colors',
        overlay
          ? 'border-accent shadow-drag rotate-[1.5deg]'
          : 'border-border hover:border-border-2',
      )}
      data-tempo-overlay={overlay ? '' : undefined}
    >
      {/* Drag handle (pointer + keyboard) */}
      {handleProps && (
        <button
          {...handleProps}
          aria-label={`Reorder ${task.key}`}
          className="absolute -left-0.5 top-2 cursor-grab touch-none rounded p-0.5 text-subtle opacity-0 transition-opacity hover:text-muted focus-visible:opacity-100 group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </button>
      )}

      {/* Clickable body opens the detail panel */}
      <button
        onClick={onOpen}
        className="block w-full pl-3 text-left"
        aria-label={`Open ${task.key}: ${task.title}`}
      >
        <div className="mb-1 flex items-center gap-2">
          <PriorityIcon priority={task.priority} />
          <span className="font-mono text-2xs text-subtle">{task.key}</span>
          {showProject && (
            <span className="rounded bg-surface-2 px-1.5 py-0.5 text-2xs font-medium text-muted">
              {task.projectKey}
            </span>
          )}
          <span className="ml-auto">
            <Avatar user={assignee} size={20} />
          </span>
        </div>

        <p className="line-clamp-2 text-[13px] font-medium leading-snug text-content">{task.title}</p>

        {(labels.length > 0 || due || task.commentCount > 0) && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {labels.map((l) => (
              <LabelChip key={l!.id} label={l!} />
            ))}
            {due && (
              <span className={cx('inline-flex items-center text-2xs font-medium', dueTone[due.tone])}>
                {due.label}
              </span>
            )}
            {task.commentCount > 0 && (
              <span className="inline-flex items-center gap-0.5 text-2xs text-subtle">
                <MessageSquare size={11} />
                {task.commentCount}
              </span>
            )}
          </div>
        )}
      </button>
    </div>
  )
}
