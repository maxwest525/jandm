import { nanoid } from 'nanoid'
import { db, initSchema, isEmpty } from './db'
import { ensureCredentials } from './auth'
import type { Priority, Status } from './types'

/* deterministic RNG so the seed is identical every fresh run */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const USERS = [
  { name: 'Maya Chen', email: 'maya@tempo.dev', initials: 'MC', color: '#7c74ff' },
  { name: 'Sam Rivera', email: 'sam@tempo.dev', initials: 'SR', color: '#3bb2f6' },
  { name: 'Priya Patel', email: 'priya@tempo.dev', initials: 'PP', color: '#f2913b' },
  { name: 'Diego Alvarez', email: 'diego@tempo.dev', initials: 'DA', color: '#43b581' },
  { name: 'Nora Schmidt', email: 'nora@tempo.dev', initials: 'NS', color: '#e35d9c' },
  { name: 'Theo Park', email: 'theo@tempo.dev', initials: 'TP', color: '#c98bf5' },
]

const PROJECTS = [
  { key: 'TEM', name: 'Tempo Web', color: '#7c74ff', description: 'The web app — boards, command bar, and core UX.' },
  { key: 'API', name: 'Platform API', color: '#3bb2f6', description: 'Backend services, data model, and integrations.' },
  { key: 'GRW', name: 'Growth', color: '#43b581', description: 'Onboarding, activation experiments, and analytics.' },
]

const LABELS = [
  { name: 'bug', color: '#ef4444' },
  { name: 'feature', color: '#43b581' },
  { name: 'design', color: '#e35d9c' },
  { name: 'infra', color: '#3bb2f6' },
  { name: 'performance', color: '#f59e0b' },
  { name: 'docs', color: '#94a3b8' },
  { name: 'research', color: '#c98bf5' },
]

const TASK_POOL: Record<string, string[]> = {
  TEM: [
    'Drag-and-drop reordering on the board',
    'Command bar: fuzzy task search',
    'Keyboard navigation for the Kanban columns',
    'Task detail side panel polish',
    'Empty states for new projects',
    'Optimistic updates for status changes',
    'Persist column collapse state',
    'Label picker multi-select',
    'Due-date quick presets (today, tomorrow)',
    'Avatar stack on dense cards',
    'Dark / light theme toggle',
    'Inline title editing on cards',
    'My Work cross-project aggregation',
    'Filter chips with active count',
    'Animate card entry and removal',
  ],
  API: [
    'Task position rebalancing endpoint',
    'Rate-limit the comments endpoint',
    'Add full-text search index for tasks',
    'Soft-delete with restore window',
    'Webhook events for task transitions',
    'Pagination for large boards',
    'Audit log for task edits',
    'Seed script idempotency',
    'GraphQL gateway spike',
    'Background job for due-date reminders',
    'Validation layer for task payloads',
    'Connection pooling tuning',
  ],
  GRW: [
    'Onboarding checklist component',
    'Activation funnel instrumentation',
    'Sample project template gallery',
    'Invite teammates flow',
    'Weekly digest email design',
    'In-app product tour',
    'Referral program research',
    'Pricing page A/B test',
    'Empty-board first-run experience',
    'Track command-bar adoption',
    'Re-engagement push copy',
  ],
}

const STATUS_WEIGHTS: [Status, number][] = [
  ['backlog', 0.4],
  ['in_progress', 0.22],
  ['in_review', 0.16],
  ['done', 0.22],
]

const PRIORITY_WEIGHTS: [Priority, number][] = [
  ['urgent', 0.1],
  ['high', 0.24],
  ['medium', 0.3],
  ['low', 0.22],
  ['none', 0.14],
]

const COMMENTS = [
  'Picking this up now — should have a draft by EOD.',
  'Left a couple of notes in the linked doc.',
  'Blocked on the API change, moving to review once that lands.',
  'Nice work, this feels much smoother than before.',
  'Can we scope this down for the first pass?',
  'Added tests for the edge cases we discussed.',
  'Design looks great — one tweak on the spacing.',
  'Confirmed this fixes the regression. Shipping.',
  'Pairing with Sam on this tomorrow morning.',
  'Bumping priority, this is on the critical path.',
]

function weighted<T>(rng: () => number, weights: [T, number][]): T {
  let r = rng()
  for (const [value, w] of weights) {
    if (r < w) return value
    r -= w
  }
  return weights[weights.length - 1][0]
}

function daysFromNow(n: number): string {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function seed(): void {
  const rng = mulberry32(0x7e_3f_01)
  const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]
  const ts = (offsetDays: number) => {
    const d = new Date()
    d.setDate(d.getDate() - offsetDays)
    return d.toISOString()
  }

  const tx = db.transaction(() => {
    const userIds = USERS.map((u) => {
      const id = nanoid(10)
      db.prepare('INSERT INTO users (id, name, email, initials, color) VALUES (?, ?, ?, ?, ?)').run(
        id,
        u.name,
        u.email,
        u.initials,
        u.color,
      )
      return id
    })

    const labelIds = LABELS.map((l) => {
      const id = nanoid(10)
      db.prepare('INSERT INTO labels (id, name, color) VALUES (?, ?, ?)').run(id, l.name, l.color)
      return id
    })

    const insertTask = db.prepare(
      `INSERT INTO tasks (id, project_id, seq, title, description, status, position, priority, assignee_id, due_date, created_at, updated_at)
       VALUES (@id, @project_id, @seq, @title, @description, @status, @position, @priority, @assignee_id, @due_date, @created_at, @updated_at)`,
    )
    const insertTaskLabel = db.prepare(
      'INSERT OR IGNORE INTO task_labels (task_id, label_id) VALUES (?, ?)',
    )
    const insertComment = db.prepare(
      'INSERT INTO comments (id, task_id, author_id, body, created_at) VALUES (?, ?, ?, ?, ?)',
    )
    const insertActivity = db.prepare(
      'INSERT INTO activity (id, project_id, task_id, actor_id, type, data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )

    PROJECTS.forEach((p, pIdx) => {
      const projectId = nanoid(10)
      db.prepare(
        'INSERT INTO projects (id, key, name, description, color, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      ).run(projectId, p.key, p.name, p.description, p.color, ts(60 - pIdx * 5))

      const positions: Record<Status, number> = {
        backlog: 1024,
        in_progress: 1024,
        in_review: 1024,
        done: 1024,
      }

      TASK_POOL[p.key].forEach((title, i) => {
        const id = nanoid(12)
        const status = weighted(rng, STATUS_WEIGHTS)
        const priority = weighted(rng, PRIORITY_WEIGHTS)
        const assignee = rng() > 0.12 ? pick(userIds) : null
        const created = ts(Math.floor(rng() * 45) + 2)
        const hasDue = rng() > 0.45
        const dueDate = hasDue ? daysFromNow(Math.floor(rng() * 24) - 6) : null

        insertTask.run({
          id,
          project_id: projectId,
          seq: i + 1,
          title,
          description:
            rng() > 0.35
              ? `${title}. ${pick([
                  'Keep the change focused and well-tested.',
                  'Coordinate with design before implementation.',
                  'Document the new behavior in the README.',
                  'Measure the impact before and after.',
                ])}`
              : '',
          status,
          position: positions[status],
          priority,
          assignee_id: assignee,
          due_date: dueDate,
          created_at: created,
          updated_at: created,
        })
        positions[status] += 1024

        const taskKey = `${p.key}-${i + 1}`
        insertActivity.run(
          nanoid(12),
          projectId,
          id,
          assignee ?? pick(userIds),
          'task_created',
          JSON.stringify({ taskKey, taskTitle: title }),
          created,
        )

        // 0–2 labels
        const nLabels = Math.floor(rng() * 2.6)
        const shuffled = [...labelIds].sort(() => rng() - 0.5)
        for (let l = 0; l < nLabels; l++) insertTaskLabel.run(id, shuffled[l])

        // comments on ~35% of tasks
        if (rng() > 0.65) {
          const n = 1 + Math.floor(rng() * 3)
          for (let c = 0; c < n; c++) {
            const cAuthor = pick(userIds)
            const cBody = pick(COMMENTS)
            const cTime = ts(Math.floor(rng() * 20))
            insertComment.run(nanoid(12), id, cAuthor, cBody, cTime)
            insertActivity.run(
              nanoid(12),
              projectId,
              id,
              cAuthor,
              'commented',
              JSON.stringify({ taskKey, taskTitle: title, excerpt: cBody }),
              cTime,
            )
          }
        }
      })
    })
  })

  tx()
}

export function seedIfEmpty(): void {
  if (isEmpty()) seed()
}

// `npm run seed` — wipe and reseed from scratch.
function reseed(): void {
  initSchema()
  db.exec(
    'DELETE FROM activity; DELETE FROM sessions; DELETE FROM comments; DELETE FROM task_labels; DELETE FROM tasks; DELETE FROM labels; DELETE FROM projects; DELETE FROM users;',
  )
  seed()
  ensureCredentials()
  console.log('Reseeded Tempo database.')
}

if (process.argv.includes('--reseed')) {
  reseed()
}
