# CareerPilot

AI-powered, CLI-agnostic job-search pipeline: track applications, evaluate offers, generate tailored CVs, scan job portals, and run batch evaluations — all driven from your AI coding CLI.

## What it does

- **Evaluate offers** — paste a job URL or description and get a scored fit report.
- **Tailored CVs** — generate role-specific CVs as PDF (HTML or LaTeX templates).
- **Portal scanning** — zero-token scanners for Greenhouse, Ashby, Lever, Workday, and more.
- **Pipeline tracking** — a single tracker for every application, its status, and its report.
- **Batch processing** — fan out evaluations across many postings at once.
- **Interview prep** — company research, STAR story bank, and practice/debrief flows.

## Getting started

1. Open this folder in your AI coding CLI (Claude Code, Cursor, Codex, OpenCode, Qwen, Copilot, etc.).
2. On first run the assistant walks you through onboarding — CV, profile, target roles, and portals.
3. Then just paste a job URL to evaluate it, or ask to run a scan.

Key files you own:

| File | Purpose |
|------|---------|
| `cv.md` | Your canonical CV (source of truth) |
| `config/profile.yml` | Name, location, target roles, comp targets |
| `portals.yml` | Companies and search keywords to scan |
| `data/applications.md` | Application tracker |
| `reports/` | Generated evaluation reports |
| `output/` | Generated CVs and PDFs |

## How it works

The assistant reads project instructions from `AGENTS.md` (and `CLAUDE.md`), your profile and CV, then runs the appropriate mode from `modes/`. Personalization lives in your own files (`cv.md`, `config/profile.yml`, `modes/_profile.md`, `modes/_custom.md`) so the tooling can be updated without overwriting your data.

See `AGENTS.md` for the full command list and `DATA_CONTRACT.md` for which files are yours versus system-managed.

## License

See [LICENSE](LICENSE).
