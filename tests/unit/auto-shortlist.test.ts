import { describe, it, expect } from "vitest";
import { generateAutoShortlist } from "../../src/lib/agent/autoShortlist";
import { Creator, Brief, PortfolioItem, ToolLicense } from "../../src/lib/types";

describe("Auto-Shortlist Agent", () => {
  const sampleBrief: Brief = {
    id: "brief_test",
    brand_name: "Test Brand",
    title: "Sneaker Reel",
    objective: "15s vertical video ad for sneaker launch",
    idea_text: "Liquid neon flow",
    content_type: "video",
    style_tags: ["photoreal", "cinematic"],
    format: "9:16",
    deliverables: "1x 9:16 video",
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
  };

  const creatorFit: Creator = {
    id: "cr_fit",
    name: "Qualified Director",
    headline: "Commercial AI Director",
    bio: "Bio",
    avatar_url: "/avatar.jpg",
    location: "Bengaluru",
    availability: "available",
    reviewed: true,
    specialization: ["Product Commercials"],
    skills: ["prompt engineering"],
    tools: ["Runway", "ComfyUI"],
    content_types: ["video"],
    formats: ["9:16"],
    style_tags: ["photoreal", "cinematic"],
    verification_level: "platform_reviewed",
  };

  const creatorUnsuitable: Creator = {
    id: "cr_unsuitable",
    name: "Animation Specialist",
    headline: "2D Animator",
    bio: "Bio",
    avatar_url: "/avatar2.jpg",
    location: "Mumbai",
    availability: "available",
    reviewed: false,
    specialization: ["Explainer Motion"],
    skills: ["character animation"],
    tools: ["After Effects"],
    content_types: ["animation"], // mismatch: brief is video
    formats: ["16:9"],
    style_tags: ["2d"],
    verification_level: "self_declared",
  };

  const samplePortfolio: PortfolioItem[] = [
    {
      id: "port_1",
      creator_id: "cr_fit",
      title: "Sneaker Flow",
      description: "Liquid simulation",
      media_type: "video",
      media_url: "/seed/sneaker_916.mp4",
      thumbnail_url: "/seed/thumb.jpg",
      alt_text: "Sneaker",
      aspect_ratio: "9:16",
      content_type: "video",
      style_tags: ["photoreal"],
      tools_used: [{ tool: "Runway", plan: "Unlimited Commercial" }],
      generation_count: 5,
      proof_url: "https://runwayml.com/generation/audit",
      brand_work: true,
      year: 2026,
      workflow_steps: [],
    },
  ];

  const sampleLicenses: ToolLicense[] = [
    {
      tool: "Runway",
      plan: "Unlimited Commercial",
      commercial_use: "allowed",
      notes: "Commercial rights",
      source_url: "https://runwayml.com",
      last_checked: "2026-10-01",
    },
    {
      tool: "ComfyUI",
      plan: "Open Weights",
      commercial_use: "allowed",
      notes: "Allowed",
      source_url: "https://github.com",
      last_checked: "2026-10-01",
    },
  ];

  it("proposes suitable candidates with evidence and separates unsuitable candidates", () => {
    const proposal = generateAutoShortlist(
      sampleBrief,
      [creatorFit, creatorUnsuitable],
      samplePortfolio,
      sampleLicenses
    );

    expect(proposal.candidates.length).toBe(1);
    expect(proposal.candidates[0].creator.id).toBe("cr_fit");
    expect(proposal.candidates[0].matchScore).toBeGreaterThanOrEqual(70);
    expect(proposal.candidates[0].evidenceItems.length).toBeGreaterThan(0);

    expect(proposal.unsuitable.length).toBe(1);
    expect(proposal.unsuitable[0].creator.id).toBe("cr_unsuitable");
    expect(proposal.unsuitable[0].disqualificationReasons.some((r) => r.includes("Content type"))).toBe(true);

    expect(proposal.selectionCriteria.length).toBeGreaterThan(0);
    expect(proposal.nextSteps.length).toBeGreaterThan(0);
  });
});
