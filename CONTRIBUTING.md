# Contributing to CareerPilot

Thanks for your interest in contributing! CareerPilot is an open-source project and contributions of all sizes are welcome — bug fixes, new scanner providers, docs, translations, and features.

## Before Submitting a PR

**For a new feature, a new mode or command, or an architecture change, please open an issue first.** It saves you from investing time in something we'd have to redirect, and lets us align on direction before you write code.

**Going straight to a PR is welcome — no issue needed — for:** bug fixes, new zero-auth scanner providers, docs, and translations. Don't let process slow these down; these are the contributions we most want.

### What makes a good PR

- Fixes a bug listed in Issues
- Addresses a feature request that was discussed and approved
- Includes a clear description of what changed and why
- Follows the existing code style and project philosophy (simple, minimal, quality over quantity)

## Quick Start

1. Open an issue to discuss your idea
2. Fork the repo
3. Create a branch (`git checkout -b feature/my-feature`)
4. Make your changes
5. Test with a fresh clone (see [docs/SETUP.md](docs/SETUP.md))
6. Commit and push
7. Open a Pull Request referencing the issue

## What to Contribute

**Good first contributions:**

- Add companies to `templates/portals.example.yml`
- Translate modes to other languages
- Improve documentation
- Add example CVs for different roles (in `examples/`)
- Report bugs via Issues

**Bigger contributions:**

- New evaluation dimensions or scoring logic
- Dashboard TUI features (in `dashboard/`)
- New skill modes (in `modes/`)
- Script improvements (`.mjs` utilities)
- Web dashboard features (in `web/`)

## Guidelines

- Keep modes language-agnostic when possible
- Scripts should handle missing files gracefully (check `existsSync` before `readFileSync`)
- Dashboard changes require a build (`npm run build:dashboard`) — test with real data before submitting
- Don't commit personal data (`cv.md`, `profile.yml`, `applications.md`, `reports/`)

## What we do NOT accept

- **PRs that scrape platforms prohibiting automated access** (LinkedIn, etc.). We reject these to respect third-party ToS.
- **PRs that enable auto-submitting applications** without human review. CareerPilot is a decision-support tool, not a spam bot.
- **PRs that add external API dependencies** without prior discussion in an issue.
- **Integrations that send your data to a third-party service.** CareerPilot is local-first and zero-keys: your job-search data stays on your machine. Reading *public* job-listing APIs locally is welcome; routing your personal data through someone else's service is not.
- **PRs containing personal data** (real CVs, emails, phone numbers). Use `examples/` with fictional data instead.

## Development

```bash
# Scripts
npm run doctor                # Setup validation
node verify-pipeline.mjs      # Health check
node cv-sync-check.mjs         # Config check

# Dashboard (Go TUI)
npm run build:dashboard       # go build with platform-correct binary name
npm run serve:dashboard       # launch the TUI against the repo root

# Web dashboard
cd web && npm ci && npm run dev

# Tests
node test-all.mjs             # Full suite — run before pushing/opening a PR
node test-all.mjs --quick     # Full suite, skipping the dashboard build
```

**Adding a test for a new scanner provider:** add one file at
`tests/providers/{name}.test.mjs` — it's auto-discovered (`tests/**/*.test.mjs`),
no registration needed.

## License

Contributions to the codebase are governed by the MIT [LICENSE](LICENSE).

---

CareerPilot is built on top of [career-ops](https://github.com/santifer/career-ops) and inspired by its approach to job-search automation.
