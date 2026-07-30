"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export type MachineSummary = {
  score: string | null;
  recommend_apply: boolean | null;
  key_gaps: string[];
};

export function VerdictSummary({
  summary,
  reportId,
}: {
  summary: MachineSummary;
  reportId: string;
}) {
  const [aiText, setAiText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasData = summary.score !== null || summary.key_gaps.length > 0;
  if (!hasData) return null;

  const rewrite = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/summarize-verdict?id=${encodeURIComponent(reportId)}`);
      const text = await res.text();
      setAiText(text);
    } catch {
      setAiText("Could not generate summary — try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-border bg-surface/40 px-4 py-3 text-sm print:hidden">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">TL;DR</p>
        {!aiText && (
          <button
            onClick={rewrite}
            disabled={loading}
            className="inline-flex items-center gap-1 text-[11px] text-muted transition-colors hover:text-brand disabled:opacity-50"
          >
            {loading ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
            Summarize with AI
          </button>
        )}
      </div>

      {aiText ? (
        <p className="mt-1.5 text-sm text-foreground">{aiText}</p>
      ) : (
        <div className="mt-1.5 space-y-1">
          {summary.score !== null && (
            <p>
              <span className="text-muted">Score:</span>{" "}
              <span className="font-medium text-foreground">{summary.score}/5</span>
              {summary.recommend_apply !== null && (
                <span className={`ml-2 font-medium ${summary.recommend_apply ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                  {summary.recommend_apply ? "✓ Recommended" : "✗ Below apply line"}
                </span>
              )}
            </p>
          )}
          {summary.key_gaps.length > 0 && (
            <ul className="mt-1 space-y-0.5 text-xs text-muted">
              {summary.key_gaps.slice(0, 3).map((g, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="mt-px shrink-0 text-faint">·</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
