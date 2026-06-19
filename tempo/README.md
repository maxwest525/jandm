# Tempo

A lightweight team task manager — a Linear/Trello hybrid. Multiple projects, each
with a Kanban board; smooth drag-and-drop with optimistic updates that persist to a
real database; rich task details with comments; a ⌘K command bar; filtering, sorting,
search; and a cross-project **My Work** view.

Full-stack and self-contained: **Express + SQLite** on the back end, **React +
TypeScript + Vite + Tailwind** on the front end. No external services, no API keys.

**Now with** email/password auth and roles (Owner / Member / Viewer), a per-project
activity feed, a mobile-first board, and a persisted dark/light theme.

## Sign in

The app starts at a login screen. Every demo account uses the password **`tempo`**:

| Account | Email | Role | Can edit? |
|---|---|---|---|
| Maya Chen | `maya@tempo.dev` | **Owner** | yes |
| Sam Rivera | `sam@tempo.dev` | **Member** | yes |
| Priya Patel | `priya@tempo.dev` | **Viewer** | no (read-only) |

One-click buttons on the login screen sign you in as any of them. Sessions are
cookie-based (httpOnly); sign out from the sidebar.

## Run it

```bash
npm install
npm run dev
```

- API → http://localhost:4000
- App → **http://localhost:5174** (open this)

`npm run dev` starts the API and the Vite client together (via `concurrently`); the
client proxies `/api` to the server. On first boot the server creates a SQLite
database at `server/data/tempo.db` and seeds it with realistic data (6 users, 3
projects, ~38 tasks, labels, and comments).

Other scripts:

```bash
npm run seed        # wipe and re-seed the database from scratch
npm run build       # type-check + build the client to dist/
npm start           # production: serve the built client from the API (PORT=4000)
npm run typecheck   # tsc --noEmit
```

> Requires Node 18+. Tested on Node 22.

## What’s in it

- **Auth & roles** — email/password sign-in with cookie sessions; **Owner**,
  **Member**, **Viewer**. Viewers get a read-only app (no drag, no inline edits,
  no comments); the server enforces it (writes return `403`), the UI reflects it.
- **Activity feed** — per project, recording task creates, moves (from → to),
  field edits, comments, and deletes — grouped by day, click-through to the task.
- **Mobile-first board** — on phones the Kanban becomes tab-switched single
  columns with a touch-friendly **Move** menu; the desktop drag board stays.
- **Boards** — Backlog / In Progress / In Review / Done, per project.
- **Drag-and-drop** (`@dnd-kit`) — move and reorder cards across columns; pointer
  **and** keyboard accessible (focus a card’s grip, space to lift, arrows to move).
  Updates apply instantly and persist; on a server error they roll back.
- **Task panel** (`?task=<id>` — deep-linkable) — inline-editable title/description,
  status, priority, assignee, due date, labels, and a comment thread.
- **Command bar** (⌘K / Ctrl-K) — jump to any project or My Work, create a task in
  any project, or fuzzy-search loaded tasks.
- **Filter / sort / search** — by assignee, priority, label, text; sort by manual
  order, priority, due date, newest, or title.
- **My Work** — every task assigned to the current user, grouped by status across
  all projects.
- **States** — real loading skeletons, empty states, and error + retry everywhere
  data is involved.
- **Polish** — dark/light themes (persisted), responsive down to mobile, tasteful
  motion, ARIA roles, and visible focus styles throughout.

## Project structure

```
server/                 Express API + SQLite (better-sqlite3)
├── index.ts            app wiring, auth middleware, write-guard, error handling
├── db.ts               connection + schema (+ migration for auth columns/tables)
├── auth.ts             password hashing, sessions, cookies, role middleware
├── repo.ts             data access (typed queries, position math, activity logging)
├── seed.ts             deterministic seed data (+ activity history, credentials)
└── routes/             auth · projects · tasks · meta

src/                    React client
├── api/                fetch client + React Query hooks (queries + optimistic mutations) + auth
├── store/              AppData (bootstrap + canEdit/auth gate), Theme, CommandBar
├── hooks/              task panel (URL), filters, outside-click, media-query
├── lib/                constants (status/priority meta), formatting
├── components/         ui/ · board/ (Board + MobileBoard) · task/ · command/
│                       · activity/ · auth/ · states/ · layout
└── views/              BoardView (Board/Activity tabs) · MyWorkView · NotFoundView
```

## Part B — what had to be restructured

Absorbing auth, activity, mobile, and dark mode without breaking Part A took four
focused changes:

1. **Auth is a thin layer, not a rewrite.** `server/auth.ts` adds scrypt password
   hashing, a `sessions` table, and cookie + role middleware. The DB change is a
   real **migration** (`ALTER TABLE users ADD COLUMN role/password_hash` guarded by
   `PRAGMA table_info`, plus `ensureCredentials()` backfill), so an existing Part A
   database upgrades in place. `bootstrap` now returns the **session** user instead
   of a hardcoded one, and a single `writeGuard` middleware blocks Viewer mutations
   server-side. On the client, `AppDataProvider` became the auth gate: a `401`
   renders the login screen, and it now exposes a `canEdit` flag the UI reads.
2. **Activity is a write-side concern.** Mutating repo functions gained an
   `actorId` and emit rows to an `activity` table (moves diff old→new status; edits
   record changed fields). The feed is just another React Query resource,
   invalidated by the same `settleTasks` the board mutations already used — so it
   stays live with no extra plumbing.
3. **Mobile didn’t fork the data, only the presentation.** A `useMediaQuery` hook
   picks `MobileBoard` (tab-switched columns + a touch **Move** menu) vs the desktop
   drag `Board`. Both render the same `TaskCard` and drive the same optimistic
   `useUpdateTask`, so behavior is identical across form factors.
4. **Read-only fell out of `canEdit`.** Rather than scatter role checks, the board
   splits into `Board` (drag) and `ReadOnlyBoard` (static) and the task panel,
   toolbar, command bar, and mobile board all branch on the one `canEdit` flag.
5. **Dark mode** already existed from Part A (persisted theme context); Part B only
   added a pre-paint script in `index.html` to kill the light-theme flash.

## Architecture decisions (the one-paragraph version)

I split the app into a thin **Express + better-sqlite3** API and a React client, and
made **TanStack React Query the single source of truth for server state** — there’s
no parallel client store to drift out of sync. Optimistic updates live entirely in
the mutation layer: each mutation cancels in-flight fetches, snapshots every affected
cache (project boards, My Work lists, and the open task), applies the change to all of
them at once for an instant UI, rolls back from the snapshot on error, and invalidates
on settle so the server reconciles the truth (e.g. real task IDs/keys after a create,
or My Work membership after a reassignment). **Ordering uses fractional positions**
(drop = midpoint between neighbors), so a move is a single O(1) write with no
column-wide renumbering. The board keeps a small local copy of the columns *only*
during a drag — `@dnd-kit` drives cross-column movement live, and on drop it computes
the final status + position and hands off to the optimistic mutation, after which the
query cache becomes authoritative again. The **task panel is URL-driven** (`?task=`)
so details overlay any view and stay deep-linkable and back-button friendly, and the
whole **design system is CSS-variable tokens** surfaced to Tailwind, which is what
lets dark/light themes stay cohesive without per-component overrides.
