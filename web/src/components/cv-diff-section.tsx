"use client";

import { useState } from "react";
import { ChevronDown, FileDiff, Loader2 } from "lucide-react";

// "What did the model change in my CV for this application?" — lazy-loads the
// line diff between cv.md (base) and the tailored output/cv-…-{company}.html on
// first expand. Green = added/reworded for this role, red strikethrough =
// dropped/replaced from the base CV. Facts never change (source-of-truth rule);
// this view is the receipt.
type DiffRow = { kind: "same" | "add" | "del"; text: string };
type CvDiff = {
  hasTailored: boolean;
  tailoredFile: string | null;
  added: number;
  removed: number;
  rows: DiffRow[];
};

export function CvDiffSection({ company }: { company: string }) {
  const [diff, setDiff] = useState<CvDiff | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hideSame, setHideSame] = useState(true);

  const load = () => {
    if (diff || loading) return;
    setLoading(true);
    fetch(`/api/cv-diff?company=${encodeURIComponent(company)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: CvDiff) => setDiff(d))
      .catch(() => setError("Couldn't load the CV diff."))
      .finally(() => setLoading(false));
  };

  const visible = diff ? (hideSame ? diff.rows.filter((r) => r.kind !== "same") : diff.rows) : [];

  return (
    <details className="group mt-3 overflow-hidden rounded-xl border border-border bg-surface/30" onToggle={(e) => (e.target as HTMLDetailsElement).open && load()}>
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-2 px-4 py-3 transition-colors hover:bg-surface-hover">
        <FileDiff className="size-4 text-brand" />
        <span className="text-sm font-medium">CV changes for this application</span>
        {diff?.hasTailored && (
          <span className="text-xs text-faint">
            <span className="text-emerald-600 dark:text-emerald-400">+{diff.added}</span> / <span className="text-red-600 dark:text-red-400">−{diff.removed}</span> lines vs cv.md
          </span>
        )}
        <ChevronDown className="ml-auto size-4 shrink-0 text-faint transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-border px-4 py-3">
        {loading && (
          <p className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="size-4 animate-spin" /> Comparing cv.md with the tailored CV…
          </p>
        )}
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {diff && !diff.hasTailored && (
          <p className="text-sm text-muted">
            No tailored CV found in <code className="rounded bg-surface-hover px-1 py-0.5 font-mono text-xs">output/</code> for this company yet. Generate one with the{" "}
            <span className="font-medium text-foreground">Generate PDF</span> button above — the diff will appear here.
          </p>
        )}
        {diff && diff.hasTailored && (
          <>
            <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-muted">
              {diff.tailoredFile && <code className="rounded bg-surface-hover px-1.5 py-0.5 font-mono">{diff.tailoredFile}</code>}
              <label className="ml-auto inline-flex cursor-pointer items-center gap-1.5">
                <input type="checkbox" checked={hideSame} onChange={(e) => setHideSame(e.target.checked)} className="accent-[var(--brand,#6d28d9)]" />
                only changes
              </label>
            </div>
            {visible.length === 0 ? (
              <p className="text-sm text-muted">The tailored CV matches cv.md line-for-line — nothing was changed.</p>
            ) : (
              <div className="max-h-96 overflow-y-auto rounded-lg border border-border/60 bg-background/40 font-mono text-xs leading-relaxed">
                {visible.map((r, i) => (
                  <div
                    key={i}
                    className={
                      r.kind === "add"
                        ? "border-l-2 border-emerald-500/60 bg-emerald-500/10 px-3 py-1 text-foreground"
                        : r.kind === "del"
                          ? "border-l-2 border-red-500/60 bg-red-500/10 px-3 py-1 text-muted line-through decoration-red-500/50"
                          : "border-l-2 border-transparent px-3 py-1 text-faint"
                    }
                  >
                    <span className="mr-2 select-none text-faint">{r.kind === "add" ? "+" : r.kind === "del" ? "−" : " "}</span>
                    {r.text}
                  </div>
                ))}
              </div>
            )}
            <p className="mt-2 text-xs text-faint">
              <span className="text-emerald-600 dark:text-emerald-400">Green</span> = added or reworded for this role · <span className="text-red-600 dark:text-red-400">red</span> = dropped from your base CV. Facts are never invented — only reordered and reframed.
            </p>
          </>
        )}
      </div>
    </details>
  );
}
