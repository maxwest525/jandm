import { useEffect, useState } from 'react'
import type { Priority, Status } from '../../types'
import { PRIORITY_ORDER, PRIORITY_META, STATUS_ORDER, STATUS_META } from '../../lib/constants'
import { useApp } from '../../store/AppData'
import { useCreateTask } from '../../api/queries'
import { Modal } from '../ui/Modal'
import { Field, Select, inputClass } from '../ui/Field'
import { cx } from '../../lib/format'

interface Props {
  open: boolean
  onClose: () => void
  projectId: string
  projectKey: string
  defaultStatus?: Status
}

export function CreateTaskModal({ open, onClose, projectId, projectKey, defaultStatus }: Props) {
  const { users, labels, currentUser } = useApp()
  const create = useCreateTask()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Status>(defaultStatus ?? 'backlog')
  const [priority, setPriority] = useState<Priority>('none')
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [dueDate, setDueDate] = useState('')
  const [labelIds, setLabelIds] = useState<string[]>([])
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle('')
      setDescription('')
      setStatus(defaultStatus ?? 'backlog')
      setPriority('none')
      setAssigneeId('')
      setDueDate('')
      setLabelIds([])
      setTouched(false)
    }
  }, [open, defaultStatus])

  const valid = title.trim().length > 0

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!valid) return
    create.mutate({
      projectId,
      projectKey,
      input: {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assigneeId: assigneeId || null,
        dueDate: dueDate || null,
        labelIds,
      },
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={`New task in ${projectKey}`}>
      <form onSubmit={submit} className="space-y-4 p-5">
        <Field label="Title" htmlFor="t-title" error={touched && !valid ? 'A title is required.' : undefined}>
          <input
            id="t-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className={cx(inputClass, touched && !valid && 'border-red-400')}
            autoComplete="off"
          />
        </Field>

        <Field label="Description" htmlFor="t-desc">
          <textarea
            id="t-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more detail…"
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              {PRIORITY_ORDER.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_META[p].label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Assignee">
            <Select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                  {u.id === currentUser.id ? ' (me)' : ''}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Due date">
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={`${inputClass} py-1.5`} />
          </Field>
        </div>

        <Field label="Labels">
          <div className="flex flex-wrap gap-1.5">
            {labels.map((l) => {
              const active = labelIds.includes(l.id)
              return (
                <button
                  type="button"
                  key={l.id}
                  onClick={() =>
                    setLabelIds((ids) => (active ? ids.filter((i) => i !== l.id) : [...ids, l.id]))
                  }
                  className="rounded-full border px-2 py-0.5 text-2xs font-medium transition-all"
                  style={{
                    color: l.color,
                    borderColor: active ? l.color : 'var(--border-2)',
                    background: active ? `${l.color}1f` : 'transparent',
                    opacity: active ? 1 : 0.7,
                  }}
                >
                  {l.name}
                </button>
              )
            })}
          </div>
        </Field>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-border px-3.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-content"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={touched && !valid}
            className="h-9 rounded-lg bg-accent px-4 text-sm font-medium text-accent-contrast transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            Create task
          </button>
        </div>
      </form>
    </Modal>
  )
}
