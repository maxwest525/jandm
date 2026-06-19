# CLAUDE.md — Xerox Bot / APEX Trading Dashboard

Guidance for AI assistants working in this repo. Part 1 documents **this
codebase**; Part 2 is the standard operating core carried over from the
`maxwest525/ClaudeMD` guide. Read both before making changes.

---

## Part 1 — This repository

### What it is

A self-contained, front-end-only **trading dashboard** ("Xerox Bot — APEX
Trading System"). Dark terminal aesthetic, neon green/red accents. All data is
**mocked** — there is no backend, no broker connection, and no real trading. UI
state lives in React; the only persistence is browser **IndexedDB** (Knowledge
tab file storage).

### Stack

- **React 19** + **TypeScript** (strict mode)
- **Vite 6** (dev server + bundler), dev server on **`0.0.0.0:5000`**
- **Tailwind CSS 4** via the `@tailwindcss/vite` plugin (no `tailwind.config.js`
  — theme tokens are declared in CSS with `@theme`)
- **lucide-react** for icons
- No router, no state library, no test framework, no linter configured

### ⚠️ Top gotcha — the repo layout is currently broken

The **canonical source tree ships inside `jandm-repo.zip`**, not in the working
tree. The zip contains the real, working layout under `src/`:

```
src/
├── main.tsx, App.tsx, index.css, vite-env.d.ts
├── context/UIContext.tsx
├── types/index.ts
├── data/mockData.ts
└── components/
    ├── layout/   (Sidebar, TopNav, KillSwitchModal)
    └── secret/   (XeroxBotDashboard + 9 tab components)
public/favicon.svg
index.html, package.json, vite.config.ts, tsconfig.json
```

The **root-level files** (`App.tsx`, `main.tsx`, `index.css`) are flattened
copies that **do not run**: `App.tsx` imports `./context/UIContext` and
`./components/...` which exist only under `src/`. Meanwhile `index.html` loads
`/src/main.tsx` and `tsconfig.json` has `"include": ["src"]`. So:

> **Before doing any feature work, reconstitute the real tree:** extract
> `jandm-repo.zip` so the `src/` directory exists, or move the root files into
> `src/`. Do not edit the root-level `App.tsx`/`main.tsx`/`index.css` expecting
> them to take effect — they won't. Confirm the live layout (zip vs. extracted
> `src/`) before changing imports, and flag this to the user if it's still
> unresolved.

All paths below describe the intended `src/` layout from the zip.

### Architecture

- **Entry:** `src/main.tsx` → `<StrictMode>` → `App` → renders into `#root`.
- **`App.tsx`** wraps everything in `UIProvider` and lays out a fixed 220px
  `Sidebar`, a `TopNav`, the `XeroxBotDashboard` content area, and a global
  `KillSwitchModal`.
- **Global UI state:** `src/context/UIContext.tsx` — a single React Context
  holding `activeTab` (which view is shown) and `killSwitchOpen` (modal). Access
  it with the `useUI()` hook; it throws if used outside `UIProvider`.
- **Tab routing is manual** (no router): `XeroxBotDashboard.tsx` maps the
  `activeTab` string to a tab component via a `Record<string, ComponentType>`
  and renders the match (falling back to `DashboardTab`).
- **Tabs** live in `src/components/secret/`:
  `DashboardTab`, `TradesTab`, `BacktestTab`, `StrategiesTab`, `ConnectionsTab`,
  `KnowledgeTab`, `NewsTab`, `ScraperTab`, `YoloTab`.
- **Types** are centralized in `src/types/index.ts` (`Position`, `Strategy`,
  `Trade`, `RiskLimit`, the `SecretTab` union, and the `APEX_RISK` constants).
- **Mock data** is centralized in `src/data/mockData.ts` (positions, strategies,
  trades, risk limits, equity-curve series). Tabs import from here — keep
  fixtures in this one file, don't scatter them.

### Conventions (match these when editing)

- **Styling is Tailwind utility classes inline**, referencing CSS variables for
  every color, e.g. `bg-[var(--color-surface)]`, `text-[var(--color-green)]`.
  The palette/fonts are defined once in `src/index.css` under `@theme` — **add
  or change colors there**, never hardcode hex in components.
- **Fonts:** sans = Outfit/DM Sans, mono = JetBrains Mono (loaded in
  `index.html`). Numbers, symbols, and P&L use `font-mono`.
- **Color semantics:** green = positive/LONG/active, red = negative/SHORT/kill,
  yellow = warning thresholds. P&L and progress bars switch color on sign or on
  a `>70%` (yellow) / `>90%` (red) threshold.
- **Components** are default-exported function components, hooks at the top,
  small local sub-components (e.g. `StrategyCard`, `EquityCurveSVG`) defined in
  the same file below the main export.
- **"Live" feel** comes from `setInterval` ticking mock values in `useEffect`
  (account value in `TopNav`, positions in `DashboardTab`). Always clear the
  interval in the effect cleanup.
- Charts are **hand-rolled inline SVG** (see `EquityCurveSVG` in
  `DashboardTab.tsx`) — no charting library. Follow that pattern for new charts.
- TypeScript is strict but `noUnusedLocals`/`noUnusedParameters` are **off** and
  `verbatimModuleSyntax` is **on** → import types with `import type { ... }`.

### Notable feature mechanics

- **Strategy Vault** (`StrategiesTab.tsx`): PIN-gated. The hardcoded PIN is
  **`1337`** (client-side only — this is a demo gate, not real security). Vault
  sub-tabs: Deep Dive and Risk Metrics are implemented; the rest render "Coming
  soon".
- **Knowledge base** (`KnowledgeTab.tsx`): the only real persistence. Uses
  **IndexedDB** (`openDB('xerox-kb', 1)`, object store `files`, keyPath `id`)
  via small promise-wrapped helpers (`getDB`/`getAllFiles`/`addFile`/
  `deleteFile`). Drag-and-drop upload, auto-tagging by extension, text-content
  preview, search across name/tags/content. Files get `crypto.randomUUID()` ids.
- **Kill switch** (`KillSwitchModal.tsx`): confirm modal; the actual "close all
  positions" logic is a stub (`// Kill logic would go here`).
- **APEX risk model** (`src/types/index.ts` → `APEX_RISK`): 2% max risk/trade,
  5% daily / 10% weekly drawdown, 3 max positions, 8 max daily trades, 0.7
  correlation, $2,500 min balance, $5,000 starting capital. These constants and
  `mockRiskLimits` drive the risk bars on the Dashboard and Vault.
- `ScraperTab` and `NewsTab`/`BacktestTab`/`ConnectionsTab`/`YoloTab`/`TradesTab`
  range from fully built to placeholder — check the component before assuming a
  feature is wired up.

### Commands

```bash
npm install      # install deps
npm run dev      # Vite dev server → http://localhost:5000
npm run build    # tsc -b (typecheck) + vite build → dist/
npm run preview  # serve the production build
```

- **Type-check / build** with `npm run build` — there is no separate `lint` or
  `test` script. `npm run build` runs `tsc -b` first, so a type error fails the
  build; treat a clean build as the success signal for changes.
- Output goes to `dist/` (gitignored); deploy as a static site.

---

## Part 2 — Standard operating core

Carried over from `maxwest525/ClaudeMD`. These are the always-on behavioral
rules; apply them on top of the project specifics above.

### Think before coding
- State assumptions explicitly. If a request has multiple reasonable readings,
  surface them and pick one — say which — rather than guessing silently.
- When something is unclear or inconsistent, stop and name what's confusing
  instead of running ahead on a wrong premise.
- Push back when warranted. If there's a simpler approach or a real tradeoff,
  say so before implementing.

### Simplicity first
- Write the minimum code that solves the problem. Nothing speculative.
- No features, abstractions, configurability, or error handling that weren't
  asked for and aren't needed.
- If 200 lines could be 50, write the 50.

### Surgical changes
- Touch only what the task requires. Match the surrounding style and idiom.
- Don't refactor, rename, or "improve" adjacent code that isn't broken.
- Clean up only the mess your change introduced; leave pre-existing dead code
  alone unless removing it is the task.

### Goal-driven execution & verification
- Convert vague asks into runnable success criteria, then loop until they pass.
- Prefer evidence over assertion: show the command and its result (here, a clean
  `npm run build` and/or the running dev server).
- Fix root causes, not symptoms. Never suppress an error to make output green.

### Communication
- Be direct and concise. No filler, no flattery.
- Report faithfully: if the build fails, say so with the output; if you skipped
  a step, say that. State done work plainly without hedging.
- For irreversible or outward-facing actions (push, deploy, delete, send),
  confirm first unless explicitly authorized.

### Context & quality self-monitoring
- Never estimate your own token count or claim "fatigue" — defer to `/context`
  and the statusline as ground truth.
- Push heavy fan-out (codebase search, log triage) into subagents so their
  output never fills the main window.
- When context is heavy, say so and suggest `/compact` or `/clear` rather than
  silently degrading.

> For the full guide — memory hierarchy, token economics, subagents, hooks,
> loops/scheduling, and the curated skills list — see the
> [`maxwest525/ClaudeMD`](https://github.com/maxwest525/ClaudeMD) repo
> (`CLAUDE.md`, `global-CLAUDE.md`, `third-party-skills.md`).

# Compact instructions

When compacting, preserve: the current task and its success criteria; the
src/-vs-root layout gotcha and whether it's been resolved; decisions made and
why; file paths, commands, and approaches that worked; and unresolved bugs or
open questions. Drop: resolved tangents, raw search/log output, and superseded
attempts.
