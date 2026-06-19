import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import type { Status, Task } from '../../types'
import { STATUS_ORDER } from '../../lib/constants'
import { useUpdateTask } from '../../api/queries'
import { BoardColumn } from './BoardColumn'
import { TaskCard } from '../task/TaskCard'

type Columns = Record<Status, Task[]>

function group(tasks: Task[]): Columns {
  const cols: Columns = { backlog: [], in_progress: [], in_review: [], done: [] }
  for (const t of tasks) cols[t.status].push(t)
  return cols
}

function midpoint(prev?: Task, next?: Task): number {
  const P = prev?.position
  const N = next?.position
  if (P == null && N == null) return 1024
  if (P == null) return N! / 2
  if (N == null) return P + 1024
  const mid = (P + N) / 2
  return mid === P || mid === N ? P + (N - P) / 2 : mid
}

export function Board({
  tasks,
  onOpenTask,
  onAddTask,
}: {
  tasks: Task[]
  onOpenTask: (id: string) => void
  onAddTask: (status: Status) => void
}) {
  const update = useUpdateTask()
  const [columns, setColumns] = useState<Columns>(() => group(tasks))
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const dragging = useRef(false)

  // Reconcile with server data whenever we're not mid-drag.
  useEffect(() => {
    if (!dragging.current) setColumns(group(tasks))
  }, [tasks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const findContainer = (id: string, cols: Columns): Status | null => {
    if (STATUS_ORDER.includes(id as Status)) return id as Status
    return (STATUS_ORDER.find((s) => cols[s].some((t) => t.id === id)) as Status) ?? null
  }

  const onDragStart = (e: DragStartEvent) => {
    dragging.current = true
    setActiveTask((e.active.data.current?.task as Task) ?? null)
  }

  const onDragOver = (e: DragOverEvent) => {
    const { active, over } = e
    if (!over) return
    setColumns((cols) => {
      const from = findContainer(active.id as string, cols)
      const to = findContainer(over.id as string, cols)
      if (!from || !to || from === to) return cols
      const moving = cols[from].find((t) => t.id === active.id)
      if (!moving) return cols
      const overIsColumn = STATUS_ORDER.includes(over.id as Status)
      const overIndex = overIsColumn ? cols[to].length : cols[to].findIndex((t) => t.id === over.id)
      const insertAt = overIndex < 0 ? cols[to].length : overIndex
      return {
        ...cols,
        [from]: cols[from].filter((t) => t.id !== active.id),
        [to]: [...cols[to].slice(0, insertAt), { ...moving, status: to }, ...cols[to].slice(insertAt)],
      }
    })
  }

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    const original = activeTask
    setActiveTask(null)
    dragging.current = false
    if (!over || !original) {
      setColumns(group(tasks))
      return
    }

    setColumns((cols) => {
      const container = findContainer(active.id as string, cols)
      if (!container) return cols
      const items = cols[container]
      const oldIndex = items.findIndex((t) => t.id === active.id)
      const overIsColumn = STATUS_ORDER.includes(over.id as Status)
      const newIndex = overIsColumn ? items.length - 1 : items.findIndex((t) => t.id === over.id)
      const reordered =
        oldIndex === newIndex || newIndex < 0 ? items : arrayMove(items, oldIndex, newIndex)
      const finalCols = { ...cols, [container]: reordered }

      const idx = reordered.findIndex((t) => t.id === active.id)
      const position = midpoint(reordered[idx - 1], reordered[idx + 1])

      if (container !== original.status || position !== original.position) {
        update.mutate({ id: original.id, patch: { status: container, position } })
      }
      return finalCols
    })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => {
        dragging.current = false
        setActiveTask(null)
        setColumns(group(tasks))
      }}
    >
      <div className="flex h-full gap-4 overflow-x-auto px-4 pb-4 sm:px-6">
        {STATUS_ORDER.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            tasks={columns[status]}
            onOpenTask={onOpenTask}
            onAddTask={onAddTask}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(.16,1,.3,1)' }}>
        {activeTask ? (
          <div className="w-[290px]">
            <TaskCard task={activeTask} overlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
