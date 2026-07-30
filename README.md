<div align="center">

# ✈️ CareerPilot

### Your AI copilot for the job hunt — evaluate, tailor, track, and apply with judgment.

Companies use AI to filter candidates. **CareerPilot gives candidates AI to _choose_ companies.**

<br>

![License](https://img.shields.io/badge/License-MIT-2ea44f?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)

<br>

**CLI-agnostic** · Runs on Claude Code, Codex, OpenCode, Qwen, Gemini/Antigravity, Grok, and more

</div>

---

## 🧭 What is CareerPilot?

CareerPilot turns any AI coding CLI into a full job-search command center. Instead of tracking applications in a scattered spreadsheet, you get an AI-powered pipeline that reads your CV, reasons about fit against each job description, and helps you spend your effort where it actually counts.

It is a **filter, not a firehose.** The point is to find the handful of roles worth your time out of hundreds — not to blast out generic applications. CareerPilot recommends *against* applying to anything scoring below **4.0 / 5**, because your time and the recruiter's are both worth respecting.

> [!IMPORTANT]
> **CareerPilot never submits anything for you.** It evaluates, ranks, tailors, and drafts — then stops. You review and make the final call every time. That human-in-the-loop design is the whole point.

---

## ✨ Features

| | Feature | What it does |
|---|---|---|
| 🚀 | **Auto-Pipeline** | Paste a URL or JD → full evaluation + tailored PDF + tracker entry, in one shot |
| 📊 | **6-Block Evaluation** | Role summary, CV match, level strategy, comp research, personalization, interview prep — plus a legitimacy check that flags scams and ghost jobs |
| 📄 | **ATS-Ready PDFs** | Keyword-aware CVs tailored per listing, with a clean Space Grotesk + DM Sans design |
| ✉️ | **Cover Letters & Emails** | Research-backed cover letters and formal application emails — draft-only, never auto-sent |
| 🎯 | **Portal Scanner** | 45+ companies pre-configured across Greenhouse, Ashby, Lever & Wellfound — zero token cost |
| 🗣️ | **Interview Story Bank** | Accumulates STAR + Reflection stories across evaluations into 5–10 reusable master answers |
| 💬 | **Contact Discovery** | Finds the hiring manager, recruiter, or team peer and drafts a ≤300-char LinkedIn message |
| ⚡ | **Batch Processing** | Evaluate 10+ offers in parallel with headless CLI workers |
| 🖥️ | **Dashboard TUI** | A terminal UI to browse, filter, and sort your pipeline |
| 🔒 | **Pipeline Integrity** | Automated merge, dedup, status normalization, and health checks |
| 🧑‍✈️ | **Human-in-the-Loop** | AI recommends; you decide. Nothing is ever submitted without you |

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install
npx playwright install chromium   # only needed for PDF generation

# 2. Check your setup
npm run doctor                    # validates all prerequisites

# 3. Configure
cp config/profile.example.yml config/profile.yml   # your details
cp templates/portals.example.yml portals.yml        # companies to scan

# 4. Add your CV as cv.md in the project root (markdown)

# 5. Open your AI CLI in this directory
claude   # or codex / opencode / qwen / agy / grok
```

**On first launch, CareerPilot walks you through setup — your CV, profile, and target roles — just by chatting. Nothing to edit by hand.**

Then let the CLI adapt the system to you:

```text
"Change the archetypes to backend engineering roles"
"Add these 5 companies to portals.yml"
"Update my profile with the CV I'm pasting"
```

> [!TIP]
> CareerPilot is designed to be customized by the AI CLI itself. It reads the same files it uses, so it knows exactly what to edit. Modes, archetypes, scoring weights, negotiation scripts — just ask.

---

## 🛠️ Usage

CareerPilot uses a shared command router. In CLIs that register slash commands:

```
/career-ops                → Show all available commands
/career-ops {paste a JD}   → Full auto-pipeline (evaluate + PDF + tracker)
/career-ops scan           → Scan portals for new offers
/career-ops pdf            → Generate an ATS-optimized CV
/career-ops cover          → Cover letter generator
/career-ops email          → Formal application email draft (draft-only)
/career-ops batch          → Batch evaluate multiple offers
/career-ops tracker        → View application status
/career-ops apply          → Fill application forms with AI (you submit)
/career-ops contacto       → Find the right person + draft a LinkedIn message
/career-ops deep           → Structured 6-axis company research prompt
```

Or just paste a job URL or description directly — CareerPilot auto-detects it and runs the full pipeline. In CLIs without slash commands (e.g. Codex), ask for the same mode names in plain language.

### Codex

Codex doesn't guarantee slash commands, so drive the same modes with plain-language prompts (see [CODEX.md](CODEX.md) for the full guide):

```bash
codex                                                          # interactive
codex exec "Evaluate this JD with career-ops auto-pipeline: <url>"
codex exec "Run career-ops scan mode and summarize new matches."
```


---

## 🔄 How It Works

```
        You paste a job URL or description
                     │
                     ▼
        ┌──────────────────────┐
        │  Archetype Detection  │   Classifies the role type
        └───────────┬──────────┘
                     │
        ┌───────────▼──────────┐
        │   A–F Evaluation      │   Match · gaps · comp · STAR stories
        │   (reads your cv.md)  │   (reasoning, not keyword matching)
        └───────────┬──────────┘
                     │
             ┌───────┼───────┐
             ▼       ▼       ▼
          Report    PDF    Tracker
           .md      .pdf    .tsv
```

> [!NOTE]
> **The first evaluations won't be great — the system doesn't know you yet.** Feed it your CV, your story, your proof points, and your preferences. Think of it as onboarding a new recruiter: the first week they learn about you, then they become invaluable.

---

## 🖥️ Dashboard TUI

Browse your pipeline visually from the terminal:

```bash
npm run serve:dashboard   # launch the TUI
npm run build:dashboard   # optional: build the standalone binary
```

6 filter tabs · 4 sort modes · grouped/flat view · lazy-loaded previews · inline status changes.

---

## 📁 Project Structure

```
CareerPilot/
├── AGENTS.md                # Canonical agent instructions (all CLIs)
├── CLAUDE.md                # Claude Code wrapper (imports AGENTS.md)
├── cv.md                    # Your CV (create this)
├── config/
│   └── profile.example.yml  # Template for your profile
├── modes/                   # Skill modes (evaluate, pdf, scan, batch, ...)
├── templates/
│   ├── cv-template.html     # ATS-optimized CV template
│   ├── portals.example.yml  # Scanner config template
│   └── states.yml           # Canonical statuses
├── dashboard/               # Go TUI pipeline viewer
├── data/                    # Your tracking data (gitignored)
├── reports/                 # Evaluation reports (gitignored)
└── output/                  # Generated PDFs (gitignored)
```

---

## 🧰 Tech Stack

- **Agent** — any AI coding CLI, via shared skills & modes (`AGENTS.md` + CLI wrapper)
- **PDF** — Playwright + HTML template
- **Scanner** — Playwright + ATS APIs (Greenhouse / Ashby / Lever) + web search
- **Dashboard** — Go + Bubble Tea + Lipgloss
- **Data** — Markdown tables + YAML config + TSV batch files

---

## ⚖️ Disclaimer

**CareerPilot is a local, open-source tool — not a hosted service.**

- **You control your data.** Your CV and personal info stay on your machine and go directly to the AI provider you choose. Nothing is collected or stored by this tool.
- **You control the AI.** Prompts instruct the AI not to auto-submit, but models can behave unpredictably. Always review generated content before submitting.
- **You comply with third-party ToS.** Use responsibly with the career portals you interact with. Do not spam employers.
- **No guarantees.** Evaluations are recommendations, not truth. The authors are not liable for employment outcomes.

---

## 📜 License & Credits

Licensed under the [MIT License](LICENSE).

CareerPilot is a fork of the open-source **career-ops** project, originally created by [Santiago Fernández de Valderrama Aparicio](https://santifer.io). The original architecture, evaluation logic, and scoring design are his work, used and adapted here under the MIT License.

<div align="center">
<br>
<sub>Built for people who'd rather choose than be filtered.</sub>
</div>
