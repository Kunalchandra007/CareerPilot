# CLAUDE.md — CareerPilot web/

Instructions for working in this directory. Read alongside the root `AGENTS.md`.

## What this is

`web/` is a Next.js 16 (App Router) local-first dashboard for career-ops. It reads and writes the same files the CLI uses. It lives inside the career-ops checkout; the career-ops root is always `../` (or `CAREER_OPS_ROOT` env var).

## Key files

| File | Purpose |
|------|---------|
| `src/lib/career-ops.ts` | Root resolution, all file parsers, memory read/write |
| `src/lib/scan-schedule.ts` | localStorage scan schedule type + helpers |
| `src/app/api/scan/route.ts` | Streams `scan.mjs` as NDJSON (0 tokens) |
| `src/app/api/cv-fit/route.ts` | Zero-CLI CV Fit: fetches JD → `jd-skill-gap.mjs` → skill gap + LaTeX |
| `src/components/home/today-dashboard.tsx` | Today view: scan button, follow-ups, decisions, fresh matches |
| `src/components/quick-evaluate.tsx` | Paste-URL box: CLI → full evaluate; no CLI → CV Fit |
| `src/components/home/scan-scheduler.tsx` | Days + time picker, persisted to localStorage |

## Build

```bash
npm ci              # install deps
npm run build       # production build (Turbopack)
npm run dev         # dev server
npm run typecheck   # tsc --noEmit
```

## Critical conventions

**Script paths** — never pass a literal `.mjs` filename as the first argument to `spawn`. Turbopack statically traces string literals as module imports and fails the build. Always use `rootScript(name)` from `@/lib/career-ops` or build the path with string concatenation:
```ts
// ✅ correct
const script = path.join(root, ["jd-skill-gap", "mjs"].join("."));
// ❌ breaks build
spawn("node", ["jd-skill-gap.mjs"], { cwd: root });
```

**Atomic writes** — all file writes must go through `atomicWrite` from `@/lib/core/safe-write`. Never `fs.writeFileSync` directly to a user data file.

**Never auto-submit** — the apply flow (`/api/apply/*`) drafts and prefills only. No route may click Submit/Send/Apply on behalf of the user.

**Source of truth** — user-facing content (CV, cover letters, form answers) is generated only from the files listed in the root `AGENTS.md` source-of-truth boundary. Do not invent facts not present in those files.

**Data contract** — never write user-specific content (archetypes, narrative, proof points) to `modes/_shared.md`. User customizations go to `modes/_profile.md` or `config/profile.yml`.

## Docs

- [docs/API.md](docs/API.md) — all API routes
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — system design, data flow, component map
- [docs/PROGRESS.md](docs/PROGRESS.md) — what's done, what's next
