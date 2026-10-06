import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/lib/data";
import { Brief } from "@/lib/types";
import { computeBriefQualityScore } from "@/lib/scoring";

export async function GET() {
  try {
    const briefs = await repo.listBriefs();
    return NextResponse.json({ ok: true, briefs });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to fetch briefs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || `brief_${Date.now()}`;

    const qualityResult = computeBriefQualityScore(body);

    const brief: Brief = {
      ...body,
      id,
      quality_score: qualityResult.score,
      status: body.status || "published",
      created_at: new Date().toISOString(),
    };

    const created = await repo.createBrief(brief);
    return NextResponse.json({ ok: true, brief: created });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to create brief" }, { status: 500 });
  }
}
