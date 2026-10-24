import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/lib/data";
import { generateAutoShortlist } from "@/lib/agent/autoShortlist";

export const revalidate = 0;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: briefId } = await params;
    const brief = await repo.getBrief(briefId);
    if (!brief) {
      return NextResponse.json({ ok: false, error: "Brief not found" }, { status: 404 });
    }

    const { creators } = await repo.listCreators({});
    const portfolio = await repo.listPortfolioItems();
    const licenses = await repo.listToolLicenses();

    const proposal = generateAutoShortlist(brief, creators, portfolio, licenses);

    // Audit log this agent proposal
    await repo.logAuditEvent({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor_role: "system",
      actor_id: "auto_shortlist_agent",
      action: "generate_auto_shortlist",
      entity_type: "brief",
      entity_id: briefId,
      details: {
        candidates_count: proposal.candidates.length,
        unsuitable_count: proposal.unsuitable.length,
        top_candidate: proposal.candidates[0]?.creator.name,
      },
    });

    return NextResponse.json({ ok: true, proposal });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to generate auto shortlist" },
      { status: 500 }
    );
  }
}
