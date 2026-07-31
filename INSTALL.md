# Install CareerPilot

CareerPilot is a **local-first, single-user** job-search dashboard. It runs entirely on your own computer — your CV, your applications, and your reports never leave your machine. There is **no cloud account, no server to sign into, and nothing to pay for.**

> **CareerPilot is a fork of [santifer/career-ops](https://github.com/santifer/career-ops)** (MIT). All credit for the original system, scoring model, and methodology goes to the upstream author. See the main [README](README.md) for the full story and feature list.

---

## What you need (one-time)

1. **Node.js 18 or newer** — download the **LTS** build from <https://nodejs.org/> and install it. That's the only prerequisite. The launcher checks for it and will tell you if it's missing.
2. **Windows** — the one-click launcher (`CareerPilot.bat`) is Windows-only. On macOS/Linux you can still run the app manually (see [Manual start](#manual-start-any-os)).

You do **not** need to install anything else by hand — the launcher installs the app's dependencies for you on first run.

---

## Install in 4 steps (Windows)

```text
1. Install Node.js LTS from https://nodejs.org  (skip if you already have it)

2. Download this project:
   • Green "Code" button ▸ Download ZIP,  then unzip anywhere
     (e.g. C:\CareerPilot),  OR
   • git clone https://github.com/Kunalchandra007/CareerPilot.git

3. Open the unzipped folder and double-click:  CareerPilot.bat

4. The first run installs dependencies and builds the app (a few minutes,
   one time only), then your browser opens to  http://localhost:3000
```

That's it. Every later launch just starts the server and opens the dashboard — no build wait.

> **Tip — a real desktop app feel:** run `install-shortcut.ps1` once (right-click ▸ *Run with PowerShell*) to put a **CareerPilot** icon on your Desktop that launches the dashboard silently, no console window.

---

## First launch — setup wizard

The app walks you through setup the first time. You'll add:

- **Your CV** — paste it, paste a LinkedIn URL, or describe your experience and it drafts one.
- **Your profile** — name, email, location, target roles, salary range.
- **Portals** (optional) — the companies/boards the scanner watches.

Your answers are saved to files **on your machine only**:

| File | What it holds |
|------|----------------|
| `cv.md` | Your CV (source of truth) |
| `config/profile.yml` | Your profile + targeting |
| `portals.yml` | Companies the scanner watches |
| `data/applications.md` | Your application tracker |
| `reports/` | Evaluation reports |

None of these are committed to git — they're in `.gitignore` — so they stay private even if you fork and push.

---

## Using it

- **Paste a job URL** into the dashboard to evaluate fit against your CV.
- **Pipeline page** — every role the scanner found, waiting for you to review.
- **Scan** — pulls fresh roles from your portals (zero cost: direct ATS API calls, no LLM tokens).

### Automatic daily scans (optional, Windows)

Want new roles to pile up automatically so you just browse them at night? You can register a Windows scheduled task that runs the scanner a few times a day, silently in the background. Ask your AI CLI to "set up a daily scan," or set it up yourself in Task Scheduler pointing at `daily-scan.ps1`.

> The scan is **zero-token** — it hits Greenhouse/Ashby/Lever APIs directly. No API key or paid model needed for scanning.

---

## Manual start (any OS)

If you're not on Windows or prefer the terminal:

```bash
cd web
npm install          # first time only
npm run build        # first time, or after updating
npm run start        # then open http://localhost:3000
```

For development with hot reload: `npm run dev`.

---

## Can I host the dashboard online (Vercel/Netlify)?

**No — and here's the honest reason.** CareerPilot's web app is *local-first by design*:

- Its API routes **read and write files on the local disk** (your `cv.md`, tracker, reports).
- It **spawns local processes** (the scanner) and drives a local browser for the apply flow.
- It has **no authentication and no multi-user data isolation** — it assumes one person, one machine.

On a serverless host like Vercel the build would deploy but every data route would fail (no persistent filesystem, the project root isn't there), and wiring it to a server filesystem would expose file-write + process execution to the public internet with no auth — a serious security risk. So the app is meant to be **downloaded and run locally**, which is exactly what `CareerPilot.bat` does.

If you want a page *about* CareerPilot online (a "Download" landing page), that's a **static** site with no backend — deploy `site/index.html` to Vercel/Netlify/GitHub Pages for free. See [`site/README.md`](site/README.md).

---

## Updating

CareerPilot tracks its upstream. To pull the latest system files without touching your data:

```bash
node update-system.mjs check     # see if an update exists
node update-system.mjs apply     # apply it (your CV/profile/tracker are untouched)
node update-system.mjs rollback  # undo the last update if needed
```

After an update, relaunch `CareerPilot.bat` — it rebuilds the web app automatically if the source changed.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Double-clicking `CareerPilot.bat` does nothing | The `.bat` must have Windows (CRLF) line endings. Re-download the ZIP rather than copy-pasting the file. |
| `Node.js is not installed or not on your PATH` | Install Node LTS from <https://nodejs.org/> and relaunch. |
| `EADDRINUSE: address already in use :::3000` | A server is already running. Just open <http://localhost:3000> — it's already up. To restart clean, stop `node` in Task Manager first. |
| Browser opens but page won't load | Give it a few more seconds on first run (it's still building), then refresh. |
| Garbled characters in `scan.log` | Cosmetic only — the scan still works. Ensure `daily-scan.ps1` writes with `-Encoding utf8`. |

---

## License & credit

MIT. CareerPilot is a personal fork of **[santifer/career-ops](https://github.com/santifer/career-ops)** — please keep the attribution and the [LICENSE](LICENSE) intact. The original author's portfolio is also open source: <https://github.com/santifer/cv-santiago>.
