import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/lib/data";
import { ShortlistItem } from "@/lib/types";

export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: briefId } = await params;
    const shortlist = await repo.listShortlist(briefId);
    return NextResponse.json({ ok: true, shortlist });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to list shortlist" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: briefId } = await params;
    const body = await request.json();

    const { creator_id, notes, added_by = "brand" } = body;
    if (!creator_id) {
      return NextResponse.json(
        { ok: false, error: "creator_id is required" },
        { status: 400 }
      );
    }

    const item: ShortlistItem = {
      id: `shortlist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      brief_id: briefId,
      creator_id,
      notes: notes || "",
      added_by: added_by === "auto_agent" ? "auto_agent" : "brand",
      created_at: new Date().toISOString(),
    };

    const saved = await repo.addToShortlist(item);

    // Audit log
    await repo.logAuditEvent({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor_role: added_by === "auto_agent" ? "system" : "brand",
      actor_id: added_by === "auto_agent" ? "auto_agent" : "brand_user",
      action: "shortlist_creator",
      entity_type: "brief",
      entity_id: briefId,
      details: { creator_id, added_by },
    });

    return NextResponse.json({ ok: true, item: saved });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to add to shortlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: briefId } = await params;
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get("creator_id");

    if (!creatorId) {
      return NextResponse.json(
        { ok: false, error: "creator_id query param is required" },
        { status: 400 }
      );
    }

    const removed = await repo.removeFromShortlist(briefId, creatorId);

    // Audit log
    await repo.logAuditEvent({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor_role: "brand",
      actor_id: "brand_user",
      action: "remove_from_shortlist",
      entity_type: "brief",
      entity_id: briefId,
      details: { creator_id: creatorId },
    });

    return NextResponse.json({ ok: true, removed });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to remove from shortlist" },
      { status: 500 }
    );
  }
}
