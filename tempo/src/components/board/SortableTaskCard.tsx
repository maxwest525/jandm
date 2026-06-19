import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../../types'
import { TaskCard } from '../task/TaskCard'

export function SortableTaskCard({ task, onOpen }: { task: Task; onOpen: () => void }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-40' : undefined}>
      <TaskCard task={task} onOpen={onOpen} handleProps={{ ...attributes, ...listeners }} />
    </div>
  )
}
