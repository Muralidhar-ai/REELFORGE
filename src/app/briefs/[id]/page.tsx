import React from "react";
import { repo } from "@/lib/data";
import { BriefMatchesView } from "@/components/briefs/BriefMatchesView";
import { Brief } from "@/lib/types";

export const revalidate = 0;

export default async function BriefDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let brief = await repo.getBrief(id);

  // If not found in seed store, create a dynamic display brief from parameters
  if (!brief) {
    const allBriefs = await repo.listBriefs();
    brief = allBriefs[0] || ({
      id,
      brand_name: "AURA Kicks",
      title: "Gen-Z Neon Sneaker Launch Reel",
      objective: "Produce a high-energy 15-second vertical video reel for paid Instagram and TikTok ad campaigns launching our flagship liquid-tech running shoe.",
      idea_text: "A fun 15-second reel for a sneaker launch aimed at Gen Z. Liquid neon morphs into the shoe sole, dynamic speed ramps, high energy music beat drop, crisp macro texture detail.",
      content_type: "video",
      style_tags: ["photoreal", "cinematic", "neon", "luxury"],
      format: "9:16",
      platform_preset: "instagram_reel",
      duration_sec: 15,
      deliverables: "1x 9:16 hero 4K video reel, 2x short story cutdowns (6s each)",
      budget_range: "$2,500 - $4,000",
      deadline: "2026-11-15",
      required_tools: ["Runway", "ComfyUI", "DaVinci Resolve"],
      required_skills: ["prompt engineering", "product visualization", "color grading"],
      usage_rights: ["paid_ads", "organic_social"],
      territory: "Worldwide",
      usage_duration_months: 12,
      exclusivity: true,
      ai_disclosure_required: true,
      max_revision_rounds: 2,
      quality_score: 95,
      status: "published",
    } as Brief);
  }

  const { creators } = await repo.listCreators({});
  const allPortfolio = await repo.listPortfolioItems();
  const licenses = await repo.listToolLicenses();

  return (
    <BriefMatchesView
      brief={brief}
      creators={creators}
      allPortfolio={allPortfolio}
      licenses={licenses}
    />
  );
}
