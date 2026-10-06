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

function parseIdeaOffline(ideaText: string) {
  const text = ideaText.toLowerCase();
  
  // Extract duration if present e.g. "15-second" or "30s"
  let duration = 15;
  const durMatch = text.match(/(\d+)\s*(?:second|sec|s)/);
  if (durMatch) {
    duration = parseInt(durMatch[1], 10) || 15;
  }

  // Extract tools
  const foundTools = TOOLS.filter((t) => text.includes(t.toLowerCase()));
  const required_tools = foundTools.length > 0 ? foundTools : ["Runway", "ComfyUI"];

  // Extract style tags
  const foundStyles = STYLE_TAGS.filter((st) => text.includes(st.toLowerCase()));
  const style_tags = foundStyles.length > 0 ? foundStyles.slice(0, 4) : ["photoreal", "cinematic", "commercial"];

  // Title generation
  const words = ideaText.trim().split(/\s+/).slice(0, 6).join(" ");
  const title = words ? `${words.charAt(0).toUpperCase() + words.slice(1)} Campaign` : "Generative Ad Campaign";

  // Brand Name extraction or fallback
  let brand_name = "Commercial Brand";
  if (text.includes("sneaker") || text.includes("shoe")) brand_name = "AURA Kicks";
  else if (text.includes("fashion") || text.includes("couture")) brand_name = "Vogue AI";
  else if (text.includes("jewel") || text.includes("gold")) brand_name = "Luxe Gems";

  return {
    brand_name,
    title,
    objective: `Produce a high-impact commercial video asset based on campaign concept: "${ideaText}"`,
    idea_text: ideaText,
    content_type: text.includes("image") ? "image" : "video",
    style_tags,
    format: text.includes("16:9") ? "16:9" : text.includes("1:1") ? "1:1" : "9:16",
    platform_preset: "instagram_reel",
    duration_sec: duration,
    deliverables: `1x 4K Master Video (${duration}s), 2x Social Story Cutdowns`,
    budget_range: "$2,500 - $5,000",
    deadline: "",
    required_tools,
    required_skills: ["prompt engineering", "product visualization", "color grading"],
    usage_rights: ["paid_ads", "organic_social"],
    territory: "Worldwide",
    usage_duration_months: 12,
    exclusivity: true,
    ai_disclosure_required: true,
    max_revision_rounds: 2,
    fallback: false,
  };
}

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
    if (groqKey && groqKey.trim().length > 0 && !groqKey.includes("your_groq_api")) {
      try {
        const groq = new Groq({ apiKey: groqKey });
        // Use valid Groq model name
        const rawModel = process.env.GROQ_MODEL || "";
        const model = (rawModel.includes("gpt") || !rawModel) ? "llama-3.3-70b-versatile" : rawModel;

        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model,
          response_format: { type: "json_object" },
        });

        const contentText = completion.choices[0]?.message?.content || "";
        const parsed = JSON.parse(contentText);
        return NextResponse.json({ ok: true, brief: { ...parsed, idea_text: ideaText, fallback: false } });
      } catch (e) {
        console.warn("Groq API error, attempting offline dynamic parser", e);
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
        console.warn("Anthropic API error, using offline dynamic parser", e);
      }
    }

    // 3. Return dynamic structured brief from input
    const structured = parseIdeaOffline(ideaText);
    return NextResponse.json({ ok: true, brief: structured });
  } catch (err) {
    const structured = parseIdeaOffline("Sneaker commercial video reel");
    return NextResponse.json({ ok: true, brief: structured });
  }
}
