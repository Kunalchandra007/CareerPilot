# CareerPilot Web — Progress

## v0.3.0 — current

### Completed

- **CareerPilot rebrand** — app shell, layout metadata, and inbox labels updated from career-ops to CareerPilot
- **Glassmorphism UI** — `.glass`, `.glass-strong`, `.dot-bg` utilities added to `globals.css`; premium light-theme polish across surfaces
- **Zero-CLI CV Fit** — `/api/cv-fit` route: fetches JD, runs `jd-skill-gap.mjs`, returns skill gap + LaTeX template. `QuickEvaluate` component shows results inline with copy/download for LaTeX
- **Evaluate mode wiring** — paste-URL box detects CLI presence: CLI → full AI evaluation via job worker; no CLI → CV Fit fallback. `CostBadge` reflects the active path
- **Paste-any-URL box** — always visible on Today dashboard; accepts LinkedIn, Naukri, Indeed, and any `https://` URL
- **Scan scheduling UI** — `ScanScheduler` component (days picker + time input) persisted to localStorage via `scan-schedule.ts`; surfaced in Today hero section
- **Scan now button** — wired to `/api/scan` (company-first `scan.mjs`, 0 tokens); streams NDJSON progress; refreshes inbox on completion
- **Duplicate render fix** — removed duplicate `CvDiffSection` render in `report-view.tsx`
- **Production build** — `tsc --noEmit` clean; `npm run build` passes (Turbopack, Next.js 16.2.10)

### Known issues / warnings

- Turbopack NFT warning on `next.config.mjs` / `api/version/route.ts` — cosmetic, does not affect build or runtime

---

## Backlog

- Desktop launcher (`Career-Ops.bat` + `Career-Ops.vbs` + `install-shortcut.ps1`) — one-click open without a terminal
- Safe cleanup of translated READMEs and community docs (pending user confirmation of exact list)
- Onboarding flow polish for first-run state
- Mobile nav improvements
