import { NextRequest } from "next/server";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { careerOpsRoot } from "@/lib/career-ops";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const url: string = (body.url ?? "").trim();
  if (!url || !/^https?:\/\//i.test(url)) {
    return Response.json({ error: "url required" }, { status: 400 });
  }

  const root = careerOpsRoot();

  // Fetch JD text and write to a temp file so jd-skill-gap.mjs can read it
  let tmpFile: string | null = null;
  try {
    const jdRes = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await jdRes.text();
    // Strip tags for a plain-text JD approximation
    const text = html
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 20000);
    tmpFile = path.join(os.tmpdir(), `careerpilot-jd-${Date.now()}.txt`);
    fs.writeFileSync(tmpFile, text, "utf8");
  } catch {
    return Response.json({ error: "Could not fetch job posting — try pasting the JD text instead." }, { status: 422 });
  }

  const skillGap = await new Promise<Record<string, unknown>>((resolve) => {
    const script = path.join(root, ["jd-skill-gap", "mjs"].join("."));
    const child = spawn("node", [script, tmpFile!], { cwd: root });
    let out = "";
    child.stdout.on("data", (d: Buffer) => (out += d.toString()));
    child.on("close", () => {
      try { resolve(JSON.parse(out)); }
      catch { resolve({ error: "parse failed", raw: out.slice(0, 400) }); }
    });
    child.on("error", () => resolve({ error: "jd-skill-gap.mjs not found" }));
  });

  // Clean up temp file
  try { if (tmpFile) fs.unlinkSync(tmpFile); } catch { /* ignore */ }

  let latex: string | null = null;
  try {
    latex = fs.readFileSync(path.join(root, "templates", "cv-template.tex"), "utf8");
  } catch { /* template absent */ }

  return Response.json({ skillGap, latex });
}
