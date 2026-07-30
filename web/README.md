# CareerPilot — web UI for career-ops

A local-first dashboard that reads and writes the same files the CLI uses. No separate database, no cloud account, no parallel engine. If you never run it, your CLI workflow is unchanged.

## Quick start

Requires Node 20+.

```bash
cd web
npm ci
npm run build
npm run start        # production (fast)
# or
npm run dev          # dev server with hot reload
```

Open http://localhost:3000. Your existing CV, pipeline, and reports appear immediately.

## What's inside

| Screen | What it does |
|--------|-------------|
| **Today** | Action queue: follow-ups due + fresh scan matches + awaiting-decision roles. Scan now button (0 tokens). Paste any job URL to evaluate or get a zero-token CV Fit. |
| **Pipeline** | Sortable, filterable tracker table. Status changes write back through the core scripts. |
| **Explore** | Free reverse-ATS scan + AI-assisted discovery. |
| **CV** | Edit `cv.md` with live preview. Generate PDF. |
| **Analytics** | Funnel chart, score distribution, rejection patterns. |
| **Apply** | Assisted form prefill. Never auto-submits — you always press the button. |
| **Config** | CLI registration, profile settings, portal management. |

## Environment

By default the app resolves the career-ops root as `../` (its parent directory). To point it at a different checkout:

```bash
# web/.env.local
CAREER_OPS_ROOT=/path/to/other/career-ops
```

## Development

```bash
npm run dev          # Turbopack dev server
npm run typecheck    # tsc --noEmit
npm run build        # production build
npm test             # unit tests
```

## Safety

- **Local-first** — runs entirely on your machine. No cloud, no account.
- **Never auto-submits** — the apply flow drafts and prefills; submitting is always a human action.
- **Additive** — isolated from the core's CI and release automation. The CLI works identically without it.
