import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/lib/data";
import { computeMatchScore } from "@/lib/scoring";
import { evaluateCreatorSafety } from "@/lib/safety";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const brief = await repo.getBrief(id);
    if (!brief) {
      return NextResponse.json({ ok: false, error: "Brief not found" }, { status: 404 });
    }

    const { creators } = await repo.listCreators({});
    const allPortfolio = await repo.listPortfolioItems();
    const licenses = await repo.listToolLicenses();

    const matches = creators
      .map((creator) => {
        const cPortfolio = allPortfolio.filter((p) => p.creator_id === creator.id);
        const matchResult = computeMatchScore(creator, brief, cPortfolio);
        const safetyResult = evaluateCreatorSafety(cPortfolio, licenses);

        return {
          creator,
          portfolio: cPortfolio,
          score: matchResult.score,
          matched: matchResult.matched,
          reasons: matchResult.reasons,
          missing: matchResult.missing,
          safety: safetyResult,
        };
      })
      .filter((m) => m.matched)
      .sort((a, b) => b.score - a.score);

    return NextResponse.json({ ok: true, brief, matches });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to fetch matches" }, { status: 500 });
  }
}
