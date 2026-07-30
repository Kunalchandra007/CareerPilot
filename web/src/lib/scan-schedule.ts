"use client";

// Scan schedule persisted in localStorage. Days are 0=Sun…6=Sat.
// A schedule can carry MULTIPLE times of day (e.g. a morning + an evening scan);
// `times` is the source of truth. `hour`/`minute` are kept only as a legacy
// migration path — an older single-time schedule is folded into `times` on load.
export type ScanTime = { hour: number; minute: number };
export type ScanSchedule = {
  days: number[];
  times: ScanTime[];
  enabled: boolean;
  /** @deprecated legacy single-time fields; migrated into `times` on load */
  hour?: number;
  minute?: number;
};

const KEY = "career-ops:scan-schedule";
const DEFAULT: ScanSchedule = { days: [1, 3, 5], times: [{ hour: 9, minute: 0 }], enabled: false };

// De-dupe + sort times so the picker and the "next run" label stay stable.
function normalizeTimes(times: ScanTime[]): ScanTime[] {
  const seen = new Set<string>();
  const out: ScanTime[] = [];
  for (const t of times) {
    if (typeof t?.hour !== "number" || typeof t?.minute !== "number") continue;
    const key = `${t.hour}:${t.minute}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ hour: t.hour, minute: t.minute });
  }
  out.sort((a, b) => a.hour - b.hour || a.minute - b.minute);
  return out;
}

export function loadSchedule(): ScanSchedule {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    const merged = { ...DEFAULT, ...raw } as ScanSchedule;
    // Migrate legacy single-time schedules ({hour, minute}, no `times`) so
    // existing users keep their configured slot instead of snapping to default.
    let times: ScanTime[] = Array.isArray(raw.times) ? raw.times : [];
    if (times.length === 0 && typeof raw.hour === "number" && typeof raw.minute === "number") {
      times = [{ hour: raw.hour, minute: raw.minute }];
    }
    merged.times = normalizeTimes(times.length ? times : DEFAULT.times);
    delete merged.hour;
    delete merged.minute;
    return merged;
  } catch {
    return DEFAULT;
  }
}

export function saveSchedule(s: ScanSchedule): void {
  const clean: ScanSchedule = {
    days: s.days,
    times: normalizeTimes(s.times),
    enabled: s.enabled,
  };
  localStorage.setItem(KEY, JSON.stringify(clean));
}
