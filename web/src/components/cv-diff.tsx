"use client";

import { useEffect, useState } from "react";
import { ChevronDown, GitCompare } from "lucide-react";
import type { CvDiff, DiffRow } from "@/lib/cv-diff";

export function CvDiffSection({ company }: { company: string }) {
  const [diff, setDiff] = useState<CvDiff | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || diff) return;
    setLoading(true);
    fetch(`/api/cv-diff?company=${encodeURIComponent(company)}`)
      .then((r) => r.json())
      .then((d) => setDiff(d))
      .catch(() => setDiff(null))
      .finally(() => setLoading(false));
  }, [open, company, diff]);

  if (!company) return null;

  return (
    <details
      className="group mt-3 overflow-hidden rounded-xl border border-border bg-surface/30"
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-2 px-4 py-3 transition-colors hover:bg-surface-hover">
        <GitCompare className="size-4 shrink-0 text-brand" />
        <span className="text-sm font-medium">CV changes for this application</span>
        {diff && diff.hasTailored && (
          <span className="ml-1 rounded-full bg-brand-soft px-2 py-0.5 font-mono text-[11px] text-brand">
            +{diff.added} / -{diff.removed}
          </span>
        )}
        <ChevronDown className="ml-auto size-4 shrink-0 text-faint transition-transform group-open:rotate-180" />
      </summary>

      <div className="border-t border-border px-4 py-3">
        {loading && <p className="text-xs text-muted">Loading diff…</p>}
        {!loading && diff && !diff.hasTailored && (
          <div className="space-y-1.5 text-xs text-muted">
            <p>
              This panel diffs your base CV against a <strong>generated tailored CV file</strong>. None exists
              in <code className="rounded bg-surface-hover px-1 font-mono">output/</code> for this company yet —
              generate one with the <strong>Generate tailored CV (PDF)</strong> button above and the line-by-line diff will appear here.
            </p>
            <p className="text-faint">
              Looking for the <em>suggested</em> resume changes? Those live in the
              <span className="mx-1 rounded bg-green-500/10 px-1 font-medium text-green-700 dark:text-green-400">Resume edits to get shortlisted</span>
              card further down the report — they&apos;re always there when an evaluation ran.
            </p>
          </div>
        )}
        {!loading && diff && diff.hasTailored && (
          <>
            <p className="mb-2 font-mono text-[11px] text-faint">
              {diff.tailoredFile} · {diff.added} added · {diff.removed} removed
            </p>
            <DiffTable rows={diff.rows} />
          </>
        )}
      </div>
    </details>
  );
}

function DiffTable({ rows }: { rows: DiffRow[] }) {
  // Only show changed lines + 1 line of context around them to keep it scannable.
  const visible = computeVisible(rows);
  return (
    <div className="overflow-x-auto rounded-lg border border-border font-mono text-xs">
      {visible.map((item, i) =>
        item === "ellipsis" ? (
          <div key={i} className="bg-surface/40 px-3 py-1 text-faint">⋯</div>
        ) : (
          <div
            key={i}
            className={
              item.kind === "add"
                ? "bg-green-500/10 px-3 py-0.5 text-green-700 dark:text-green-400"
                : item.kind === "del"
                  ? "bg-red-500/10 px-3 py-0.5 text-red-700 dark:text-red-400 line-through"
                  : "px-3 py-0.5 text-faint"
            }
          >
            {item.kind === "add" ? "+ " : item.kind === "del" ? "- " : "  "}
            {item.text}
          </div>
        ),
      )}
    </div>
  );
}

type Visible = DiffRow | "ellipsis";
function computeVisible(rows: DiffRow[]): Visible[] {
  const CONTEXT = 1;
  const changed = new Set(rows.map((r, i) => (r.kind !== "same" ? i : -1)).filter((i) => i >= 0));
  const show = new Set<number>();
  for (const ci of changed) {
    for (let d = -CONTEXT; d <= CONTEXT; d++) {
      const idx = ci + d;
      if (idx >= 0 && idx < rows.length) show.add(idx);
    }
  }
  const out: Visible[] = [];
  let lastShown = -1;
  for (let i = 0; i < rows.length; i++) {
    if (!show.has(i)) continue;
    if (lastShown >= 0 && i > lastShown + 1) out.push("ellipsis");
    out.push(rows[i]);
    lastShown = i;
  }
  return out;
}
