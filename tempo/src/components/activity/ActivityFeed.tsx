import { Fragment } from 'react'
import { Activity as ActivityIcon } from 'lucide-react'
import type { Activity } from '../../types'
import { STATUS_META } from '../../lib/constants'
import { useProjectActivity } from '../../api/queries'
import { useTaskPanel } from '../../hooks/useTaskPanel'
import { formatRelativeTime } from '../../lib/format'
import { Avatar } from '../ui/Avatar'
import { EmptyState } from '../states/EmptyState'
import { InlineError } from '../states/InlineError'

export function ActivityFeed({ projectId }: { projectId: string }) {
  const { data, isLoading, isError, error, refetch } = useProjectActivity(projectId)
  const { openTask } = useTaskPanel()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-3 px-4 py-6 sm:px-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="shimmer h-12 rounded-xl border border-border" />
        ))}
      </div>
    )
  }
  if (isError) return <InlineError message={(error as Error)?.message ?? 'Error'} onRetry={() => refetch()} />
  if (!data || data.length === 0) {
    return (
      <div className="grid h-full place-items-center">
        <EmptyState icon={ActivityIcon} title="No activity yet" description="Task changes and comments will show up here." />
      </div>
    )
  }

  // Group by calendar day for scannability.
  const groups: { day: string; items: Activity[] }[] = []
  for (const a of data) {
    const day = new Date(a.createdAt).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
    const last = groups[groups.length - 1]
    if (last && last.day === day) last.items.push(a)
    else groups.push({ day, items: [a] })
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6">
      {groups.map((g) => (
        <Fragment key={g.day}>
          <h3 className="sticky top-0 z-[1] bg-bg/90 py-2 text-2xs font-semibold uppercase tracking-wider text-subtle backdrop-blur">
            {g.day}
          </h3>
          <ul className="mb-4 space-y-0.5">
            {g.items.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => a.taskId && openTask(a.taskId)}
                  disabled={!a.taskId}
                  className="flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors enabled:hover:bg-surface-2 disabled:cursor-default"
                >
                  <Avatar user={a.actor} size={24} />
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-[13px] leading-snug text-muted">
                      <span className="font-medium text-content">{a.actor.name.split(' ')[0]}</span>{' '}
                      <ActivitySentence activity={a} />
                    </p>
                    <span className="text-2xs text-subtle">{formatRelativeTime(a.createdAt)}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Fragment>
      ))}
    </div>
  )
}

function ActivitySentence({ activity: a }: { activity: Activity }) {
  const key = a.data.taskKey ? <span className="font-mono text-xs text-content">{a.data.taskKey}</span> : null
  switch (a.type) {
    case 'task_created':
      return <>created {key}</>
    case 'task_moved':
      return (
        <>
          moved {key} from{' '}
          <span className="text-content">{a.data.from ? STATUS_META[a.data.from].label : '—'}</span> to{' '}
          <span className="text-content">{a.data.to ? STATUS_META[a.data.to].label : '—'}</span>
        </>
      )
    case 'task_updated':
      return (
        <>
          updated {a.data.fields?.join(', ') ?? 'fields'} on {key}
        </>
      )
    case 'commented':
      return (
        <>
          commented on {key}
          {a.data.excerpt ? <span className="text-subtle"> — “{a.data.excerpt}”</span> : null}
        </>
      )
    case 'task_deleted':
      return <>deleted {key}</>
    default:
      return <>updated {key}</>
  }
}
