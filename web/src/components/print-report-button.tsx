"use client";

import { Printer } from "lucide-react";

export function PrintReportButton() {
  return (
    <button
      onClick={() => window.print()}
      title="Export report as PDF"
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-brand/40 hover:text-brand print:hidden"
    >
      <Printer className="size-3.5" /> Export PDF
    </button>
  );
}
