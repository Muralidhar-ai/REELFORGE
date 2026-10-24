import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/lib/data";

export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get("entityId") || undefined;
    const actorRole = searchParams.get("actorRole") || undefined;

    const events = await repo.listAuditEvents({ entityId, actorRole });
    return NextResponse.json({ ok: true, events });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to fetch audit events" },
      { status: 500 }
    );
  }
}
