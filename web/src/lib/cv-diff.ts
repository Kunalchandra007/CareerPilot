import fs from "node:fs";
import path from "node:path";
import { careerOpsRoot } from "@/lib/career-ops";

// ── What changed in your CV for this application (#cv-diff) ──────────────────
// The base CV is cv.md (source of truth). The pdf mode writes a TAILORED CV to
// output/cv-{candidate}-{company}-….html — same facts, reordered/reframed for
// the role. This module reconstructs "what the model changed" by extracting
// plain text from both and running a line-level diff. It NEVER mutates cv.md and
// never invents content — it only reports the delta between two files the user
// already has on disk.

export type DiffRow = { kind: "same" | "add" | "del"; text: string };
export type CvDiff = {
  hasTailored: boolean;
  tailoredFile: string | null; // basename of the matched output/ HTML, if any
  baseLines: number;
  tailoredLines: number;
  added: number;
  removed: number;
  rows: DiffRow[];
};


// ── html → plain text ────────────────────────────────────────────────────────
// Minimal parser: strips tags, decodes the handful of HTML entities that appear
// in cv-template.html output, collapses whitespace, and splits into lines.
function htmlToLines(html: string): string[] {
  const text = html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    // block-level tags → newline so sections don't run together
    .replace(/<\/?(div|p|li|h[1-6]|section|header|footer|br)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

// ── markdown → plain text ────────────────────────────────────────────────────
function mdToLines(md: string): string[] {
  const text = md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^>\s+/gm, "");
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

// ── LCS-based line diff ───────────────────────────────────────────────────────
// O(n*m) LCS — fine for CV-sized text (< 200 lines each).
function lineDiff(base: string[], tailored: string[]): DiffRow[] {
  const n = base.length;
  const m = tailored.length;
  // build LCS table
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      dp[i][j] = base[i - 1] === tailored[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  // backtrack
  const rows: DiffRow[] = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && base[i - 1] === tailored[j - 1]) {
      rows.push({ kind: "same", text: base[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rows.push({ kind: "add", text: tailored[j - 1] });
      j--;
    } else {
      rows.push({ kind: "del", text: base[i - 1] });
      i--;
    }
  }
  return rows.reverse();
}

// ── find the tailored HTML for a given company ───────────────────────────────
function findTailoredHtml(company: string): { file: string; content: string } | null {
  const slug = (company.toLowerCase().match(/[a-z0-9]+/g) ?? []).join("-");
  const dir = path.join(careerOpsRoot(), "output");
  let files: string[];
  try {
    files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".html"));
  } catch {
    return null;
  }
  const re = new RegExp(`(^|[^a-z0-9])${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`, "i");
  const matches = files.filter((f) => re.test(f.toLowerCase()));
  if (!matches.length) return null;
  matches.sort((a, b) => fs.statSync(path.join(dir, b)).mtimeMs - fs.statSync(path.join(dir, a)).mtimeMs);
  try {
    return { file: matches[0], content: fs.readFileSync(path.join(dir, matches[0]), "utf8") };
  } catch {
    return null;
  }
}

// ── public API ────────────────────────────────────────────────────────────────
export function buildCvDiff(company: string): CvDiff {
  const baseRaw = (() => {
    try { return fs.readFileSync(path.join(careerOpsRoot(), "cv.md"), "utf8"); } catch { return null; }
  })();
  const tailored = findTailoredHtml(company);

  if (!baseRaw || !tailored) {
    return { hasTailored: !!tailored, tailoredFile: tailored?.file ?? null, baseLines: 0, tailoredLines: 0, added: 0, removed: 0, rows: [] };
  }

  const baseLines = mdToLines(baseRaw);
  const tailoredLines = htmlToLines(tailored.content);
  const rows = lineDiff(baseLines, tailoredLines);
  return {
    hasTailored: true,
    tailoredFile: tailored.file,
    baseLines: baseLines.length,
    tailoredLines: tailoredLines.length,
    added: rows.filter((r) => r.kind === "add").length,
    removed: rows.filter((r) => r.kind === "del").length,
    rows,
  };
}
