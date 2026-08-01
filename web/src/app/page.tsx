import type { Metadata } from "next";
import { LandingExperience } from "@/components/landing/landing-experience";

// The public marketing landing page at `/`. AppShell renders bare on `/` (see
// app-shell.tsx), so this page owns its full chrome. It reads ZERO career-ops
// user files, so it looks identical hosted (Vercel, no data) or local. The
// dashboard home lives at /today.
export const metadata: Metadata = {
  title: "CareerPilot — stop applying, start landing",
  description:
    "Your open-source AI job-search co-pilot. Scans the market, scores every role against your real CV, and writes the tailored application — you just hit send. Runs entirely on your machine. Zero cloud.",
};

export default function LandingPage() {
  return <LandingExperience />;
}
