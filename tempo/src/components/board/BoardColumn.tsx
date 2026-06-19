import { Plus } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Status, Task } from '../../types'
import { STATUS_META } from '../../lib/constants'
import { SortableTaskCard } from './SortableTaskCard'

export function BoardColumn({
  status,
  tasks,
  onOpenTask,
  onAddTask,
}: {
  status: Status
  tasks: Task[]
  onOpenTask: (id: string) => void
  onAddTask: (status: Status) => void
}) {
  const meta = STATUS_META[status]
  const Icon = meta.icon
  const { setNodeRef, isOver } = useDroppable({ id: status, data: { type: 'column', status } })

  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col">
      <div className="mb-2 flex items-center gap-2 px-1">
        <Icon size={15} style={{ color: meta.color }} />
        <h2 className="text-[13px] font-semibold text-content">{meta.label}</h2>
        <span className="rounded-full bg-surface-2 px-1.5 text-2xs font-medium text-subtle tnum">
          {tasks.length}
        </span>
        <button
          onClick={() => onAddTask(status)}
          aria-label={`Add task to ${meta.label}`}
          className="ml-auto rounded-md p-1 text-subtle transition-colors hover:bg-surface-2 hover:text-content"
        >
          <Plus size={15} />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 overflow-y-auto rounded-xl p-1 transition-colors ${
          isOver ? 'bg-accent-soft/60 ring-1 ring-inset ring-accent/40' : ''
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onOpen={() => onOpenTask(task.id)} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <button
            onClick={() => onAddTask(status)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-8 text-[13px] text-subtle transition-colors hover:border-border-2 hover:text-muted"
          >
            <Plus size={14} /> New task
          </button>
        )}
      </div>
    </div>
  )
}
