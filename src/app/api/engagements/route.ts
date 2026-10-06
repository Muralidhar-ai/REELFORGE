import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/lib/data";
import { Engagement } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const briefId = searchParams.get("brief_id") || undefined;
    const creatorId = searchParams.get("creator_id") || undefined;

    const engagements = await repo.listEngagements({ briefId, creatorId });
    return NextResponse.json({ ok: true, engagements });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to list engagements" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brief_id, creator_id } = body;

    if (!brief_id || !creator_id) {
      return NextResponse.json({ ok: false, error: "brief_id and creator_id are required" }, { status: 400 });
    }

    const engagement: Engagement = {
      id: `eng_${Date.now()}`,
      brief_id,
      creator_id,
      status: "invited",
      revision_rounds_used: 0,
      versions: [],
      updated_at: new Date().toISOString(),
    };

    const created = await repo.createEngagement(engagement);
    return NextResponse.json({ ok: true, engagement: created });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to create engagement" }, { status: 500 });
  }
}
