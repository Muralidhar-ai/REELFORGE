import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/lib/data";
import { validateDeliverable } from "@/lib/deliveryCheck";

export const revalidate = 0;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: engagementId } = await params;
    const body = await request.json();

    const engagement = await repo.getEngagement(engagementId);
    if (!engagement) {
      return NextResponse.json({ ok: false, error: "Engagement not found" }, { status: 404 });
    }

    const brief = await repo.getBrief(engagement.brief_id);
    if (!brief) {
      return NextResponse.json({ ok: false, error: "Associated brief not found" }, { status: 404 });
    }

    const licenses = await repo.listToolLicenses();

    const checkResult = validateDeliverable(
      {
        mediaUrl: body.media_url || "",
        aspectRatio: body.aspect_ratio,
        mimeType: body.mime_type,
        durationSec: body.duration_sec,
        workflowGraphAttached: body.workflow_graph_attached,
        toolsUsed: body.tools_used,
        note: body.note,
      },
      brief,
      licenses
    );

    // Audit log
    await repo.logAuditEvent({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor_role: "system",
      actor_id: "delivery_check_engine",
      action: "validate_deliverable",
      entity_type: "engagement",
      entity_id: engagementId,
      details: {
        overall_status: checkResult.overall_status,
        failed_count: checkResult.checks.filter((c) => !c.passed).length,
      },
    });

    return NextResponse.json({ ok: true, check_result: checkResult });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to validate deliverable" },
      { status: 500 }
    );
  }
}
