"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Check, Plus, X } from "lucide-react";
import { loadSchedule, saveSchedule, type ScanSchedule, type ScanTime } from "@/lib/scan-schedule";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Client-only scan scheduling: pick days + a time. Persisted to localStorage.
// The web app can't run a cron itself (no daemon), so this records the user's
// intent and surfaces the next run; the desktop launcher / OS scheduler reads it.
export function ScanScheduler() {
  const [sched, setSched] = useState<ScanSchedule | null>(null);
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setSched(loadSchedule()); }, []);

  if (!sched) return null;

  function update(patch: Partial<ScanSchedule>) {
    setSched((s) => {
      const next = { ...s!, ...patch };
      saveSchedule(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      return next;
    });
  }

  function toggleDay(d: number) {
    const days = sched!.days.includes(d) ? sched!.days.filter((x) => x !== d) : [...sched!.days, d].sort();
    update({ days });
  }

  const fmt = (t: ScanTime) => `${String(t.hour).padStart(2, "0")}:${String(t.minute).padStart(2, "0")}`;

  function setTime(i: number, value: string) {
    const [h, m] = value.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return;
    const times = sched!.times.map((t, idx) => (idx === i ? { hour: h, minute: m } : t));
    update({ times });
  }

  function addTime() {
    // Seed a new slot an hour after the latest one (wrapping), so it doesn't
    // collide with an existing time and get de-duped away on save.
    const last = sched!.times[sched!.times.length - 1] ?? { hour: 8, minute: 0 };
    update({ times: [...sched!.times, { hour: (last.hour + 1) % 24, minute: last.minute }] });
  }

  function removeTime(i: number) {
    const times = sched!.times.filter((_, idx) => idx !== i);
    update({ times: times.length ? times : [{ hour: 9, minute: 0 }] }); // never leave zero times
  }

  const timesLabel = sched.times.length ? sched.times.map(fmt).join(", ") : "no time";
  const daysLabel = sched.days.length === 0
    ? "no days"
    : sched.days.length === 7
      ? "every day"
      : sched.days.map((d) => DAY_NAMES[d].slice(0, 3)).join(", ");

  return (
    <details
      className="group mt-4 max-w-xl overflow-hidden rounded-xl border border-border bg-surface/30"
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-2 px-4 py-3 transition-colors hover:bg-surface-hover">
        <CalendarClock className="size-4 shrink-0 text-brand" />
        <span className="text-sm font-medium">Automatic scans</span>
        <span className="ml-1 text-xs text-faint">
          {sched.enabled ? `${daysLabel} · ${timesLabel}` : "off"}
        </span>
        {saved && <Check className="size-3.5 text-green-500" />}
      </summary>

      <div className="border-t border-border px-4 py-4 space-y-4">
        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={sched.enabled}
            onChange={(e) => update({ enabled: e.target.checked })}
            className="size-4 accent-[var(--color-brand)]"
          />
          Enable scheduled scans
        </label>

        <div className={sched.enabled ? "" : "pointer-events-none opacity-50"}>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-faint">Days</p>
          <div className="flex gap-1.5">
            {DAY_LABELS.map((label, d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                aria-label={DAY_NAMES[d]}
                aria-pressed={sched.days.includes(d)}
                className={
                  sched.days.includes(d)
                    ? "size-9 rounded-full bg-brand text-sm font-medium text-brand-foreground transition-colors"
                    : "size-9 rounded-full border border-border text-sm text-muted transition-colors hover:border-brand/40"
                }
              >
                {label}
              </button>
            ))}
          </div>

          <p className="mb-2 mt-4 text-xs font-medium uppercase tracking-wide text-faint">Times</p>
          <div className="flex flex-wrap gap-2">
            {sched.times.map((t, i) => (
              <div key={i} className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface pl-3 pr-1 py-1">
                <input
                  type="time"
                  value={fmt(t)}
                  onChange={(e) => setTime(i, e.target.value)}
                  className="bg-transparent text-sm outline-none"
                />
                {sched.times.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTime(i)}
                    aria-label={`Remove ${fmt(t)}`}
                    className="rounded-md p-1 text-faint transition-colors hover:bg-surface-hover hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addTime}
              className="inline-flex items-center gap-1 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted transition-colors hover:border-brand/40 hover:text-foreground"
            >
              <Plus className="size-3.5" /> Add time
            </button>
          </div>
        </div>

        <p className="text-xs text-faint">
          Runs the free company scan on your machine at each time you add. Keep CareerPilot open, or wire this schedule to your OS scheduler for background runs.
        </p>
      </div>
    </details>
  );
}
