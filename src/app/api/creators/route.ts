import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/lib/data";
import { CreatorFilterParams } from "@/lib/data/repo";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const params: CreatorFilterParams = {
      search: searchParams.get("search") || undefined,
      specialization: searchParams.getAll("specialization"),
      skills: searchParams.getAll("skills"),
      tools: searchParams.getAll("tools"),
      content_types: searchParams.getAll("content_types"),
      formats: searchParams.getAll("formats"),
      style_tags: searchParams.getAll("style_tags"),
      availability: (searchParams.get("availability") as "available" | "busy") || undefined,
      verifiedOnly: searchParams.get("verifiedOnly") === "true",
      safeForPaidAds: searchParams.get("safeForPaidAds") === "true",
      sort: (searchParams.get("sort") as "relevance" | "most_verified" | "most_portfolio") || "relevance",
    };

    const result = await repo.listCreators(params);
    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to fetch creators" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const creator = await req.json();
    if (!creator || !creator.id) {
      return NextResponse.json({ ok: false, error: "Creator data with id is required" }, { status: 400 });
    }
    const updated = await repo.upsertCreator(creator);
    return NextResponse.json({ ok: true, creator: updated });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to update creator" }, { status: 500 });
  }
}

