import { describe, it, expect } from "vitest";
import { computeMatchScore, computeBriefQualityScore } from "../../src/lib/scoring";
import { evaluateCreatorSafety, evaluateItemSafety } from "../../src/lib/safety";
import { Creator, Brief, PortfolioItem, ToolLicense } from "../../src/lib/types";

describe("Match Scoring Logic", () => {
  const sampleCreator: Creator = {
    id: "cr_test",
    name: "Test Creator",
    headline: "AI Filmmaker",
    bio: "Bio",
    avatar_url: "/avatar.jpg",
    location: "Bengaluru",
    availability: "available",
    reviewed: true,
    specialization: ["Product ads"],
    skills: ["prompt engineering", "product visualization", "color grading"],
    tools: ["Runway", "ComfyUI", "DaVinci Resolve"],
    content_types: ["video"],
    formats: ["9:16", "16:9"],
    style_tags: ["photoreal", "cinematic"],
    verification_level: "platform_reviewed",
  };

  const sampleBrief: Brief = {
    id: "brief_test",
    brand_name: "Test Brand",
    title: "Sneaker Reel",
    objective: "Create a 15s Gen Z vertical video reel for sneaker launch",
    idea_text: "Idea text",
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
    quality_score: 90,
    status: "published",
  };

  it("returns high match score for matching content type, tools, skills, and format", () => {
    const result = computeMatchScore(sampleCreator, sampleBrief, []);
    expect(result.matched).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("returns score 0 if content_type does not match", () => {
    const mismatchBrief: Brief = { ...sampleBrief, content_type: "animation" };
    const result = computeMatchScore(sampleCreator, mismatchBrief, []);
    expect(result.score).toBe(0);
    expect(result.matched).toBe(false);
  });
});

describe("Commercial-Use Safety Check", () => {
  const licenses: ToolLicense[] = [
    { tool: "Runway", plan: "Pro", commercial_use: "allowed", notes: "", source_url: "", last_checked: "" },
    { tool: "Kling", plan: "Standard", commercial_use: "restricted", notes: "", source_url: "", last_checked: "" },
    { tool: "Pika", plan: "Free", commercial_use: "not_allowed", notes: "", source_url: "", last_checked: "" },
  ];

  const greenItem: PortfolioItem = {
    id: "p1",
    creator_id: "cr1",
    title: "Green Item",
    description: "",
    media_type: "video",
    media_url: "/v.mp4",
    thumbnail_url: "/v.mp4",
    alt_text: "",
    aspect_ratio: "9:16",
    content_type: "video",
    style_tags: [],
    tools_used: [{ tool: "Runway", plan: "Pro" }],
    generation_count: 10,
    brand_work: true,
    year: 2026,
    workflow_steps: [],
  };

  const amberItem: PortfolioItem = {
    ...greenItem,
    tools_used: [{ tool: "Kling", plan: "Standard" }],
  };

  const redItem: PortfolioItem = {
    ...greenItem,
    tools_used: [{ tool: "Pika", plan: "Free" }],
  };

  it("evaluates items correctly as green, amber, red", () => {
    expect(evaluateItemSafety(greenItem, licenses).status).toBe("green");
    expect(evaluateItemSafety(amberItem, licenses).status).toBe("amber");
    expect(evaluateItemSafety(redItem, licenses).status).toBe("red");
  });

  it("evaluates creator safety as green only if all items are green", () => {
    expect(evaluateCreatorSafety([greenItem], licenses).status).toBe("green");
    expect(evaluateCreatorSafety([greenItem, amberItem], licenses).status).toBe("amber");
    expect(evaluateCreatorSafety([redItem], licenses).status).toBe("red");
  });
});

describe("Brief Quality Score Meter", () => {
  it("calculates quality score accurately and returns hints for missing items", () => {
    const incompleteBrief: Partial<Brief> = {
      content_type: "video",
      format: "9:16",
    };
    const result = computeBriefQualityScore(incompleteBrief);
    expect(result.score).toBeLessThan(100);
    expect(result.hints.length).toBeGreaterThan(0);
  });
});
