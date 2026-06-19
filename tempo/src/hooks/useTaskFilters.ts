import { useMemo, useState } from 'react'
import type { Priority, Task } from '../types'
import { PRIORITY_META } from '../lib/constants'

export type SortKey = 'manual' | 'priority' | 'due' | 'created' | 'title'

export interface Filters {
  search: string
  assignees: string[]
  priorities: Priority[]
  labels: string[]
  sort: SortKey
}

const EMPTY: Filters = { search: '', assignees: [], priorities: [], labels: [], sort: 'manual' }

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
}

export function useTaskFilters(initialSort: SortKey = 'manual') {
  const [filters, setFilters] = useState<Filters>({ ...EMPTY, sort: initialSort })

  const helpers = useMemo(
    () => ({
      setSearch: (search: string) => setFilters((f) => ({ ...f, search })),
      setSort: (sort: SortKey) => setFilters((f) => ({ ...f, sort })),
      toggleAssignee: (id: string) =>
        setFilters((f) => ({ ...f, assignees: toggle(f.assignees, id) })),
      togglePriority: (p: Priority) =>
        setFilters((f) => ({ ...f, priorities: toggle(f.priorities, p) })),
      toggleLabel: (id: string) => setFilters((f) => ({ ...f, labels: toggle(f.labels, id) })),
      clear: () => setFilters((f) => ({ ...EMPTY, sort: f.sort })),
    }),
    [],
  )

  const activeCount =
    filters.assignees.length + filters.priorities.length + filters.labels.length

  function apply(tasks: Task[]): Task[] {
    const q = filters.search.trim().toLowerCase()
    let out = tasks.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q) && !t.key.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q))
        return false
      if (filters.assignees.length) {
        if (!t.assigneeId || !filters.assignees.includes(t.assigneeId)) return false
      }
      if (filters.priorities.length && !filters.priorities.includes(t.priority)) return false
      if (filters.labels.length && !filters.labels.some((l) => t.labelIds.includes(l))) return false
      return true
    })

    out = [...out].sort((a, b) => {
      switch (filters.sort) {
        case 'priority':
          return PRIORITY_META[a.priority].rank - PRIORITY_META[b.priority].rank || a.position - b.position
        case 'due':
          return dueRank(a.dueDate) - dueRank(b.dueDate)
        case 'created':
          return b.createdAt.localeCompare(a.createdAt)
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return a.position - b.position
      }
    })
    return out
  }

  return { filters, helpers, activeCount, apply }
}

function dueRank(due: string | null): number {
  if (!due) return Number.MAX_SAFE_INTEGER
  return new Date(due).getTime()
}
