import { ArrowUpDown, Plus, Search, Tag, UserCircle2, X, Flag } from 'lucide-react'
import type { Label, User } from '../../types'
import { PRIORITY_META, PRIORITY_ORDER } from '../../lib/constants'
import type { Filters, SortKey } from '../../hooks/useTaskFilters'
import { Dropdown, DropdownItem } from '../ui/Dropdown'
import { Avatar } from '../ui/Avatar'
import { PriorityIcon } from '../ui/PriorityIcon'

const SORT_LABELS: Record<SortKey, string> = {
  manual: 'Manual',
  priority: 'Priority',
  due: 'Due date',
  created: 'Newest',
  title: 'Title',
}

interface Props {
  filters: Filters
  helpers: {
    setSearch: (s: string) => void
    setSort: (s: SortKey) => void
    toggleAssignee: (id: string) => void
    togglePriority: (p: any) => void
    toggleLabel: (id: string) => void
    clear: () => void
  }
  activeCount: number
  users: User[]
  labels: Label[]
  resultCount: number
  onNewTask?: () => void
  showSort?: boolean
}

export function Toolbar({
  filters,
  helpers,
  activeCount,
  users,
  labels,
  resultCount,
  onNewTask,
  showSort = true,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 sm:px-6">
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-subtle" />
        <input
          value={filters.search}
          onChange={(e) => helpers.setSearch(e.target.value)}
          placeholder="Search…"
          aria-label="Search tasks"
          className="h-8 w-44 rounded-lg border border-border bg-surface pl-8 pr-2.5 text-[13px] text-content placeholder:text-subtle outline-none transition-colors focus:border-accent"
        />
      </div>

      <Dropdown label="Assignee" icon={UserCircle2} badge={filters.assignees.length}>
        {() => (
          <>
            {users.map((u) => (
              <DropdownItem key={u.id} active={filters.assignees.includes(u.id)} onClick={() => helpers.toggleAssignee(u.id)}>
                <Avatar user={u} size={18} />
                <span className="truncate">{u.name}</span>
              </DropdownItem>
            ))}
          </>
        )}
      </Dropdown>

      <Dropdown label="Priority" icon={Flag} badge={filters.priorities.length}>
        {() => (
          <>
            {PRIORITY_ORDER.map((p) => (
              <DropdownItem key={p} active={filters.priorities.includes(p)} onClick={() => helpers.togglePriority(p)}>
                <PriorityIcon priority={p} />
                <span>{PRIORITY_META[p].label}</span>
              </DropdownItem>
            ))}
          </>
        )}
      </Dropdown>

      <Dropdown label="Label" icon={Tag} badge={filters.labels.length}>
        {() => (
          <>
            {labels.map((l) => (
              <DropdownItem key={l.id} active={filters.labels.includes(l.id)} onClick={() => helpers.toggleLabel(l.id)}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
                <span>{l.name}</span>
              </DropdownItem>
            ))}
          </>
        )}
      </Dropdown>

      {showSort && (
        <Dropdown label={`Sort: ${SORT_LABELS[filters.sort]}`} icon={ArrowUpDown} width={180}>
          {(close) => (
            <>
              {(Object.keys(SORT_LABELS) as SortKey[]).map((s) => (
                <DropdownItem
                  key={s}
                  active={filters.sort === s}
                  onClick={() => {
                    helpers.setSort(s)
                    close()
                  }}
                >
                  {SORT_LABELS[s]}
                </DropdownItem>
              ))}
            </>
          )}
        </Dropdown>
      )}

      {activeCount > 0 && (
        <button
          onClick={helpers.clear}
          className="flex h-8 items-center gap-1 rounded-lg px-2 text-[13px] text-muted transition-colors hover:bg-surface-2 hover:text-content"
        >
          <X size={13} /> Clear
        </button>
      )}

      <div className="ml-auto flex items-center gap-3">
        <span className="text-2xs text-subtle tnum">{resultCount} tasks</span>
        {onNewTask && (
          <button
            onClick={onNewTask}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-[13px] font-medium text-accent-contrast transition-all hover:brightness-110 active:scale-95"
          >
            <Plus size={15} /> New task
          </button>
        )}
      </div>
    </div>
  )
}
