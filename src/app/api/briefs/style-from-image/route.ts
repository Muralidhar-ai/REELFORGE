import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import Anthropic from "@anthropic-ai/sdk";
import { STYLE_TAGS } from "@/lib/vocab";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({
        ok: true,
        style_tags: ["photoreal", "cinematic", "neon", "luxury"],
        fallback: true,
        notice: "Showing an offline sample",
      });
    }

    const groqKey = process.env.GROQ_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mediaType = file.type || "image/jpeg";

    const prompt = `Analyze this reference image and choose at most 4 style tags that best describe its visual aesthetic.
Select ONLY from this allowed list: ${JSON.stringify(STYLE_TAGS)}.
Return ONLY a valid JSON object: { "style_tags": ["tag1", "tag2"] }`;

    // 1. Try Groq Vision API
    if (groqKey && groqKey.trim().length > 0) {
      try {
        const groq = new Groq({ apiKey: groqKey });
        const model = process.env.GROQ_VISION_MODEL || "llama-3.2-11b-vision-preview";

        const completion = await groq.chat.completions.create({
          model,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mediaType};base64,${base64}`,
                  },
                },
              ],
            },
          ],
          response_format: { type: "json_object" },
        });

        const contentText = completion.choices[0]?.message?.content || "";
        const parsed = JSON.parse(contentText);
        const validTags = (parsed.style_tags || [])
          .filter((st: string) => STYLE_TAGS.includes(st as any))
          .slice(0, 4);

        return NextResponse.json({
          ok: true,
          style_tags: validTags.length > 0 ? validTags : ["photoreal", "cinematic"],
          fallback: false,
        });
      } catch (e) {
        console.warn("Groq Vision API error, attempting fallback", e);
      }
    }

    // 2. Try Anthropic Vision API
    if (anthropicKey && anthropicKey.trim().length > 0) {
      try {
        const anthropic = new Anthropic({ apiKey: anthropicKey });
        const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";

        const response = await anthropic.messages.create({
          model,
          max_tokens: 300,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mediaType as any,
                    data: base64,
                  },
                },
                { type: "text", text: prompt },
              ],
            },
          ],
        });

        const contentText = response.content[0]?.type === "text" ? response.content[0].text : "";
        const cleanedJsonStr = contentText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanedJsonStr);

        const validTags = (parsed.style_tags || [])
          .filter((st: string) => STYLE_TAGS.includes(st as any))
          .slice(0, 4);

        return NextResponse.json({
          ok: true,
          style_tags: validTags.length > 0 ? validTags : ["photoreal", "cinematic"],
          fallback: false,
        });
      } catch (e) {
        console.warn("Anthropic Vision API error, using offline fallback", e);
      }
    }

    // 3. Fallback
    return NextResponse.json({
      ok: true,
      style_tags: ["photoreal", "cinematic", "neon", "luxury"],
      fallback: true,
      notice: "Showing an offline sample",
    });
  } catch (err) {
    return NextResponse.json({
      ok: true,
      style_tags: ["photoreal", "cinematic", "neon", "luxury"],
      fallback: true,
      notice: "Showing an offline sample",
    });
  }
}
