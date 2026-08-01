<div align="center">

# ✈️ CareerPilot

### Your AI co-pilot for the entire job search — from finding the role to landing the offer.

**Evaluate offers · Generate tailored CVs · Scan portals · Track your pipeline — all local-first, all yours.**

[![License: MIT](https://img.shields.io/badge/License-MIT-000000.svg?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Built for AI CLIs](https://img.shields.io/badge/Runs%20on-Any%20AI%20CLI-6E56CF?style=flat-square)](docs/SUPPORTED_CLIS.md)

</div>

---

## What is CareerPilot?

CareerPilot is an **AI-powered, local-first job-search pipeline**. It reads your CV, understands what you're looking for, and then does the tedious, high-leverage work of a great recruiter *on your side*: it scans job portals, scores every opening honestly, drafts tailored CVs and cover letters, and keeps a clean record of where every application stands.

It comes in two halves that share the exact same files — no database, no cloud sync, no lock-in:

| | |
|---|---|
| 🖥️ **The CLI pipeline** | Runs inside any AI coding CLI (Claude Code, Codex, Gemini, Qwen, OpenCode, Copilot, and more). You chat; it evaluates offers, writes reports, generates PDFs, and updates your tracker. |
| 🌐 **The Web dashboard** | A beautiful Next.js 16 app (`web/`) that reads and writes the same files. Paste a URL, watch a live scan stream in, review your funnel, and edit your CV — all in the browser. |

> Built and battle-tested by [santifer](https://santifer.io) to evaluate **740+ offers**, generate **100+ tailored CVs**, and land a **Head of Applied AI** role. The scoring, archetypes, and playbooks reflect a real, successful search.

**It works out of the box — but it's designed to be made yours.** Tell the agent *"change the archetypes to data-engineering roles"* and it rewrites your targeting. Your files, your rules.

---

## ✨ Highlights

- 🎯 **Honest six-dimension scoring** — every role gets one holistic 1.0–5.0 score, never a padded checklist. Below 4.0, it tells you *not* to apply.
- 🧠 **A–G evaluation reports** — a plain-English breakdown of the role, a requirement-by-requirement CV match, level strategy, comp research, personalization angles, interview prep, and a **scam / ghost-job legitimacy check**.
- 📄 **Tailored CVs & PDFs** — ATS-optimized, generated from *your* files via HTML or LaTeX/Overleaf templates. Keywords get reframed and emphasized — **never fabricated**.
- 🔍 **Zero-token portal scanning** — sweeps Greenhouse, Ashby, Lever, Workday, iCIMS and more via their public APIs, at **zero LLM cost**.
- 📊 **Full pipeline tracking** — a canonical tracker, funnel analytics, follow-up cadence, rejection-pattern analysis, and skill-gap maps.
- 🎤 **Interview prep** — company research, a STAR story bank, and plan / practice / debrief flows for real interviews.
- 🌍 **Multi-market modes** — localized evaluation for DACH, France, Middle East, Japan, Turkey, and India (13th-month pay, CDI/CDD, kıdem tazminatı, CTC vs. in-hand, and more).
- 🔒 **Local-first & private** — everything lives in plain Markdown, YAML, and TSV files on your machine. No account required.
- 🛡️ **Ethical by design** — it drafts and prefills, but **never clicks Submit** on your behalf. Quality over quantity, always.

---

## 🚀 Quick Start

### 1. Install the pipeline

```bash
npx @santifer/career-ops init
cd career-ops
```

Then open your AI CLI in the folder:

```bash
claude      # or codex / gemini / qwen / opencode / copilot / agy / grok
```

**On first launch, CareerPilot onboards you by chatting** — it asks for your CV, your details (name, target roles, salary), and sets up the scanner with 45+ pre-configured companies. Nothing to edit by hand.

Then just **paste a job URL or description** and watch it evaluate, report, generate a PDF, and track — end to end.

> 💡 Prefer no API key? CareerPilot runs fully on **Antigravity CLI's free tier** — see [docs/FREE_TIER.md](docs/FREE_TIER.md).

### 2. Launch the web dashboard (optional)

```bash
cd web
npm ci
npm run dev        # → http://localhost:3000
```

The dashboard reads the same career-ops files, so your CLI work and browser work stay perfectly in sync.

---

## 🖥️ The Web Dashboard

A local-first Next.js 16 (App Router) UI with a polished glassmorphism design, dark/light themes, and live-streaming progress.

| Page | What it does |
|------|--------------|
| **Today** `/` | Your command center — a paste-any-URL box, "Scan now" button, follow-ups due, and roles awaiting a decision. |
| **Pipeline** `/pipeline` | The full tracker with filters, per-role reports, and status controls. |
| **Explore** `/explore` | Run a zero-token scan and browse fresh matches as they stream in. |
| **CV** `/cv` | Edit your CV, preview it, diff against tailored versions, and export a PDF. |
| **Analytics** `/analytics` | Your funnel and conversion charts across the whole search. |
| **Apply** `/apply` | The guided apply flow — drafts and **prefills only**, never auto-submits. |
| **Config** `/config` | Profile, CLI detection, and portal management. |

**Under the hood:**
- **Streamed NDJSON** for live scan & AI progress
- **Atomic writes** (`write .tmp → rename`) so a crash never corrupts your data
- **Script spawning** — the web app never writes user data directly; it delegates to the same core `.mjs` scripts the CLI uses
- **Zero-CLI fallback** — no AI CLI installed? The `/api/cv-fit` route still gives you a skill-gap check and a LaTeX CV template

See [web/docs/ARCHITECTURE.md](web/docs/ARCHITECTURE.md) and [web/docs/API.md](web/docs/API.md) for the full picture.

---

## 🎯 How Scoring Works

Every posting is judged holistically across **six dimensions**, then rolled into a single score:

| Dimension | What it measures |
|-----------|------------------|
| **Match** | How well your CV maps to the role's real requirements — skills, seniority, domain. |
| **North-star alignment** | How far this role moves you toward the career goal you set — not just whether you *could* do it. |
| **Compensation** | The offer vs. market rate. When comp isn't published, it says so — it never invents a number. |
| **Cultural signals** | Team, values, and ways-of-working read out of the posting itself. |
| **Red flags** | Ghost-job, scam, and mismatch warnings. |
| **Overall** | The single holistic 1.0–5.0 judgment that ties it all together. |

Each evaluation produces a **report with blocks A–G**: role summary, CV-match table, level strategy, comp research, personalization plan, STAR interview prep, and posting-legitimacy check — saved to `reports/{num}-{company}-{date}.md`.

> **The 4.0 line:** below 4.0, the honest recommendation is *don't apply*. The bar is deliberately high — a handful of well-targeted applications beats a generic blast of fifty.

---

## 🔒 Two Core Guarantees

CareerPilot is opinionated about trust. Two rules are non-negotiable:

**1. Nothing is fabricated.** Every word written on your behalf — CVs, cover letters, form answers, outreach — comes *only* from your own files (`cv.md`, `config/profile.yml`, `modes/_profile.md`, writing samples) and what you say directly. Keywords get reordered and reframed, never invented. If a claim isn't backed by a source file, it asks you.

**2. Nothing is auto-submitted.** It fills forms, drafts emails, and generates PDFs — then **stops before Submit/Send/Apply**. You always make the final call.

---

## 🌍 Multi-Market Support

Targeting roles in another market? CareerPilot ships localized evaluation modes that understand local compensation and contract concepts:

| Market | Vocabulary it understands |
|--------|---------------------------|
| 🇩🇪 **DACH** | 13. Monatsgehalt, Probezeit, Kündigungsfrist, Tarifvertrag |
| 🇫🇷 **France / BE / CH** | CDI/CDD, SYNTEC, RTT, 13e mois, titres-restaurant |
| 🌐 **Middle East** | مكافأة نهاية الخدمة, التأمينات الاجتماعية, فترة التجربة |
| 🇯🇵 **Japan** | 正社員, 賞与, みなし残業, 年俸制 |
| 🇹🇷 **Turkey** | SGK, kıdem tazminatı, brüt/net maaş, BES |
| 🇮🇳 **India** | CTC vs. in-hand, PF/EPF, notice period/buyout, ESOPs |

Output language and market vocabulary are independent axes — write English reports with DACH comp concepts, or any combination you like.

---

## 🛠️ Tech Stack

**Pipeline:** Node.js (`.mjs`), Playwright (PDF rendering + scraping), YAML config, Markdown/TSV data, an optional Go TUI dashboard.

**Web:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Playwright Core · deployed on Vercel.

---

## 📁 Project Structure

```
CareerPilot/
├── cv.md                    # Your canonical CV (source of truth)
├── config/profile.yml       # Your identity, targets, salary, spend tier
├── modes/                   # Agent instructions per task (evaluate, apply, scan…)
│   ├── _profile.md          # ← your personalization lives here
│   └── de/ fr/ ja/ …        # Market-specific mode sets
├── portals.yml              # Scanner company & query config
├── data/
│   ├── applications.md      # The tracker (canonical)
│   ├── pipeline.md          # Inbox of pending URLs
│   └── scan-history.tsv     # Scanner dedup & freshness
├── reports/                 # Evaluation reports (A–G + score)
├── templates/               # CV HTML/LaTeX templates + canonical states
├── *.mjs                    # The pipeline scripts (scan, merge, verify, PDF…)
└── web/                     # The Next.js dashboard
    └── src/{app,components,lib}
```

**Two data layers (important):**
- **User layer** — your data. *Never* auto-updated. Personalization goes here (`cv.md`, `config/profile.yml`, `modes/_profile.md`, `data/*`, `reports/*`).
- **System layer** — the engine. Auto-updatable (`modes/_shared.md`, scripts, templates). System updates *never* touch your data.

See [DATA_CONTRACT.md](DATA_CONTRACT.md) for the full breakdown.

---

## 📚 Documentation

| Guide | |
|-------|--|
| [Setup](docs/SETUP.md) | Full install, commands, and verification |
| [Supported CLIs](docs/SUPPORTED_CLIS.md) | Every AI CLI it runs on |
| [Supported Job Boards](docs/SUPPORTED_JOB_BOARDS.md) | Portals the scanner covers |
| [Architecture](docs/ARCHITECTURE.md) | Runtime flows & pipeline integrity |
| [Web Architecture](web/docs/ARCHITECTURE.md) | The dashboard's design & data flow |
| [Web API Reference](web/docs/API.md) | Every dashboard API route |
| [Automation](docs/AUTOMATION.md) | Recurring scans via cron / Task Scheduler |
| [Customization](docs/CUSTOMIZATION.md) | Make it yours |
| [Free Tier](docs/FREE_TIER.md) | Run it at zero cost |
| [FAQ](docs/FAQ.md) | Common questions |

---

## 🤝 Contributing

Contributions are welcome! The flow: **open an issue → discuss → PR with a linked issue → CI passes → review → merge.** Every PR runs the full test suite via GitHub Actions.

See [GOVERNANCE.md](GOVERNANCE.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and [SECURITY.md](SECURITY.md).

---

## 📄 License

[MIT](LICENSE) © 2026 Santiago Fernández de Valderrama

<div align="center">

---

**CareerPilot** — because the best applications are the ones you *chose* to send.

*Quality over quantity. Your data, your machine, your call.*

</div>
