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

    const previous = await repo.getEngagement(id);
    const updated = await repo.updateEngagement(id, updates);

    // Audit log key lifecycle transitions
    let action = "update_engagement";
    if (updates.status && updates.status !== previous?.status) {
      action = `transition_to_${updates.status}`;
    } else if (updates.versions && updates.versions.length > (previous?.versions.length || 0)) {
      action = "submit_deliverable_version";
    } else if (updates.agreed_terms) {
      action = "confirm_licensing_agreement";
    }

    await repo.logAuditEvent({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor_role: updates.status === "accepted" || updates.status === "declined" ? "creator" : "brand",
      actor_id: updates.status === "accepted" || updates.status === "declined" ? updated.creator_id : "brand_user",
      action,
      entity_type: "engagement",
      entity_id: id,
      details: {
        new_status: updated.status,
        versions_count: updated.versions.length,
        revision_rounds_used: updated.revision_rounds_used,
      },
    });

    return NextResponse.json({ ok: true, engagement: updated });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to update engagement" }, { status: 500 });
  }
}
