import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import Anthropic from "@anthropic-ai/sdk";
import {
  CONTENT_TYPES,
  FORMATS,
  SKILLS,
  TOOLS,
  STYLE_TAGS,
  USAGE_RIGHTS,
} from "@/lib/vocab";

const sampleSneakerBrief = {
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
  budget_range: "",
  deadline: "",
  required_tools: ["Runway", "ComfyUI", "DaVinci Resolve"],
  required_skills: ["prompt engineering", "product visualization", "color grading", "ComfyUI workflows"],
  usage_rights: ["paid_ads", "organic_social"],
  territory: "Worldwide",
  usage_duration_months: 12,
  exclusivity: true,
  ai_disclosure_required: true,
  max_revision_rounds: 2,
  fallback: true,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ideaText = body.idea_text || "";

    const groqKey = process.env.GROQ_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    const prompt = `You are an expert creative producer. Analyze this campaign idea and return ONLY a JSON object structuring it into a brief.

Allowed controlled vocabularies:
- content_type: ${JSON.stringify(CONTENT_TYPES)}
- format: ${JSON.stringify(FORMATS)}
- style_tags: ${JSON.stringify(STYLE_TAGS)} (choose at most 4)
- required_skills: ${JSON.stringify(SKILLS)}
- required_tools: ${JSON.stringify(TOOLS)}
- usage_rights: ${JSON.stringify(USAGE_RIGHTS)}

JSON fields to return:
- brand_name (string)
- title (string)
- objective (string, >= 30 chars)
- content_type (one from list)
- style_tags (array of strings from list)
- format (one from list)
- platform_preset (string e.g. "instagram_reel")
- duration_sec (number or omitted)
- deliverables (string)
- required_tools (array of strings from list)
- required_skills (array of strings from list)
- usage_rights (array of strings from list)
- territory (string)
- usage_duration_months (number)
- exclusivity (boolean)
- ai_disclosure_required (boolean)
- max_revision_rounds (number)

DO NOT include budget or deadline fields. Return ONLY valid JSON, no markdown formatting.

User Idea: ${ideaText}`;

    // 1. Try Groq API if GROQ_API_KEY is provided
    if (groqKey && groqKey.trim().length > 0) {
      try {
        const groq = new Groq({ apiKey: groqKey });
        const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model,
          response_format: { type: "json_object" },
        });

        const contentText = completion.choices[0]?.message?.content || "";
        const parsed = JSON.parse(contentText);
        return NextResponse.json({ ok: true, brief: { ...parsed, idea_text: ideaText, fallback: false } });
      } catch (e) {
        console.warn("Groq API error, attempting fallback", e);
      }
    }

    // 2. Try Anthropic API if ANTHROPIC_API_KEY is provided
    if (anthropicKey && anthropicKey.trim().length > 0) {
      try {
        const anthropic = new Anthropic({ apiKey: anthropicKey });
        const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";

        const message = await anthropic.messages.create({
          model,
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        });

        const contentText = message.content[0]?.type === "text" ? message.content[0].text : "";
        const cleanedJsonStr = contentText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanedJsonStr);
        return NextResponse.json({ ok: true, brief: { ...parsed, idea_text: ideaText, fallback: false } });
      } catch (e) {
        console.warn("Anthropic API error, using offline fallback", e);
      }
    }

    // 3. Return offline sample brief
    return NextResponse.json({ ok: true, brief: sampleSneakerBrief, notice: "Showing an offline sample" });
  } catch (err) {
    return NextResponse.json({ ok: true, brief: sampleSneakerBrief, notice: "Showing an offline sample" });
  }
}
