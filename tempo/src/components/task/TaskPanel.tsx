import { useEffect, useState } from 'react'
import { MoreHorizontal, Trash2, X } from 'lucide-react'
import type { Priority, Status } from '../../types'
import {
  PRIORITY_META,
  PRIORITY_ORDER,
  STATUS_META,
  STATUS_ORDER,
} from '../../lib/constants'
import { useApp } from '../../store/AppData'
import { useAddComment, useDeleteTask, useTaskDetail, useUpdateTask } from '../../api/queries'
import { formatDateInput, formatRelativeTime, cx } from '../../lib/format'
import { Avatar } from '../ui/Avatar'
import { PriorityIcon } from '../ui/PriorityIcon'
import { LabelChip } from '../ui/LabelChip'
import { Dropdown, DropdownItem } from '../ui/Dropdown'
import { InlineError } from '../states/InlineError'

export function TaskPanel({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const { data: task, isLoading, isError, error, refetch } = useTaskDetail(taskId)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack Escape while a field/menu is being edited inside an input.
      if (e.key === 'Escape' && !(e.target instanceof HTMLTextAreaElement)) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 animate-fade-in bg-black/30" onClick={onClose} aria-hidden />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Task details"
        className="relative flex h-full w-full max-w-[460px] animate-slide-in flex-col border-l border-border bg-surface shadow-pop"
      >
        {isLoading ? (
          <PanelSkeleton onClose={onClose} />
        ) : isError || !task ? (
          <div className="flex h-full flex-col">
            <PanelHeader onClose={onClose} />
            <InlineError message={(error as Error)?.message ?? 'Task not found'} onRetry={() => refetch()} />
          </div>
        ) : (
          <TaskPanelBody task={task} onClose={onClose} />
        )}
      </aside>
    </div>
  )
}

function PanelHeader({ children, onClose }: { children?: React.ReactNode; onClose: () => void }) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
      {children}
      <button onClick={onClose} aria-label="Close panel" className="ml-auto rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-content">
        <X size={17} />
      </button>
    </div>
  )
}

function TaskPanelBody({
  task,
  onClose,
}: {
  task: import('../../types').TaskDetail
  onClose: () => void
}) {
  const { users, labels, currentUser, userById, labelById } = useApp()
  const update = useUpdateTask()
  const del = useDeleteTask()
  const addComment = useAddComment()

  const [title, setTitle] = useState(task.title)
  const [desc, setDesc] = useState(task.description)
  const [comment, setComment] = useState('')

  useEffect(() => setTitle(task.title), [task.id, task.title])
  useEffect(() => setDesc(task.description), [task.id, task.description])

  const patch = (p: Parameters<typeof update.mutate>[0]['patch']) =>
    update.mutate({ id: task.id, patch: p })

  const commitTitle = () => {
    const t = title.trim()
    if (t && t !== task.title) patch({ title: t })
    else setTitle(task.title)
  }
  const commitDesc = () => {
    if (desc !== task.description) patch({ description: desc })
  }

  const assignee = userById(task.assigneeId)
  const taskLabels = task.labelIds.map((id) => labelById(id)).filter(Boolean)

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault()
    const body = comment.trim()
    if (!body) return
    addComment.mutate({ taskId: task.id, authorId: currentUser.id, body })
    setComment('')
  }

  const remove = () => {
    if (window.confirm(`Delete ${task.key}? This can’t be undone.`)) {
      del.mutate(task.id)
      onClose()
    }
  }

  return (
    <>
      <PanelHeader onClose={onClose}>
        <span className="rounded bg-surface-2 px-1.5 py-0.5 text-2xs font-medium text-muted">{task.projectKey}</span>
        <span className="font-mono text-xs text-subtle">{task.key}</span>
        <Dropdown label={<MoreHorizontal size={15} />} align="right" width={160}>
          {(close) => (
            <button
              onClick={() => {
                close()
                remove()
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] text-red-400 transition-colors hover:bg-red-500/10"
            >
              <Trash2 size={14} /> Delete task
            </button>
          )}
        </Dropdown>
      </PanelHeader>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Title + description */}
        <div className="space-y-3 px-5 pt-5">
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                ;(e.target as HTMLTextAreaElement).blur()
              }
            }}
            rows={1}
            aria-label="Task title"
            className="w-full resize-none rounded-lg bg-transparent text-lg font-semibold leading-snug text-content outline-none focus:bg-surface-2/50 focus:px-2 focus:py-1"
          />
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            onBlur={commitDesc}
            placeholder="Add a description…"
            rows={3}
            aria-label="Task description"
            className="w-full resize-none rounded-lg bg-transparent text-[13px] leading-relaxed text-muted outline-none placeholder:text-subtle focus:bg-surface-2/50 focus:px-2 focus:py-1.5"
          />
        </div>

        {/* Properties */}
        <div className="mt-2 space-y-1 border-y border-border px-5 py-4">
          <Row label="Status">
            <Dropdown
              label={
                <span className="flex items-center gap-1.5">
                  <StatusDot status={task.status} /> {STATUS_META[task.status].label}
                </span>
              }
            >
              {(close) => (
                <>
                  {STATUS_ORDER.map((s) => (
                    <DropdownItem key={s} active={task.status === s} onClick={() => { patch({ status: s }); close() }}>
                      <StatusDot status={s} /> {STATUS_META[s].label}
                    </DropdownItem>
                  ))}
                </>
              )}
            </Dropdown>
          </Row>

          <Row label="Priority">
            <Dropdown
              label={
                <span className="flex items-center gap-1.5">
                  <PriorityIcon priority={task.priority} /> {PRIORITY_META[task.priority].label}
                </span>
              }
            >
              {(close) => (
                <>
                  {PRIORITY_ORDER.map((p) => (
                    <DropdownItem key={p} active={task.priority === p} onClick={() => { patch({ priority: p }); close() }}>
                      <PriorityIcon priority={p} /> {PRIORITY_META[p].label}
                    </DropdownItem>
                  ))}
                </>
              )}
            </Dropdown>
          </Row>

          <Row label="Assignee">
            <Dropdown
              label={
                <span className="flex items-center gap-1.5">
                  <Avatar user={assignee} size={18} /> {assignee ? assignee.name : 'Unassigned'}
                </span>
              }
            >
              {(close) => (
                <>
                  <DropdownItem active={!task.assigneeId} onClick={() => { patch({ assigneeId: null }); close() }}>
                    <Avatar size={18} /> Unassigned
                  </DropdownItem>
                  {users.map((u) => (
                    <DropdownItem key={u.id} active={task.assigneeId === u.id} onClick={() => { patch({ assigneeId: u.id }); close() }}>
                      <Avatar user={u} size={18} /> {u.name}
                    </DropdownItem>
                  ))}
                </>
              )}
            </Dropdown>
          </Row>

          <Row label="Due date">
            <input
              type="date"
              value={formatDateInput(task.dueDate)}
              onChange={(e) => patch({ dueDate: e.target.value || null })}
              className="h-8 rounded-lg border border-border bg-surface px-2 text-[13px] text-content outline-none focus:border-accent"
            />
          </Row>

          <Row label="Labels" align="start">
            <div className="flex flex-1 flex-wrap items-center justify-end gap-1.5">
              {taskLabels.map((l) => (
                <LabelChip
                  key={l!.id}
                  label={l!}
                  onRemove={() => patch({ labelIds: task.labelIds.filter((id) => id !== l!.id) })}
                />
              ))}
              <Dropdown label="＋" align="right">
                {() => (
                  <>
                    {labels.map((l) => (
                      <DropdownItem
                        key={l.id}
                        active={task.labelIds.includes(l.id)}
                        onClick={() =>
                          patch({
                            labelIds: task.labelIds.includes(l.id)
                              ? task.labelIds.filter((id) => id !== l.id)
                              : [...task.labelIds, l.id],
                          })
                        }
                      >
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
                        {l.name}
                      </DropdownItem>
                    ))}
                  </>
                )}
              </Dropdown>
            </div>
          </Row>
        </div>

        {/* Comments */}
        <div className="px-5 py-4">
          <h3 className="mb-3 text-2xs font-semibold uppercase tracking-wider text-subtle">
            Comments · {task.comments.length}
          </h3>
          <div className="space-y-4">
            {task.comments.length === 0 && (
              <p className="text-[13px] text-subtle">No comments yet. Start the conversation.</p>
            )}
            {task.comments.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <Avatar user={c.author} size={26} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[13px] font-semibold text-content">{c.author.name}</span>
                    <span className="text-2xs text-subtle">{formatRelativeTime(c.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 whitespace-pre-wrap text-[13px] leading-relaxed text-muted">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Composer */}
      <form onSubmit={submitComment} className="shrink-0 border-t border-border p-3">
        <div className="flex items-end gap-2 rounded-xl border border-border bg-surface-2/50 p-2 transition-colors focus-within:border-accent">
          <Avatar user={currentUser} size={26} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submitComment(e)
            }}
            placeholder="Write a comment…   (⌘↵ to send)"
            rows={1}
            aria-label="Write a comment"
            className="max-h-28 flex-1 resize-none bg-transparent py-1 text-[13px] text-content outline-none placeholder:text-subtle"
          />
          <button
            type="submit"
            disabled={!comment.trim()}
            className="h-7 rounded-lg bg-accent px-3 text-[13px] font-medium text-accent-contrast transition-all hover:brightness-110 active:scale-95 disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>
    </>
  )
}

function Row({
  label,
  align = 'center',
  children,
}: {
  label: string
  align?: 'center' | 'start'
  children: React.ReactNode
}) {
  return (
    <div className={cx('flex gap-3 py-1', align === 'center' ? 'items-center' : 'items-start')}>
      <span className="w-20 shrink-0 pt-1 text-[13px] text-subtle">{label}</span>
      <div className="flex flex-1 justify-end">{children}</div>
    </div>
  )
}

function StatusDot({ status }: { status: Status }) {
  const meta = STATUS_META[status]
  const Icon = meta.icon
  return <Icon size={14} style={{ color: meta.color }} />
}

function PanelSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <>
      <PanelHeader onClose={onClose} />
      <div className="space-y-4 p-5">
        <div className="shimmer h-6 w-3/4 rounded-lg" />
        <div className="shimmer h-16 w-full rounded-lg" />
        <div className="space-y-2 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shimmer h-8 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </>
  )
}
