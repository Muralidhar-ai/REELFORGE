import React from "react";
import { repo } from "@/lib/data";
import { EngagementBoard } from "@/components/engagements/EngagementBoard";
import { Engagement, Brief, Creator } from "@/lib/types";

export const revalidate = 0;

export default async function EngagementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const allBriefs = await repo.listBriefs();
  const { creators: allCreators } = await repo.listCreators({});

  let engagement = await repo.getEngagement(id);
  if (!engagement) {
    engagement = {
      id,
      brief_id: allBriefs[0]?.id || "brief_1",
      creator_id: allCreators[0]?.id || "cr_1",
      status: "invited",
      revision_rounds_used: 0,
      versions: [],
      updated_at: new Date().toISOString(),
    };
  }

  let brief = await repo.getBrief(engagement.brief_id);
  if (!brief) {
    brief = allBriefs[0] || ({
      id: engagement.brief_id,
      brand_name: "AURA Kicks",
      title: "Gen-Z Neon Sneaker Launch Reel",
      objective: "Produce a high-energy 15-second vertical video reel for paid Instagram and TikTok ad campaigns launching our flagship liquid-tech running shoe.",
      idea_text: "A fun 15-second reel for a sneaker launch aimed at Gen Z.",
      content_type: "video",
      style_tags: ["photoreal", "cinematic", "neon"],
      format: "9:16",
      platform_preset: "instagram_reel",
      duration_sec: 15,
      deliverables: "1x 9:16 hero 4K video reel",
      budget_range: "$2,500 - $4,000",
      deadline: "2026-11-15",
      required_tools: ["Runway", "ComfyUI"],
      required_skills: ["prompt engineering"],
      usage_rights: ["paid_ads"],
      territory: "Worldwide",
      usage_duration_months: 12,
      exclusivity: true,
      ai_disclosure_required: true,
      max_revision_rounds: 2,
      quality_score: 95,
      status: "published",
    } as Brief);
  }

  let creator = await repo.getCreator(engagement.creator_id);
  if (!creator) {
    creator = allCreators[0] || ({
      id: engagement.creator_id,
      name: "Inbarasan",
      headline: "Generative commercial director & ComfyUI workflow specialist",
      bio: "Former VFX supervisor with 8 years in commercial production.",
      avatar_url: "/seed/avatar_dev.jpg",
      location: "Bengaluru, India",
      availability: "available",
      reviewed: true,
      specialization: ["Product ads"],
      skills: ["prompt engineering"],
      tools: ["Runway", "ComfyUI"],
      content_types: ["video"],
      formats: ["9:16"],
      style_tags: ["photoreal"],
      verification_level: "platform_reviewed",
    } as Creator);
  }

  return <EngagementBoard initialEngagement={engagement} brief={brief} creator={creator} />;
}
