# CareerPilot — landing page (`site/`)

This folder is the **static download/landing page** for CareerPilot. It has **no backend** — it's a single HTML file whose only job is to point people at the GitHub repo so they can download and run the app locally.

> This is the only part of CareerPilot you should host online. The actual `web/` dashboard is local-first (it reads/writes your files and spawns local processes) and **cannot** run on Vercel or any serverless host — see [`../INSTALL.md`](../INSTALL.md).

## Before you deploy

The download links in `site/index.html` already point at `github.com/Kunalchandra007/CareerPilot`. If you fork or rename the repo, update those two links (the download button and the "View on GitHub" button) to match.

## Deploy to Vercel

The repo's `../vercel.json` already sets `outputDirectory` to `site`, so a default import works:

1. Push your repo to GitHub.
2. On <https://vercel.com>, **Add New ▸ Project** and import your CareerPilot repo.
3. Framework Preset: **Other** (it's static). Leave build command empty. Output directory: `site` (already set by `vercel.json`).
4. Deploy. You get a public URL like `careerpilot.vercel.app`.

Or from the CLI:

```bash
npm i -g vercel
vercel            # from the repo root; deploys the static site/
vercel --prod     # promote to production
```

## Deploy elsewhere (same idea, all free)

- **GitHub Pages:** point Pages at the `site/` folder (or move `index.html` to `/docs` and serve from there).
- **Netlify:** publish directory = `site`, no build command.
- **Cloudflare Pages:** build output directory = `site`.

## Local preview

```bash
npx serve site
# then open the printed http://localhost:xxxx
```
