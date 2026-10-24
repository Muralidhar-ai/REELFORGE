import { describe, it, expect } from "vitest";
import { validateDeliverable } from "../../src/lib/deliveryCheck";
import { Brief, ToolLicense } from "../../src/lib/types";

describe("Technical Delivery Check Engine", () => {
  const sampleBrief: Brief = {
    id: "brief_test",
    brand_name: "Test Brand",
    title: "Sneaker 9:16 Video",
    objective: "15s vertical video ad",
    idea_text: "Liquid sneaker animation",
    content_type: "video",
    style_tags: ["photoreal", "cinematic"],
    format: "9:16",
    duration_sec: 15,
    deliverables: "1x 9:16 MP4 video",
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

  const sampleLicenses: ToolLicense[] = [
    {
      tool: "Runway",
      plan: "Unlimited Commercial",
      commercial_use: "allowed",
      notes: "Allowed for commercial advertising",
      source_url: "https://runwayml.com",
      last_checked: "2026-10-01",
    },
    {
      tool: "ComfyUI",
      plan: "Open Weights Apache 2.0",
      commercial_use: "allowed",
      notes: "Fully allowed",
      source_url: "https://github.com/comfyanonymous/ComfyUI",
      last_checked: "2026-10-01",
    },
  ];

  it("passes all checks when format, duration, aspect ratio, and tool licensing match", () => {
    const result = validateDeliverable(
      {
        mediaUrl: "/seed/sneaker_916.mp4",
        aspectRatio: "9:16",
        durationSec: 15,
        workflowGraphAttached: true,
        toolsUsed: ["Runway", "ComfyUI"],
        note: "Rendered 9:16 liquid sneaker animation using ComfyUI node pipeline",
      },
      sampleBrief,
      sampleLicenses
    );

    expect(result.overall_status).toBe("passed");
    expect(result.checks.every((c) => c.passed)).toBe(true);
    expect(result.corrective_actions.length).toBe(0);
  });

  it("fails aspect ratio check when 16:9 video is submitted for a 9:16 brief", () => {
    const result = validateDeliverable(
      {
        mediaUrl: "/seed/sneaker_169.mp4",
        aspectRatio: "16:9",
        durationSec: 15,
        workflowGraphAttached: true,
        toolsUsed: ["Runway"],
        note: "Submitted 16:9 widescreen render",
      },
      sampleBrief,
      sampleLicenses
    );

    expect(result.overall_status).toBe("failed");
    const ratioCheck = result.checks.find((c) => c.name === "Aspect Ratio Compliance");
    expect(ratioCheck?.passed).toBe(false);
    expect(result.corrective_actions.some((a) => a.includes("9:16"))).toBe(true);
  });

  it("flags non-video containers when brief specifies video deliverables", () => {
    const result = validateDeliverable(
      {
        mediaUrl: "/seed/sneaker_thumb.jpg",
        aspectRatio: "9:16",
        workflowGraphAttached: true,
      },
      sampleBrief,
      sampleLicenses
    );

    expect(result.overall_status).toBe("failed");
    const formatCheck = result.checks.find((c) => c.name === "Media Format Specification");
    expect(formatCheck?.passed).toBe(false);
  });
});
