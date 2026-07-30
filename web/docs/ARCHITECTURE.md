# CareerPilot Web — Architecture

## Overview

CareerPilot is a local-first Next.js 16 (App Router) web UI that sits inside the career-ops checkout as `web/`. It reads and writes the same files the CLI uses — no separate database, no cloud sync, no parallel engine.

```
CareerPilot/              ← project root (careerOpsRoot())
├── cv.md                 ← canonical CV
├── data/
│   ├── applications.md   ← tracker (source of truth)
│   ├── pipeline.md       ← inbox of pending URLs
│   └── scan-history.tsv  ← scanner dedup + freshness dates
├── reports/              ← evaluation reports
├── config/profile.yml    ← user profile
├── modes/_profile.md     ← user targeting + web-assistant notes
├── portals.yml           ← scanner company list
└── web/                  ← this app
    ├── src/
    │   ├── app/          ← Next.js App Router pages + API routes
    │   ├── components/   ← React components
    │   └── lib/          ← server utilities + shared types
    └── ...
```

## Root resolution

`careerOpsRoot()` in [src/lib/career-ops.ts](src/lib/career-ops.ts) resolves the career-ops home:
1. `CAREER_OPS_ROOT` env var (set in `web/.env.local` for dev against a separate checkout)
2. `path.resolve(process.cwd(), "..")` — the parent of `web/` in production

`rootScript(nameNoExt)` builds absolute paths to core `.mjs` scripts (e.g. `scan.mjs`, `doctor.mjs`) using string concatenation rather than a literal `.mjs` suffix, so Turbopack doesn't try to resolve them as modules at build time.

## Data flow

```
File system (career-ops root)
        │
        ▼
  Server components / API routes   ← parse md/yml/tsv, spawn .mjs scripts
        │
        ▼
  React client components          ← render, user actions
        │
        ▼
  API routes (POST/DELETE)         ← write back via core scripts (set-status.mjs, etc.)
        │
        ▼
  File system (career-ops root)
```

The web app never writes files directly except through the core scripts. This keeps the CLI and web in sync automatically.

## Key libraries

| Path | Purpose |
|------|---------|
| [src/lib/career-ops.ts](src/lib/career-ops.ts) | Root resolution, file parsers (`readInbox`, `readApplications`, `pipelineSummary`, `readReport`), memory read/write into `modes/_profile.md` |
| [src/lib/explore.ts](src/lib/explore.ts) | `DiscoveredOffer` type + explore helpers |
| [src/lib/scan-schedule.ts](src/lib/scan-schedule.ts) | localStorage scan schedule (days, hour, minute, enabled) |
| [src/lib/clis.ts](src/lib/clis.ts) | CLI registration and detection |
| [src/lib/cv.ts](src/lib/cv.ts) | CV read/write helpers |
| [src/lib/core/](src/lib/core/) | Shared scan streaming, atomic write, safe-write utilities |

## Pages

| Route | Component | Data source |
|-------|-----------|-------------|
| `/` | `TodayDashboard` | `/api/pipeline`, `/api/followups`, `/api/whats-new` |
| `/pipeline` | `PipelineView` | `/api/pipeline` |
| `/pipeline/[id]` | Report + tracker row | `/api/report/shape?n=…` |
| `/explore` | Explore + scan | `/api/explore`, `/api/scan` |
| `/cv` | `CvEditor` | `/api/cv` |
| `/analytics` | Funnel + charts | `/api/pipeline` |
| `/apply` | Apply flow | `/api/apply/*` |
| `/config` | `ConfigForm` | `/api/profile`, `/api/clis`, `/api/portals` |
| `/jobs` | Jobs inbox | `/api/pipeline` |
| `/jobs/[id]` | Job detail | `/api/pipeline` |
| `/portals` | Portals manager | `/api/portals` |

## API routes

All routes are under `src/app/api/`. See [docs/API.md](API.md) for the full reference.

Notable patterns:
- **Streamed NDJSON** — `/api/scan` and `/api/explore/ai` stream events as newline-delimited JSON so the UI can show live progress.
- **Script spawning** — routes spawn core `.mjs` scripts via `node:child_process` `spawn` with `cwd: careerOpsRoot()`. Script paths are built with `rootScript()` to avoid Turbopack static-analysis errors.
- **Atomic writes** — all file writes go through `atomicWrite` (write to `.tmp`, then rename) to prevent corruption on crash.

## Component structure

```
src/components/
├── home/
│   ├── today-dashboard.tsx   ← main Today view (scan + follow-ups + decisions)
│   ├── scan-scheduler.tsx    ← localStorage scan schedule UI
│   ├── follow-up-card.tsx    ← single follow-up action card
│   └── decision-card.tsx     ← awaiting-decision role card
├── explore/
│   └── discovery-card.tsx    ← fresh match card
├── jobs/
│   └── job-store.tsx         ← client job-worker state (useJobs)
├── cost/
│   └── cost-badge.tsx        ← free/spend/premium badge
├── cv/                       ← CV editor + diff + preview
├── pipeline/                 ← tracker table + filters
├── apply/                    ← apply flow steps
├── quick-evaluate.tsx        ← paste-URL box (CV Fit or full evaluate)
├── app-shell.tsx             ← nav + layout wrapper
└── ...
```

## Styling

Tailwind CSS v4 with a custom design token layer in `src/app/globals.css`:
- CSS custom properties for `--color-brand`, `--color-surface`, `--color-border`, etc.
- Dark/light theme via `[data-theme="dark"]` selector
- Glassmorphism utilities: `.glass`, `.glass-strong`, `.dot-bg`
- `ThemeToggle` component persists preference to `localStorage`

## Build

```bash
npm run build    # Next.js Turbopack production build
npm run dev      # Turbopack dev server (hot reload)
npm run typecheck  # tsc --noEmit
```

The `.next/` output is gitignored. `node_modules/` is gitignored. Both are recreated by `npm ci && npm run build`.
