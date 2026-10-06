import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/lib/data";
import { PortfolioItem } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get("creator_id") || undefined;
    const items = await repo.listPortfolioItems(creatorId);
    return NextResponse.json({ ok: true, portfolio: items });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to list portfolio items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.creator_id) {
      return NextResponse.json({ ok: false, error: "title and creator_id are required" }, { status: 400 });
    }

    const newItem: PortfolioItem = {
      ...body,
      id: body.id || `port_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    const created = await repo.addPortfolioItem(newItem);
    return NextResponse.json({ ok: true, item: created });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to add portfolio item" }, { status: 500 });
  }
}
