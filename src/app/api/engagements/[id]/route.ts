import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/lib/data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const engagement = await repo.getEngagement(id);
    if (!engagement) {
      return NextResponse.json({ ok: false, error: "Engagement not found" }, { status: 404 });
    }
    const brief = await repo.getBrief(engagement.brief_id);
    const creator = await repo.getCreator(engagement.creator_id);

    return NextResponse.json({ ok: true, engagement, brief, creator });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to fetch engagement" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await req.json();

    const updated = await repo.updateEngagement(id, updates);
    return NextResponse.json({ ok: true, engagement: updated });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to update engagement" }, { status: 500 });
  }
}
