import { nanoid } from 'nanoid'
import { db } from './db'
import type {
  Comment,
  Label,
  Priority,
  Project,
  Status,
  Task,
  TaskDetail,
  User,
} from './types'
import { PRIORITIES, STATUSES } from './types'

const now = () => new Date().toISOString()

/* ----------------------------- row mappers ----------------------------- */

interface TaskRow {
  id: string
  project_id: string
  project_key: string
  seq: number
  title: string
  description: string
  status: string
  position: number
  priority: string
  assignee_id: string | null
  due_date: string | null
  created_at: string
  updated_at: string
  label_ids: string | null
  comment_count: number
}

const TASK_SELECT = `
  SELECT t.*, p.key AS project_key,
    (SELECT group_concat(tl.label_id) FROM task_labels tl WHERE tl.task_id = t.id) AS label_ids,
    (SELECT COUNT(*) FROM comments c WHERE c.task_id = t.id) AS comment_count
  FROM tasks t
  JOIN projects p ON p.id = t.project_id
`

function mapTask(r: TaskRow): Task {
  return {
    id: r.id,
    projectId: r.project_id,
    projectKey: r.project_key,
    seq: r.seq,
    key: `${r.project_key}-${r.seq}`,
    title: r.title,
    description: r.description,
    status: r.status as Status,
    position: r.position,
    priority: r.priority as Priority,
    assigneeId: r.assignee_id,
    dueDate: r.due_date,
    labelIds: r.label_ids ? r.label_ids.split(',') : [],
    commentCount: r.comment_count,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

const mapUser = (r: any): User => r as User

/* ------------------------------- reads -------------------------------- */

export function listUsers(): User[] {
  return db.prepare('SELECT * FROM users ORDER BY name').all() as User[]
}

export function listLabels(): Label[] {
  return db.prepare('SELECT * FROM labels ORDER BY name').all() as Label[]
}

export function listProjects(): Project[] {
  const rows = db.prepare('SELECT * FROM projects ORDER BY created_at').all() as any[]
  return rows.map((r) => ({
    id: r.id,
    key: r.key,
    name: r.name,
    description: r.description,
    color: r.color,
    createdAt: r.created_at,
  }))
}

export function getProject(id: string): Project | undefined {
  return listProjects().find((p) => p.id === id)
}

export function listTasksByProject(projectId: string): Task[] {
  const rows = db
    .prepare(`${TASK_SELECT} WHERE t.project_id = ? ORDER BY t.status, t.position`)
    .all(projectId) as TaskRow[]
  return rows.map(mapTask)
}

export function listTasksByAssignee(userId: string): Task[] {
  const rows = db
    .prepare(`${TASK_SELECT} WHERE t.assignee_id = ? ORDER BY t.position`)
    .all(userId) as TaskRow[]
  return rows.map(mapTask)
}

export function getTask(id: string): Task | undefined {
  const row = db.prepare(`${TASK_SELECT} WHERE t.id = ?`).get(id) as TaskRow | undefined
  return row ? mapTask(row) : undefined
}

export function getTaskDetail(id: string): TaskDetail | undefined {
  const task = getTask(id)
  if (!task) return undefined
  return { ...task, comments: listComments(id) }
}

export function listComments(taskId: string): Comment[] {
  const rows = db
    .prepare(
      `SELECT c.id, c.task_id, c.body, c.created_at,
              u.id AS u_id, u.name AS u_name, u.email AS u_email,
              u.initials AS u_initials, u.color AS u_color
       FROM comments c JOIN users u ON u.id = c.author_id
       WHERE c.task_id = ? ORDER BY c.created_at`,
    )
    .all(taskId) as any[]
  return rows.map((r) => ({
    id: r.id,
    taskId: r.task_id,
    body: r.body,
    createdAt: r.created_at,
    author: {
      id: r.u_id,
      name: r.u_name,
      email: r.u_email,
      initials: r.u_initials,
      color: r.u_color,
    },
  }))
}

/* ------------------------------- writes ------------------------------- */

function nextSeq(projectId: string): number {
  const row = db
    .prepare('SELECT COALESCE(MAX(seq), 0) AS m FROM tasks WHERE project_id = ?')
    .get(projectId) as { m: number }
  return row.m + 1
}

function bottomPosition(projectId: string, status: Status): number {
  const row = db
    .prepare('SELECT COALESCE(MAX(position), 0) AS m FROM tasks WHERE project_id = ? AND status = ?')
    .get(projectId, status) as { m: number }
  return row.m + 1024
}

export interface CreateTaskInput {
  title: string
  description?: string
  status?: Status
  priority?: Priority
  assigneeId?: string | null
  dueDate?: string | null
  labelIds?: string[]
}

export function createTask(projectId: string, input: CreateTaskInput): Task {
  if (!getProject(projectId)) throw new HttpError(404, 'Project not found')
  const title = (input.title ?? '').trim()
  if (!title) throw new HttpError(400, 'Title is required')

  const status: Status = STATUSES.includes(input.status as Status)
    ? (input.status as Status)
    : 'backlog'
  const priority: Priority = PRIORITIES.includes(input.priority as Priority)
    ? (input.priority as Priority)
    : 'none'

  const id = nanoid(12)
  const ts = now()
  db.prepare(
    `INSERT INTO tasks (id, project_id, seq, title, description, status, position, priority, assignee_id, due_date, created_at, updated_at)
     VALUES (@id, @project_id, @seq, @title, @description, @status, @position, @priority, @assignee_id, @due_date, @created_at, @updated_at)`,
  ).run({
    id,
    project_id: projectId,
    seq: nextSeq(projectId),
    title,
    description: input.description ?? '',
    status,
    position: bottomPosition(projectId, status),
    priority,
    assignee_id: input.assigneeId ?? null,
    due_date: input.dueDate ?? null,
    created_at: ts,
    updated_at: ts,
  })
  if (input.labelIds) setLabels(id, input.labelIds)
  return getTask(id)!
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  status?: Status
  position?: number
  priority?: Priority
  assigneeId?: string | null
  dueDate?: string | null
  labelIds?: string[]
}

export function updateTask(id: string, patch: UpdateTaskInput): Task {
  const existing = getTask(id)
  if (!existing) throw new HttpError(404, 'Task not found')

  const sets: string[] = []
  const params: Record<string, unknown> = { id }

  const assign = (col: string, key: string, value: unknown) => {
    sets.push(`${col} = @${key}`)
    params[key] = value
  }

  if (patch.title !== undefined) {
    const t = patch.title.trim()
    if (!t) throw new HttpError(400, 'Title cannot be empty')
    assign('title', 'title', t)
  }
  if (patch.description !== undefined) assign('description', 'description', patch.description)
  if (patch.status !== undefined) {
    if (!STATUSES.includes(patch.status)) throw new HttpError(400, 'Invalid status')
    assign('status', 'status', patch.status)
  }
  if (patch.position !== undefined) assign('position', 'position', patch.position)
  if (patch.priority !== undefined) {
    if (!PRIORITIES.includes(patch.priority)) throw new HttpError(400, 'Invalid priority')
    assign('priority', 'priority', patch.priority)
  }
  if (patch.assigneeId !== undefined) assign('assignee_id', 'assignee_id', patch.assigneeId)
  if (patch.dueDate !== undefined) assign('due_date', 'due_date', patch.dueDate)

  assign('updated_at', 'updated_at', now())

  const tx = db.transaction(() => {
    if (sets.length) {
      db.prepare(`UPDATE tasks SET ${sets.join(', ')} WHERE id = @id`).run(params)
    }
    if (patch.labelIds !== undefined) setLabels(id, patch.labelIds)
  })
  tx()
  return getTask(id)!
}

export function deleteTask(id: string): void {
  const res = db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
  if (res.changes === 0) throw new HttpError(404, 'Task not found')
}

function setLabels(taskId: string, labelIds: string[]): void {
  db.prepare('DELETE FROM task_labels WHERE task_id = ?').run(taskId)
  const insert = db.prepare('INSERT OR IGNORE INTO task_labels (task_id, label_id) VALUES (?, ?)')
  for (const lid of labelIds) insert.run(taskId, lid)
}

export function addComment(taskId: string, authorId: string, body: string): Comment {
  if (!getTask(taskId)) throw new HttpError(404, 'Task not found')
  const text = (body ?? '').trim()
  if (!text) throw new HttpError(400, 'Comment cannot be empty')
  const id = nanoid(12)
  db.prepare(
    'INSERT INTO comments (id, task_id, author_id, body, created_at) VALUES (?, ?, ?, ?, ?)',
  ).run(id, taskId, authorId, text, now())
  // touch the task so boards re-sort if needed
  db.prepare('UPDATE tasks SET updated_at = ? WHERE id = ?').run(now(), taskId)
  return listComments(taskId).find((c) => c.id === id)!
}

/* ------------------------------- errors ------------------------------- */

export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}
