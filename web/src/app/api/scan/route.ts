import { NextRequest } from "next/server";
import { spawn } from "node:child_process";
import fs from "node:fs";
import { careerOpsRoot, rootScript } from "@/lib/career-ops";

// The company-first scan (scan.mjs) hits the tracked ATS boards in portals.yml
// directly — HTTP + JSON only, ZERO LLM tokens. It WRITES new offers into
// data/pipeline.md + data/scan-history.tsv itself (no --dry-run), so once it
// finishes the inbox already holds the new jobs; the client just refreshes.
export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

// scan.mjs emits human progress on stdout. We surface a few authoritative lines
// as structured events; everything else streams through as a `log` line so the
// UI can show live progress without us re-parsing the whole format.
const COMPANIES_RE = /Companies scanned:\s+(\d+)/;
const TOTAL_JOBS_RE = /Total jobs found:\s+(\d+)/;
const NEW_OFFERS_RE = /New offers added:\s+(\d+)/;
const OFFER_LINE_RE = /^\s*\+\s+(.+?)\s+\|\s+(.+?)(?:\s+\|\s+(.+))?$/;

type ScanEvent =
  | { kind: "start"; free: true }
  | { kind: "log"; line: string }
  | { kind: "offer"; company: string; title: string; location: string }
  | { kind: "summary"; companiesScanned: number; totalJobs: number; newOffers: number }
  | { kind: "error"; message: string }
  | { kind: "done"; newOffers: number; cost: { tokens: number; usd: number } };

export async function POST(_req: NextRequest) {
  // Guard: a data-only checkout (or pre-onboarding) has no scanner. Fail soft.
  if (!fs.existsSync(rootScript("scan"))) {
    return Response.json(
      { error: "The scanner isn't available in this checkout yet." },
      { status: 400 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: ScanEvent) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
        } catch {
          /* stream closed */
        }
      };

      send({ kind: "start", free: true });

      await new Promise<void>((resolve) => {
        // No --dry-run: scan.mjs appends new offers to data/pipeline.md so the
        // inbox picks them up on the post-scan refresh. --quiet trims noise but
        // keeps the summary block.
        const child = spawn(process.execPath, [rootScript("scan")], {
          cwd: careerOpsRoot(),
          env: { ...process.env },
        });

        let companiesScanned = 0;
        let totalJobs = 0;
        let newOffers = 0;
        let sawSummary = false;
        let outBuf = "";
        let errBuf = "";
        let inOffers = false;

        const killer = setTimeout(() => {
          try {
            child.kill("SIGTERM");
          } catch {
            /* ignore */
          }
        }, 290_000);

        const handleLine = (raw: string) => {
          const line = raw.replace(/\r$/, "");
          const trimmed = line.trim();
          if (!trimmed) return;

          const compM = line.match(COMPANIES_RE);
          if (compM) {
            companiesScanned = Number(compM[1]);
            sawSummary = true;
            send({ kind: "log", line: trimmed });
            return;
          }
          const totalM = line.match(TOTAL_JOBS_RE);
          if (totalM) {
            totalJobs = Number(totalM[1]);
            send({ kind: "log", line: trimmed });
            return;
          }
          const newM = line.match(NEW_OFFERS_RE);
          if (newM) {
            newOffers = Number(newM[1]);
            send({ kind: "log", line: trimmed });
            return;
          }
          // "New offers:" header flips us into offer-list mode; each following
          // "  + company | title | location" line is an offer until a blank/other line.
          if (/^New offers:/i.test(trimmed)) {
            inOffers = true;
            send({ kind: "log", line: trimmed });
            return;
          }
          if (inOffers) {
            const offM = trimmed.match(OFFER_LINE_RE);
            if (offM) {
              send({
                kind: "offer",
                company: offM[1].trim(),
                title: offM[2].trim(),
                location: (offM[3] || "").trim(),
              });
              return;
            }
            inOffers = false;
          }
          send({ kind: "log", line: trimmed });
        };

        child.stdout.on("data", (d: Buffer) => {
          outBuf += d.toString();
          const parts = outBuf.split(/\r\n|\r|\n/);
          outBuf = parts.pop() ?? "";
          for (const p of parts) handleLine(p);
        });
        child.stderr.on("data", (d: Buffer) => {
          errBuf += d.toString();
          const parts = errBuf.split(/\r?\n/);
          errBuf = parts.pop() ?? "";
          for (const p of parts) {
            if (p.trim()) send({ kind: "log", line: p.trim() });
          }
        });

        child.on("error", (e) => {
          clearTimeout(killer);
          send({ kind: "error", message: e instanceof Error ? e.message : "scanner failed to start" });
          send({ kind: "done", newOffers, cost: { tokens: 0, usd: 0 } });
          resolve();
        });
        child.on("close", () => {
          clearTimeout(killer);
          if (outBuf.trim()) handleLine(outBuf);
          if (sawSummary) {
            send({ kind: "summary", companiesScanned, totalJobs, newOffers });
          }
          send({ kind: "done", newOffers, cost: { tokens: 0, usd: 0 } });
          resolve();
        });
      });

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
