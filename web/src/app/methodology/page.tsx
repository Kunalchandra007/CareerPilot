import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { instrumentSerif } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "How CareerPilot scores a role — Methodology",
  description:
    "How CareerPilot evaluates a job posting: the six dimensions, the A–G report, the 4.0 apply line, and what it never does.",
};

// Self-contained methodology page. The substance mirrors the live scoring code
// (six dimensions in score-methodology.tsx, the A–G report blocks, the 4.0 line),
// so the page and the product never drift. No client JS — pure server render.

const DIMENSIONS: [string, string][] = [
  ["Match", "How well your CV maps to the role's stated requirements — the skills, the seniority, the domain."],
  ["North-star alignment", "How far this role moves you toward the career goal you set, not just whether you could do the job."],
  ["Compensation", "The offer measured against market rates. When comp isn't published, it says so — it never invents a number."],
  ["Cultural signals", "Team, values, and ways-of-working signals read out of the posting itself."],
  ["Red flags", "Ghost-job, scam, and mismatch warnings — reasons this listing might not be worth your time."],
  ["Overall", "The single holistic judgment that rolls the five above into the final 1.0–5.0 score."],
];

const BLOCKS: [string, string][] = [
  ["A", "A plain-English summary of the role — what it actually is, stripped of recruiter language."],
  ["B", "A requirement-by-requirement table matching your CV to the posting, with the gaps called out honestly."],
  ["C", "Strategy — how to position yourself for this specific role given your background."],
  ["D", "Compensation research comparing the offer to market rates for the role and location."],
  ["E", "Personalization notes — the specific angles worth leading with in your application."],
  ["F", "Interview prep — STAR stories from your own history, tailored to what this job will probe."],
  ["G", "Posting legitimacy — a check that the listing is real and current, not a scam or a ghost job."],
];

const FAQ: [string, string][] = [
  [
    "Why a single score instead of a checklist?",
    "A role is a fit or it isn't, and that judgment is holistic — a perfect skills match at a company you'd hate is not a 5. CareerPilot weighs every dimension together and commits to one number so you can triage a full pipeline at a glance, then reads the report when the number earns your attention.",
  ],
  [
    "Is the score a formula?",
    "No. The dimensions frame the judgment; they aren't summed with fixed weights. The overall score is a reasoned call, not closed-form math — which is why every report shows its work in Blocks A–G rather than just handing you a total.",
  ],
  [
    "Why 4.0 and not 3.0?",
    "Below 4.0, the honest recommendation is usually don't apply — the fit is weak enough that your time and the recruiter's are better spent elsewhere. The bar is deliberately high. Quality over quantity: a handful of well-targeted applications beats a blast of generic ones.",
  ],
  [
    "Does it ever make up compensation or claims about me?",
    "Never. When comp isn't in the posting, the report says the data is insufficient rather than guessing. And everything written on your behalf comes from your own files and what you tell it — keywords get reframed and emphasized, never fabricated.",
  ],
  [
    "Will it apply for me?",
    "No. CareerPilot drafts, prefills, and prepares — but it always stops before Submit. You review every application and send it yourself.",
  ],
];

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 max-sm:pb-24">
      <Link
        href="/pipeline"
        className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-brand"
      >
        <ArrowLeft className="size-3.5" /> Back to your pipeline
      </Link>

      <header className="mt-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          <span className="text-faint">//</span> methodology
        </p>
        <h1 className={`${instrumentSerif.className} mt-3 text-4xl leading-[1.05] text-landing md:text-5xl`}>
          How CareerPilot scores a role
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Every job CareerPilot evaluates gets one number from{" "}
          <strong className="text-foreground">1.0 to 5.0</strong> and a full report explaining it. This is what that
          number means, how it&apos;s formed, and — just as important — what CareerPilot will never do.
        </p>
      </header>

      {/* The apply line */}
      <section className="mt-10 rounded-2xl border border-brand/30 bg-brand-soft/30 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">The 4.0 line</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          <strong className="text-brand">4.0</strong> is the apply / don&apos;t-apply line. At or above it, the role is
          worth your effort. Below it, CareerPilot recommends against applying — the fit is weak enough that your time,
          and the recruiter&apos;s, is better spent elsewhere. The bar is set high on purpose: a few well-targeted
          applications beat a generic blast.
        </p>
      </section>

      {/* Dimensions */}
      <section className="mt-10">
        <h2 className={`${instrumentSerif.className} text-2xl text-landing`}>The six dimensions</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Each role is read across six dimensions. They frame the judgment — they aren&apos;t summed with fixed weights.
          The <strong className="text-foreground">Overall</strong> score is a reasoned call, not a formula.
        </p>
        <ul className="mt-5 space-y-4">
          {DIMENSIONS.map(([k, v]) => (
            <li key={k}>
              <div className="text-sm font-semibold text-foreground">{k}</div>
              <div className="mt-0.5 text-sm leading-relaxed text-muted">{v}</div>
            </li>
          ))}
        </ul>
      </section>

      {/* Report blocks */}
      <section className="mt-10">
        <h2 className={`${instrumentSerif.className} text-2xl text-landing`}>What&apos;s in every report</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          The score is the headline; the report is the reasoning. Each evaluation writes seven blocks so you can see
          exactly why a role landed where it did.
        </p>
        <ul className="mt-5 space-y-3">
          {BLOCKS.map(([k, v]) => (
            <li key={k} className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-soft text-xs font-semibold text-brand">
                {k}
              </span>
              <span className="text-sm leading-relaxed text-muted">{v}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Guarantees */}
      <section className="mt-10">
        <h2 className={`${instrumentSerif.className} text-2xl text-landing`}>What CareerPilot never does</h2>
        <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted">
          <li className="flex items-start gap-2.5">
            <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
            <span>
              <strong className="text-foreground">Never fabricates.</strong> Keywords get reframed and emphasized to fit
              a role — never invented. If a claim isn&apos;t backed by your files, it doesn&apos;t go in.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
            <span>
              <strong className="text-foreground">Never invents compensation.</strong> When the posting hides comp, the
              report says the data is insufficient rather than guessing a number.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
            <span>
              <strong className="text-foreground">Never auto-applies.</strong> It drafts, prefills, and prepares — then
              stops before Submit. You review and send every application yourself.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
            <span>
              <strong className="text-foreground">Never leaves your machine.</strong> Your CV and data stay local. Scans
              of your tracked companies cost zero tokens; only AI evaluation spends anything, and only when you ask.
            </span>
          </li>
        </ul>
      </section>

      {/* Cost */}
      <section className="mt-10 rounded-2xl border border-border bg-surface/30 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-faint">What an evaluation costs</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          A free scan of your tracked companies spends <strong className="text-foreground">zero tokens</strong> — it
          hits public job-board APIs directly. A full AI evaluation of a single role is a handful of model calls plus a
          few web lookups to confirm the posting and research comp. You always confirm the spend before it runs, and the
          estimate is drawn from your own past evaluations.
        </p>
      </section>

      {/* FAQ */}
      <section className="mt-10">
        <h2 className={`${instrumentSerif.className} text-2xl text-landing`}>FAQ</h2>
        <div className="mt-5 space-y-5">
          {FAQ.map(([q, a]) => (
            <div key={q}>
              <div className="text-sm font-semibold text-foreground">{q}</div>
              <p className="mt-1 text-sm leading-relaxed text-muted">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-12 border-t border-border pt-6">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-200"
        >
          Find roles that fit you
        </Link>
      </div>
    </div>
  );
}
