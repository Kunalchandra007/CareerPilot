import fs from "node:fs";
import path from "node:path";
import { careerOpsRoot } from "@/lib/career-ops";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return new Response("id required", { status: 400 });

  const reportsDir = path.join(careerOpsRoot(), "reports");
  let reportFile: string | null = null;
  try {
    const files = fs.readdirSync(reportsDir);
    reportFile = files.find((f) => f.startsWith(id.padStart(3, "0") + "-") && f.endsWith(".md")) ?? null;
  } catch { /* */ }

  if (!reportFile) return new Response("Report not found", { status: 404 });

  const content = fs.readFileSync(path.join(reportsDir, reportFile), "utf8");

  // Extract Machine Summary YAML block
  const yamlMatch = content.match(/```yaml\n([\s\S]*?)```/);
  if (!yamlMatch) return new Response("No machine summary found", { status: 404 });

  const yaml = yamlMatch[1];
  const get = (key: string) => yaml.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim() ?? null;

  const score = get("score");
  const company = get("company");
  const role = get("role");
  const recommend = get("recommend_apply");
  const gapsMatch = yaml.match(/key_gaps:\n((?:\s+-[^\n]+\n?)+)/);
  const gaps = gapsMatch
    ? gapsMatch[1].match(/- "?([^"\n]+)"?/g)?.map((g) => g.replace(/^- "?|"?$/g, "").trim()) ?? []
    : [];

  const applyLine = recommend === "true" ? "Recommended to apply." : recommend === "false" ? "Below the apply line — not recommended." : "";
  const gapLine = gaps.length ? `Key gaps: ${gaps.slice(0, 2).join("; ")}.` : "";

  const summary = [
    company && role ? `${company} — ${role}.` : null,
    score ? `Score ${score}/5.` : null,
    applyLine,
    gapLine,
  ]
    .filter(Boolean)
    .join(" ");

  return new Response(summary || "No summary available.", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
