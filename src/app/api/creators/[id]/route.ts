import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/lib/data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const creator = await repo.getCreator(id);
    if (!creator) {
      return NextResponse.json({ ok: false, error: "Creator not found" }, { status: 404 });
    }
    const portfolio = await repo.listPortfolioItems(id);
    const licenses = await repo.listToolLicenses();

    return NextResponse.json({ ok: true, creator, portfolio, licenses });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to fetch creator" }, { status: 500 });
  }
}
