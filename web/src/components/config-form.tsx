"use client";

import { useEffect, useState } from "react";
import {
  Check,
  KeyRound,
  TerminalSquare,
  Terminal,
  Loader2,
  CircleDashed,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/cn";

type Cli = {
  id: string;
  name: string;
  run: string;
  url: string;
  installed: boolean;
  path: string | null;
};

type Mode = "cli" | "key" | "manual";

const PROVIDERS = [
  { id: "anthropic", label: "Anthropic (Claude)" },
  { id: "openai", label: "OpenAI" },
  { id: "google", label: "Google (Gemini)" },
  { id: "openrouter", label: "OpenRouter" },
] as const;

const STORAGE_KEY = "career-ops:config";

export function ConfigForm() {
  const [mode, setMode] = useState<Mode>("cli");
  const [clis, setClis] = useState<Cli[] | null>(null);
  const [cliId, setCliId] = useState<string>("");
  const [provider, setProvider] = useState("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [apiModel, setApiModel] = useState("[REDACTED]");
  const [logos, setLogos] = useState(true);
  const [saved, setSaved] = useState(false);

  // Load saved prefs
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const v = JSON.parse(raw);
        if (v.mode === "cli" || v.mode === "key") setMode(v.mode);
        if (v.cliId) setCliId(v.cliId);
        if (v.provider) setProvider(v.provider);
        if (v.apiKey) setApiKey(v.apiKey);
        if (v.apiModel) setApiModel(v.apiModel);
        if (typeof v.logos === "boolean") setLogos(v.logos);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Detect installed CLIs
  useEffect(() => {
    fetch("/api/clis")
      .then((r) => r.json())
      .then((d) => {
        const list: Cli[] = d.clis ?? [];
        setClis(list);
        // auto-select first installed if nothing chosen yet, and PERSIST it —
        // otherwise the UI shows a CLI as selected while localStorage stays
        // empty, and evaluate silently degrades to zero-token CV Fit (#cli-persist).
        setCliId((prev) => {
          const next = prev || list.find((c) => c.installed)?.id || "";
          if (!prev && next) persist({ cliId: next });
          return next;
        });
      })
      .catch(() => setClis([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Single source of truth for writing config → localStorage. Merges over
  // whatever is already stored so a partial update (just cliId, just logos)
  // never clobbers the rest. Selecting a CLI / toggling a setting persists
  // immediately — there is no separate "Save" step to forget.
  function persist(patch: Record<string, unknown>) {
    let cur: Record<string, unknown> = {};
    try { cur = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { /* ignore */ }
    const cfg = { ...cur, ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  }

  function selectCli(id: string) {
    setCliId(id);
    persist({ mode: "cli", cliId: id });
  }

  function save() {
    const cfg: Record<string, unknown> = { mode, cliId, provider, logos };
    if (mode === "key" && apiKey) {
      cfg.cliId = "api";
      cfg.apiKey = apiKey;
      cfg.apiModel = apiModel;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const installed = clis?.filter((c) => c.installed) ?? [];

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-2xl tracking-tight text-landing">Config</h1>
      <p className="mt-1 text-sm text-muted">
        Run CareerPilot on your own AI, right on your computer. Your CV and data never leave your machine.
      </p>

      {/* Engine mode */}
      <label className="mt-8 mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        AI Engine
      </label>
      <div className="grid gap-2 sm:grid-cols-3">
        <ModeCard
          active={mode === "cli"}
          onClick={() => { setMode("cli"); persist({ mode: "cli" }); }}
          icon={Terminal}
          title="Use an AI tool you have"
          hint="Recommended"
        />
        <ModeCard
          active={mode === "key"}
          onClick={() => { setMode("key"); persist({ mode: "key" }); }}
          icon={KeyRound}
          title="Paste an AI key"
          hint="Anthropic API"
        />
        <ModeCard
          active={mode === "manual"}
          onClick={() => setMode("manual")}
          icon={TerminalSquare}
          title="No setup needed"
          hint="Coming soon"
          disabled
        />
      </div>

      <div className="mt-6">
        {mode === "cli" && (
          <div>
            <p className="mb-1 text-sm text-muted">
              CareerPilot uses an AI tool you already have — signed in, your own usage, nothing to paste.
            </p>
            <p className="mb-3 text-xs text-faint">Works with Claude Code, Codex, OpenCode and more — free ones work great.</p>
            {clis === null ? (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Loader2 className="size-4 animate-spin" /> Checking what&apos;s on your computer…
              </div>
            ) : installed.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-surface/30 p-4 text-sm text-muted">
                No AI tool yet? Free options like <span className="text-foreground">OpenCode</span> with Qwen or GLM work great.{" "}
                <a href="https://career-ops.org/docs/free-ai-engine" target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-brand hover:underline">
                  Get one free <ExternalLink className="size-3" />
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                {clis.map((c) => {
                  const selected = c.id === cliId;
                  // A .cmd/.bat is an npm batch shim; the streamed evaluate prompt
                  // can misbehave through `cmd /c`. Native .exe is preferred and
                  // findBin now ranks it first — surface when we still landed on a shim.
                  const isShim = !!c.path && /\.(cmd|bat)$/i.test(c.path);
                  return (
                    <div
                      key={c.id}
                      className={cn(
                        "rounded-xl border px-4 py-3 text-sm transition-colors",
                        selected
                          ? "border-brand/50 bg-brand-soft"
                          : c.installed
                            ? "border-border bg-surface/50"
                            : "border-border/60 bg-surface/20",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {c.installed ? (
                          <Check className="size-4 shrink-0 text-emerald-400" />
                        ) : (
                          <CircleDashed className="size-4 shrink-0 text-faint" />
                        )}
                        <button
                          type="button"
                          disabled={!c.installed}
                          onClick={() => selectCli(c.id)}
                          className={cn(
                            "flex flex-1 items-center gap-2 text-left max-sm:min-h-[44px]",
                            c.installed ? "" : "cursor-default",
                          )}
                        >
                          <span
                            className={cn(
                              "font-medium",
                              selected ? "text-foreground" : c.installed ? "" : "text-muted",
                            )}
                          >
                            {c.name}
                          </span>
                          <span className="font-mono text-xs text-faint">{c.run}</span>
                        </button>
                        {!c.installed && (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex shrink-0 items-center justify-center gap-1 text-xs text-brand hover:underline max-sm:min-h-[44px]"
                          >
                            Install <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                      {c.installed && c.path && (
                        <div className="mt-2 space-y-1 pl-7">
                          <p className="break-all font-mono text-[11px] leading-relaxed text-faint">
                            {c.path}
                          </p>
                          {isShim && (
                            <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-amber-600 dark:text-amber-400">
                              <AlertTriangle className="mt-px size-3 shrink-0" />
                              This is an npm shim (.cmd). Evaluate may return no output through it.
                              If you also have a native <span className="font-mono">.exe</span> install, prefer that.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {installed.length === 0 && (
                  <p className="rounded-xl border border-dashed border-border bg-surface/30 p-4 text-xs text-muted">
                    No supported CLI found on your PATH. Install one (e.g. Claude Code, Gemini CLI, OpenCode) to get started.
                  </p>
                )}
                <p className="mt-2 text-[11px] leading-relaxed text-faint">
                  Best on <span className="text-muted">Claude Code</span> (live progress, the agentic apply + AI search,
                  reliable evaluation persistence). Other CLIs work for the core flows with reduced features.
                </p>
              </div>
            )}
          </div>
        )}

        {mode === "key" && (
          <div className="space-y-5">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Anthropic API key
              </label>
              <p className="mb-2 text-xs text-faint">
                Bring your own Anthropic key — CareerPilot calls the Claude API directly from your local server.
                Get one at{" "}
                <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-brand hover:underline">
                  console.anthropic.com <ExternalLink className="size-3" />
                </a>
              </p>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-…"
                autoComplete="off"
                className="w-full rounded-xl border border-border bg-surface/60 px-4 py-2.5 font-mono text-sm outline-none transition-colors placeholder:text-faint focus:border-brand/50"
              />
              <p className="mt-2 text-xs text-faint">
                Stored only in this browser — sent only to Anthropic through your own machine.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Model
              </label>
              <input
                type="text"
                value={apiModel}
                onChange={(e) => setApiModel(e.target.value)}
                placeholder="[REDACTED]"
                autoComplete="off"
                className="w-full rounded-xl border border-border bg-surface/60 px-4 py-2.5 font-mono text-sm outline-none transition-colors placeholder:text-faint focus:border-brand/50"
              />
              <p className="mt-2 text-xs text-faint">
                Any Claude model ID. Defaults to Sonnet if left as-is.
              </p>
            </div>
            <div className="rounded-xl border border-dashed border-border bg-surface/30 p-3 text-xs text-muted">
              The API path evaluates and scores postings, but it can&apos;t write reports or update your
              tracker (no file access). For full persistence, use an installed CLI like Claude Code.
            </div>
          </div>
        )}

        {mode === "manual" && (
          <div className="rounded-xl border border-dashed border-border bg-surface/30 p-4 text-sm text-muted">
            The easiest way in — no keys, nothing to set up. On the roadmap.
          </div>
        )}
      </div>

      {/* Appearance / privacy */}
      <label className="mt-8 mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        Appearance
      </label>
      <button
        type="button"
        onClick={() => setLogos((v) => { const nv = !v; persist({ logos: nv }); return nv; })}
        className="flex w-full items-center justify-between gap-4 rounded-xl border border-border bg-surface/50 px-4 py-3 text-left transition-colors hover:bg-surface-hover"
      >
        <span className="min-w-0">
          <span className="block text-sm font-medium text-foreground">Company logos</span>
          <span className="mt-0.5 block text-xs text-faint">
            Show each company&apos;s real logo. Fetched once through your local server and cached on
            disk — only the employer domain is sent to a third party. Off = colored monograms only.
          </span>
        </span>
        <span
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full transition-colors",
            logos ? "bg-brand" : "bg-surface-hover",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform",
              logos ? "translate-x-[1.375rem]" : "translate-x-0.5",
            )}
          />
        </span>
      </button>

      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-200 max-sm:min-h-[44px]"
        >
          {saved ? <Check className="size-4" /> : null}
          {saved ? "Saved" : "Save config"}
        </button>
        <span className="text-xs text-faint">Saved automatically as you choose · stored only in this browser</span>
      </div>
    </div>
  );
}

function ModeCard({
  active,
  onClick,
  icon: Icon,
  title,
  hint,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  hint: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col gap-1.5 rounded-xl border px-4 py-3 text-left transition-colors",
        disabled
          ? "cursor-not-allowed border-border bg-surface/30 opacity-55"
          : active
            ? "border-brand/50 bg-brand-soft"
            : "border-border bg-surface/50 hover:bg-surface-hover",
      )}
    >
      <Icon className={cn("size-4", active && !disabled ? "text-brand" : "text-muted")} />
      <span className="text-sm font-medium text-foreground">{title}</span>
      <span className="text-xs text-faint">{hint}</span>
    </button>
  );
}
