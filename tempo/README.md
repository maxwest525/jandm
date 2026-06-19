# Tempo

A lightweight team task manager — a Linear/Trello hybrid. Multiple projects, each
with a Kanban board; smooth drag-and-drop with optimistic updates that persist to a
real database; rich task details with comments; a ⌘K command bar; filtering, sorting,
search; and a cross-project **My Work** view.

Full-stack and self-contained: **Express + SQLite** on the back end, **React +
TypeScript + Vite + Tailwind** on the front end. No external services, no API keys.

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
├── index.ts            app wiring, middleware, error handling, prod static serving
├── db.ts               connection + schema
├── repo.ts             data access (typed queries, position math, validation)
├── seed.ts             deterministic seed data
└── routes/             projects · tasks · meta (bootstrap/users/labels)

src/                    React client
├── api/                fetch client + React Query hooks (queries + optimistic mutations)
├── store/              AppData (bootstrap), Theme, CommandBar contexts
├── hooks/              task panel (URL), filters, outside-click
├── lib/                constants (status/priority meta), formatting
├── components/         ui/ · board/ · task/ · command/ · states/ · layout
└── views/              BoardView · MyWorkView · NotFoundView
```

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
