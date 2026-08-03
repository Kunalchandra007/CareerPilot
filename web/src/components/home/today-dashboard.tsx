"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CircleHelp, Sparkles, ArrowRight, Radar, Loader2, WandSparkles, Coins } from "lucide-react";
import { instrumentSerif } from "@/lib/fonts";
import { HeroGlow } from "@/components/hero-glow";
import type { Application, InboxJob } from "@/lib/career-ops";
import type { DiscoveredOffer } from "@/lib/explore";
import { DiscoveryCard } from "@/components/explore/discovery-card";
import { FollowUpCard, type FollowUp } from "@/components/home/follow-up-card";
import { DecisionCard } from "@/components/home/decision-card";
import { QuickEvaluate } from "@/components/quick-evaluate";
import { ScanScheduler } from "@/components/home/scan-scheduler";
import { useJobs } from "@/components/jobs/job-store";

function fmtTokens(t: number): string {
  if (t >= 1_000_000) return `${(t / 1_000_000).toFixed(1)}M`;
  if (t >= 1_000) return `${Math.round(t / 1_000)}k`;
  return `${t}`;
}

// The retention "Today": a dual-loop action queue (the maintainer's
// "N new matches this week · M follow-ups due"). SUPPLY loop = fresh free-scan
// matches (zero tokens, /api/whats-new); DEMAND loop = follow-ups due
// (/api/followups). Each item one-tap actionable. Home stays a VIEW over the
// canonical files — every action dispatches a real registry action / route.
export function TodayDashboard({
  applications,
  inbox,
  inBetween,
}: {
  applications: Application[];
  inbox: InboxJob[];
  inBetween: boolean;
}) {
  const { jobs, startJob } = useJobs();
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [overdue, setOverdue] = useState(0);
  const [fresh, setFresh] = useState<DiscoveredOffer[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanLine, setScanLine] = useState("");
  const [scanResult, setScanResult] = useState<string | null>(null);
  // Tag-based AI scan (scan + evaluate in one click, gated by a cost confirm).
  const [aiScanning, setAiScanning] = useState(false);
  const [aiScanLine, setAiScanLine] = useState("");
  const [aiPending, setAiPending] = useState<DiscoveredOffer[] | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const router = useRouter();
  const dateLabel = useMemo(() => new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }), []);

  const hasCli = typeof window !== "undefined" && (() => {
    try { return !!JSON.parse(localStorage.getItem("career-ops:config") || "{}").cliId; }
    catch { return false; }
  })();

  // Cost estimate for evaluating `aiPending` roles — EMPIRICAL, averaged from
  // this browser's past evaluate jobs' real token cost (same honest source as
  // the inbox shortlist tray). No samples yet → we show "uses your tokens".
  const aiEstimate = useMemo(() => {
    const n = aiPending?.length ?? 0;
    const samples = jobs.filter((j) => j.kind === "evaluate" && j.status === "done" && j.cost?.tokens).map((j) => j.cost!);
    if (!samples.length || n === 0) return {} as { tokens?: number; usd?: number };
    const avgT = samples.reduce((a, c) => a + c.tokens, 0) / samples.length;
    const usds = samples.filter((s) => s.usd != null).map((s) => s.usd!);
    const avgUsd = usds.length ? usds.reduce((a, c) => a + c, 0) / usds.length : undefined;
    return { tokens: Math.round(avgT * n), usd: avgUsd != null ? +(avgUsd * n).toFixed(2) : undefined };
  }, [jobs, aiPending]);

  const refetch = useCallback(() => {
    fetch("/api/followups")
      .then((r) => r.json())
      .then((d) => {
        setFollowups(Array.isArray(d.entries) ? d.entries : []);
        setOverdue(d.metadata?.overdue ?? d.entries?.length ?? 0);
      })
      .catch(() => {});
    fetch("/api/whats-new")
      .then((r) => r.json())
      .then((d) => setFresh(Array.isArray(d.offers) ? d.offers : []))
      .catch(() => {});
  }, []);

  // Shared free-scan streamer (0 tokens): spawns scan.mjs via /api/scan, forwards
  // each authoritative log line to `onLine`, and resolves with the new-offer count.
  const streamScan = useCallback(async (onLine: (s: string) => void): Promise<number> => {
    const res = await fetch("/api/scan", { method: "POST" });
    if (!res.ok || !res.body) throw new Error("scan-failed");
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let newOffers = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const parts = buf.split("\n");
      buf = parts.pop() ?? "";
      for (const p of parts) {
        if (!p.trim()) continue;
        let e: { kind: string; line?: string; newOffers?: number };
        try {
          e = JSON.parse(p);
        } catch {
          continue;
        }
        if (e.kind === "log" && e.line) onLine(e.line);
        else if ((e.kind === "summary" || e.kind === "done") && typeof e.newOffers === "number") newOffers = e.newOffers;
      }
    }
    return newOffers;
  }, []);

  // Company-first scan (portals.yml tracked companies) via /api/scan → scan.mjs.
  // FREE (0 tokens). It writes new offers into data/pipeline.md itself, so on the
  // terminal `done` we refresh the server snapshot + client loops to surface them.
  const runScan = useCallback(async () => {
    setScanning(true);
    setScanResult(null);
    setScanLine("Starting scan…");
    try {
      const newOffers = await streamScan(setScanLine);
      setScanResult(newOffers > 0 ? `Added ${newOffers} new role${newOffers === 1 ? "" : "s"} to your pipeline.` : "No new roles — you're current.");
      router.refresh();
      refetch();
    } catch {
      setScanResult("Scan failed. Check the terminal for details.");
    } finally {
      setScanning(false);
      setScanLine("");
    }
  }, [streamScan, refetch, router]);

  // AI scan = the SAME free scan (your saved portals.yml title/location tags — no
  // role to type), then AI-evaluate the newly-discovered roles. We STOP at a cost
  // confirm before spending a single token: the free scan finds the roles, then
  // we show the count + an estimate and only fire evaluate jobs once you confirm.
  const runAiScan = useCallback(async () => {
    setAiScanning(true);
    setAiResult(null);
    setAiPending(null);
    setAiScanLine("Scanning your tracked companies with your saved filters…");
    try {
      await streamScan(setAiScanLine);
      setAiScanLine("Collecting new roles to evaluate…");
      // scan.mjs just appended the new roles to the pipeline; whats-new (days=1)
      // surfaces exactly the freshly-discovered, not-yet-evaluated ones (it keys
      // off the canonical first_seen, so re-seen older roles are excluded).
      const data = await fetch("/api/whats-new?days=1").then((r) => r.json()).catch(() => ({ offers: [] }));
      const offers: DiscoveredOffer[] = Array.isArray(data.offers) ? data.offers : [];
      router.refresh();
      refetch();
      if (offers.length === 0) setAiResult("No new roles to evaluate — you're current.");
      else setAiPending(offers); // → cost-confirm panel
    } catch {
      setAiResult("AI scan failed. Check the terminal for details.");
    } finally {
      setAiScanning(false);
      setAiScanLine("");
    }
  }, [streamScan, refetch, router]);

  // Confirmed spend: fire one evaluate worker per discovered role (grouped under a
  // batchId). With no CLI, startJob falls back to the free zero-token CV Fit.
  const confirmEvaluate = useCallback(() => {
    if (!aiPending || aiPending.length === 0) return;
    const batchId = `ai-scan-${Date.now()}`;
    for (const o of aiPending) {
      startJob({
        title: `Evaluate · ${o.company || "role"}`,
        subtitle: o.title || o.url,
        kind: "evaluate",
        input: o.url,
        page: "/",
        batchId,
      });
    }
    const n = aiPending.length;
    setAiPending(null);
    setAiResult(`${hasCli ? "Evaluating" : "Checking"} ${n} role${n === 1 ? "" : "s"} — watch the Workers tray.`);
  }, [aiPending, startJob, hasCli]);

  useEffect(() => {
    refetch();
    // A worker (evaluate/pdf) just wrote a real tracker row — refresh the server
    // snapshot (applications/inbox props) + the client loops so the freshly-scored
    // role appears in "Awaiting your decision" without a manual reload.
    const onDone = () => {
      router.refresh();
      refetch();
    };
    window.addEventListener("co-job-done", onDone);
    return () => window.removeEventListener("co-job-done", onDone);
  }, [refetch, router]);

  // Awaiting decision: scored (Evaluated) but no terminal status yet.
  const awaiting = useMemo(
    () => applications.filter((a) => /^evaluat/i.test(a.status)).slice(0, 6),
    [applications],
  );

  const newThisWeek = fresh.length;
  const allClear = newThisWeek === 0 && overdue === 0 && awaiting.length === 0;
  const inboxUrls = useMemo(() => new Set(inbox.map((j) => j.url)), [inbox]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 max-sm:pb-24">
      <section className="dot-bg relative overflow-hidden rounded-2xl border border-border bg-surface/40 px-7 py-10 md:px-10 md:py-12">
        <HeroGlow />
        {/* Readability scrim between the animated glow (z-0) and the copy (z-10). */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] bg-surface/55 backdrop-blur-[2px] dark:bg-background/45" />
        <div className="relative z-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            <span className="text-faint">//</span> today · <span className="tabular-nums">{dateLabel}</span>
          </p>
          <h1 className={`${instrumentSerif.className} mt-3 text-4xl leading-[1.05] text-landing md:text-5xl`}>
            {allClear ? (
              <>You&apos;re all caught up.</>
            ) : (
              <>
                {newThisWeek > 0 && (
                  <>
                    <span className="text-brand tabular-nums">{newThisWeek}</span> new match{newThisWeek === 1 ? "" : "es"} this week
                  </>
                )}
                {newThisWeek > 0 && overdue > 0 && <span className="text-faint"> · </span>}
                {overdue > 0 && (
                  <>
                    <span className="text-brand tabular-nums">{overdue}</span> follow-up{overdue === 1 ? "" : "s"} due
                  </>
                )}
              </>
            )}
          </h1>
          <p className="mt-4 max-w-xl text-sm text-muted">
            {allClear ? "I'll keep scanning the market in the background and surface anything that fits." : "Your action queue for today — discovery and follow-ups, in one place."}
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={runScan}
              disabled={scanning || aiScanning}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground transition hover:bg-brand-200 disabled:cursor-not-allowed disabled:opacity-70 max-sm:min-h-[44px]"
            >
              {scanning ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Scanning…
                </>
              ) : (
                <>
                  <Radar className="size-4" /> Scan now
                </>
              )}
            </button>
            <button
              type="button"
              onClick={runAiScan}
              disabled={scanning || aiScanning || aiPending !== null}
              title="Scan your tracked companies with your saved filters, then AI-evaluate the new roles (you confirm the cost first)"
              className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand-soft/40 px-5 py-2.5 text-sm font-medium text-brand-text transition hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-70 max-sm:min-h-[44px]"
            >
              {aiScanning ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> AI scanning…
                </>
              ) : (
                <>
                  <WandSparkles className="size-4" /> AI scan
                </>
              )}
            </button>
            <Link href="/explore" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-brand/40 hover:text-brand max-sm:min-h-[44px]">
              Find new roles <ArrowRight className="size-4" />
            </Link>
            <Link href="/pipeline" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-brand/40 hover:text-brand max-sm:min-h-[44px]">
              Open pipeline
            </Link>
          </div>
          {(scanning || scanResult) && (
            <p className="mt-3 font-mono text-xs text-muted" aria-live="polite">
              {scanning ? (
                <span className="truncate">{scanLine || "Scanning tracked companies… · 0 tokens"}</span>
              ) : (
                <span className="text-brand">{scanResult}</span>
              )}
            </p>
          )}
          {(aiScanning || aiResult) && (
            <p className="mt-2 font-mono text-xs text-muted" aria-live="polite">
              {aiScanning ? (
                <span className="truncate">{aiScanLine || "AI scanning… · 0 tokens so far"}</span>
              ) : (
                <span className="text-brand">{aiResult}</span>
              )}
            </p>
          )}
          {aiPending !== null && (
            <div className="mt-3 rounded-2xl border border-brand/30 bg-brand-soft/30 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Sparkles className="size-4 text-brand" />
                {aiPending.length} new role{aiPending.length === 1 ? "" : "s"} ready to evaluate
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 font-mono text-xs text-muted">
                <Coins className="size-3.5" />
                {hasCli
                  ? aiEstimate.tokens != null
                    ? `~${fmtTokens(aiEstimate.tokens)} tokens${aiEstimate.usd != null ? ` · ~$${aiEstimate.usd}` : ""} estimated`
                    : "uses your tokens (no past runs to estimate from yet)"
                  : "0 tokens — free CV-fit scoring (no CLI connected)"}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={confirmEvaluate}
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition hover:bg-brand-200 max-sm:min-h-[44px]"
                >
                  <WandSparkles className="size-4" />
                  {hasCli ? `Evaluate ${aiPending.length}` : `Score ${aiPending.length} free`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAiPending(null);
                    setAiResult("Cancelled — new roles are in your pipeline, evaluate them anytime.");
                  }}
                  className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-brand/40 hover:text-brand max-sm:min-h-[44px]"
                >
                  Not now
                </button>
                {!hasCli && (
                  <Link href="/config" className="inline-flex items-center gap-1 text-xs text-muted transition hover:text-brand">
                    Connect a CLI for full AI reports <ArrowRight className="size-3" />
                  </Link>
                )}
              </div>
            </div>
          )}
          <ScanScheduler />
          <QuickEvaluate />
        </div>
      </section>

      {/* A. Follow-ups due (demand loop) */}
      {followups.length > 0 && (
        <Section icon={Bell} title="Follow-ups due" hint="Keep your applications alive — a nudge beats silence">
          <div className="grid gap-2.5">
            {followups.map((f) => (
              <FollowUpCard key={`${f.num}-${f.company}`} followup={f} onLogged={() => setOverdue((n) => Math.max(0, n - 1))} />
            ))}
          </div>
        </Section>
      )}

      {/* B. Awaiting your decision */}
      {awaiting.length > 0 && (
        <Section icon={CircleHelp} title="Awaiting your decision" hint="Scored — apply or skip">
          <div className="grid gap-2.5 sm:grid-cols-2">
            {awaiting.map((a) => (
              <DecisionCard key={a.n} app={a} />
            ))}
          </div>
        </Section>
      )}

      {/* C. Fresh matches this week (supply loop) */}
      {fresh.length > 0 && (
        <Section icon={Sparkles} title="Fresh matches this week" hint="Found by your free scans · 0 tokens">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {fresh.slice(0, 6).map((o) => (
              <DiscoveryCard key={o.url} offer={o} inPipeline={inboxUrls.has(o.url)} />
            ))}
          </div>
          {fresh.length > 6 && (
            <Link href="/explore" className="mt-3 inline-flex items-center text-sm text-muted transition hover:text-brand max-sm:min-h-[44px]">
              See all {fresh.length} →
            </Link>
          )}
        </Section>
      )}

      {allClear && (
        <div className="mt-8 rounded-2xl border border-border bg-surface/30 px-6 py-10 text-center">
          <Sparkles className="mx-auto size-6 text-brand" />
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            Nothing needs you right now. Run a <Link href="/explore" className="text-brand hover:underline">free scan</Link> to surface this week&apos;s roles, or check your <Link href="/pipeline" className="text-brand hover:underline">pipeline</Link>.
          </p>
        </div>
      )}
    </div>
  );
}

function Section({ icon: Icon, title, hint, children }: { icon: React.ComponentType<{ className?: string }>; title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
        <Icon className="size-4 shrink-0 text-brand" />
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">{title}</h2>
        <span className="text-xs text-faint">· {hint}</span>
      </div>
      {children}
    </section>
  );
}
