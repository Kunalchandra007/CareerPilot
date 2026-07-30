import { NextRequest } from "next/server";
import { buildCvDiff } from "@/lib/cv-diff";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const company = (req.nextUrl.searchParams.get("company") ?? "").trim();
  if (!company) return Response.json({ error: "company required" }, { status: 400 });
  const diff = buildCvDiff(company);
  return Response.json(diff);
}
