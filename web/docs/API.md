# CareerPilot Web — API Reference

All routes are Next.js App Router handlers under `src/app/api/`. Every route is `runtime = "nodejs"` and `dynamic = "force-dynamic"` unless noted. The app resolves the career-ops root via `careerOpsRoot()` (`CAREER_OPS_ROOT` env var, or `../` by default).

---

## CV

### `GET /api/cv`
Returns the raw markdown content of `cv.md`.

### `POST /api/cv`
Writes updated markdown back to `cv.md` (atomic write).

### `POST /api/cv/ingest`
Accepts pasted CV text or a LinkedIn URL and converts it to structured `cv.md` markdown.

### `GET /api/cv-diff`
Returns a structured diff between the current `cv.md` and the last generated tailored CV.

### `POST /api/cv-fit`
Zero-CLI CV Fit check. Fetches the JD at the supplied URL, strips HTML, runs `jd-skill-gap.mjs`, and returns:
```json
{
  "skillGap": { "existing": [], "supportedByResume": [], "gap": [] },
  "latex": "<cv-template.tex contents or null>"
}
```
Body: `{ "url": "https://…" }`

### `POST /api/cv-pdf`
Spawns `generate-pdf.mjs` to produce a PDF from the current CV. Returns the PDF binary or a progress stream.

---

## Pipeline & Tracker

### `GET /api/pipeline`
Returns `{ inbox: InboxJob[], applications: Application[] }` parsed from `data/pipeline.md` and `data/applications.md`.

### `POST /api/status`
Updates the status of a tracker row by delegating to `set-status.mjs`.
Body: `{ "n": "042", "status": "Applied", "note": "…" }`

### `DELETE /api/tracker/delete`
Deletes a tracker row by report number (requires `tracker.mjs delete --num` support in the checkout).
Body: `{ "n": "042" }`

---

## Scan

### `POST /api/scan`
Streams the company-first scan (`scan.mjs`) as NDJSON. Zero LLM tokens. Writes new offers directly to `data/pipeline.md`.

Event types:
| `kind` | Fields |
|--------|--------|
| `start` | `free: true` |
| `log` | `line: string` |
| `offer` | `company`, `title`, `location` |
| `summary` | `companiesScanned`, `totalJobs`, `newOffers` |
| `error` | `message` |
| `done` | `newOffers`, `cost: { tokens: 0, usd: 0 }` |

Response: `Content-Type: application/x-ndjson`

### `GET /api/explore`
Runs the reverse-ATS full scan (`scan-ats-full.mjs`) and returns discovered offers.

### `POST /api/explore/add`
Adds a discovered offer URL to `data/pipeline.md`.

### `POST /api/explore/ai`
AI-assisted discovery — requires a configured CLI. Streams evaluation events.

### `GET /api/explore/ai/known`
Returns the set of URLs already in the pipeline (for dedup in the explore UI).

### `GET /api/whats-new`
Returns `{ offers: DiscoveredOffer[] }` — fresh offers from the last scan not yet in the tracker.

---

## Follow-ups

### `GET /api/followups`
Returns `{ entries: FollowUp[], metadata: { overdue: number } }` from `followup-cadence.mjs`.

### `POST /api/followups/log`
Logs a follow-up action for a tracker row.
Body: `{ "n": "042", "note": "…" }`

---

## Apply

### `POST /api/apply/session`
Opens a Playwright browser session for the given job URL.

### `POST /api/apply/prefill`
Returns prefill suggestions for a job application form based on `cv.md` and `modes/_profile.md`.

### `POST /api/apply/fill`
Fills form fields in the active Playwright session. Never submits.

### `POST /api/apply/drive`
Drives the apply flow step by step (navigate → snapshot → fill). Never clicks Submit.

### `POST /api/apply/close`
Closes the active Playwright session.

---

## Profile & Config

### `GET /api/profile`
Returns parsed `config/profile.yml`.

### `POST /api/profile`
Writes updated profile YAML back to `config/profile.yml`.

### `GET /api/portals`
Returns parsed `portals.yml`.

### `POST /api/portals`
Writes updated portals config.

### `POST /api/portals/verify`
Checks liveness of portal URLs via `check-liveness.mjs`.

### `GET /api/clis`
Returns registered CLI configurations from `config/`.

---

## Reports & Memory

### `GET /api/report/shape`
Returns the structured shape (blocks A–G + Machine Summary YAML) of a report.
Query: `?n=042`

### `GET /api/memory`
Returns the web-assistant notes block from `modes/_profile.md`.

### `POST /api/memory`
Appends a durable fact to the managed notes block in `modes/_profile.md`.

---

## Utility

### `GET /api/doctor`
Runs `doctor.mjs --json` and returns `{ onboardingNeeded, missing, warnings, autoCopied }`.

### `GET /api/version`
Returns `{ version }` from the root `VERSION` file.

### `GET /api/usage`
Returns token/cost usage stats.

### `GET /api/logo`
Proxies company logo lookup.

### `POST /api/assistant`
Streams a response from the configured AI assistant CLI.

### `POST /api/run` / `POST /api/runs/save`
Executes and persists a named career-ops mode run.
