# FlowBudget

A polished personal-budgeting dashboard. Track income and spending, watch your
cash flow, and stay on top of category budgets — all running locally with no
backend and no API keys.

![FlowBudget](public/favicon.svg)

## Highlights

- **Dashboard overview** — KPI cards (balance, monthly income, monthly expenses,
  savings rate) with month-over-month trend indicators.
- **Charts** — a spending-by-category donut and a 6-month income-vs-expenses
  cash-flow area chart (Recharts).
- **Transactions** — searchable, category-filterable, sortable table with
  pagination; responsive card layout on mobile; delete inline.
- **Add transaction** — accessible modal with a fully validated form
  (amount, date, category, description) that updates every chart instantly.
- **Budgets** — editable per-category monthly limits with live progress bars
  that recolor as you approach or exceed them.
- **Light / dark theme** — persisted to `localStorage` and applied before paint
  (no flash).
- **Real states** — genuine loading skeletons, empty states, and an error
  fallback.
- **Crafted UX** — cohesive token-driven color system, tabular-figure alignment,
  tasteful motion, keyboard/focus support, and ARIA roles throughout.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default http://localhost:5173).

```bash
npm run build     # type-check + production build to dist/
npm run preview   # preview the production build
```

> Requires Node 18+.

## How data works

- On first load the app **seeds ~6 months of realistic transactions** (recurring
  paychecks, rent, subscriptions, groceries, dining, transport, and more) so
  every screen looks alive immediately.
- All changes — added/deleted transactions, edited budgets, and the theme — are
  **persisted to `localStorage`**. Nothing leaves your browser.
- Use **Reset sample data** (sidebar) to clear local storage and regenerate the
  seed.

## Project structure

```
src/
├── main.tsx                  # entry; wraps app in Theme + Data providers
├── App.tsx                   # layout shell + view routing (no router dep)
├── types.ts                  # domain model (Transaction, Budget, Category)
├── index.css                 # design tokens (CSS vars) + base styles
├── context/
│   ├── ThemeContext.tsx      # light/dark theme + persistence
│   └── DataContext.tsx       # transactions/budgets state, persistence, seeding
├── lib/
│   ├── categories.ts         # category palette + icons
│   ├── date.ts               # timezone-safe date helpers
│   ├── format.ts             # currency / date / percent formatting
│   ├── storage.ts            # localStorage wrapper (safe read/write)
│   ├── seed.ts               # deterministic mock-data generator + default budgets
│   └── analytics.ts          # KPIs, category breakdown, cash flow, budget progress
└── components/
    ├── ui/                   # Button, Card, Modal, Skeleton, EmptyState, …
    ├── layout/               # Sidebar, Header, MobileNav, Logo
    ├── dashboard/            # KPI cards, charts, overview composition
    ├── transactions/         # table + add-transaction modal
    └── budgets/              # editable budget bars + view
```

## Tech

React 18 · TypeScript · Vite · Tailwind CSS · Recharts · lucide-react.

The color system is driven by CSS custom properties in `src/index.css` and
surfaced to Tailwind as semantic tokens (`bg-surface`, `text-muted`,
`text-brand`, `text-positive`, …) in `tailwind.config.js`, so light and dark
themes stay perfectly in sync. Category colors live in `src/lib/categories.ts`.
