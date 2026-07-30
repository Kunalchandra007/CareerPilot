"use client";

import { useState } from "react";
import { Sparkles, Download, Copy, Check, ChevronDown } from "lucide-react";
import { useJobs } from "@/components/jobs/job-store";
import { CostBadge } from "@/components/cost/cost-badge";

function getCliId(): string | null {
  try { return JSON.parse(localStorage.getItem("career-ops:config") || "{}").cliId || null; }
  catch { return null; }
}

type SkillGap = { existing: string[]; supportedByResume: string[]; gap: string[] };
type FitResult = { skillGap: SkillGap & { error?: string }; latex: string | null };

export function QuickEvaluate() {
  const { startJob } = useJobs();
  const [url, setUrl] = useState("");
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [fit, setFit] = useState<FitResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function run() {
    const u = url.trim();
    if (!/^https?:\/\//i.test(u)) {
      setHint("Paste a full job-posting URL (https://…).");
      return;
    }
    const cliId = getCliId();
    if (cliId) {
      startJob({ title: "Evaluate · pasted URL", subtitle: u, kind: "evaluate", input: u, page: "/" });
      setUrl("");
      setHint("Evaluating — watch it in the Workers tray.");
      return;
    }
    // Zero-CLI path: deterministic CV Fit
    setLoading(true);
    setFit(null);
    setHint("");
    try {
      const res = await fetch("/api/cv-fit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: u }),
      });
      const data: FitResult = await res.json();
      setFit(data);
      setUrl("");
    } catch {
      setHint("CV Fit check failed — check your connection.");
    } finally {
      setLoading(false);
    }
  }

  function copyLatex() {
    if (!fit?.latex) return;
    navigator.clipboard.writeText(fit.latex).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function downloadLatex() {
    if (!fit?.latex) return;
    const blob = new Blob([fit.latex], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "cv-template.tex";
    a.click();
  }

  const hasCli = typeof window !== "undefined" && !!getCliId();

  return (
    <div className="mt-7">
      <div className="flex max-w-xl items-center gap-2 rounded-full border border-border bg-surface/70 py-1.5 pl-4 pr-1.5 shadow-sm focus-within:border-brand/50">
        <Sparkles className="size-4 shrink-0 text-brand/70" />
        <input
          value={url}
          onChange={(e) => { setUrl(e.target.value); if (hint) setHint(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") run(); }}
          placeholder="Paste any job URL to evaluate…"
          className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-faint"
          disabled={loading}
        />
        <button
          onClick={run}
          disabled={loading}
          className="shrink-0 rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-200 disabled:opacity-60"
        >
          {loading ? "Checking…" : hasCli ? "Evaluate" : "CV Fit"}
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2">
        {hasCli ? (
          <>
            <CostBadge kind="spend" size="xs" />
            <span className="text-xs text-faint">Full AI evaluation — runs on your configured CLI.</span>
          </>
        ) : (
          <>
            <CostBadge kind="free" size="xs" />
            <span className="text-xs text-faint">Zero-token CV Fit — no CLI needed. <a href="/config" className="text-brand hover:underline">Add a CLI</a> for full AI evaluation.</span>
          </>
        )}
      </div>

      {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}

      {fit && (
        <div className="mt-4 max-w-xl space-y-3">
          {fit.skillGap.error ? (
            <p className="rounded-xl border border-dashed border-border bg-surface/30 p-3 text-xs text-muted">{fit.skillGap.error}</p>
          ) : (
            <details className="group overflow-hidden rounded-xl border border-border bg-surface/30" open>
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-2 px-4 py-3 transition-colors hover:bg-surface-hover">
                <span className="text-sm font-medium">CV Fit analysis</span>
                <span className="ml-1 rounded-full bg-brand-soft px-2 py-0.5 font-mono text-[11px] text-brand">
                  {fit.skillGap.existing?.length ?? 0} match · {fit.skillGap.gap?.length ?? 0} gap
                </span>
                <ChevronDown className="ml-auto size-4 shrink-0 text-faint transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-border px-4 py-3 space-y-2 text-xs">
                {(fit.skillGap.existing?.length > 0) && (
                  <div>
                    <p className="font-medium text-foreground mb-1">✅ Already in your CV</p>
                    <p className="text-muted">{fit.skillGap.existing.join(", ")}</p>
                  </div>
                )}
                {(fit.skillGap.supportedByResume?.length > 0) && (
                  <div>
                    <p className="font-medium text-foreground mb-1">🔶 Supported but not explicit</p>
                    <p className="text-muted">{fit.skillGap.supportedByResume.join(", ")}</p>
                  </div>
                )}
                {(fit.skillGap.gap?.length > 0) && (
                  <div>
                    <p className="font-medium text-foreground mb-1">❌ Gap — not in CV</p>
                    <p className="text-muted">{fit.skillGap.gap.join(", ")}</p>
                  </div>
                )}
              </div>
            </details>
          )}

          {fit.latex && (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface/30 px-4 py-3">
              <span className="flex-1 text-sm font-medium">LaTeX CV template</span>
              <button onClick={copyLatex} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs transition-colors hover:bg-surface-hover">
                {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button onClick={downloadLatex} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs transition-colors hover:bg-surface-hover">
                <Download className="size-3.5" /> Download
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
