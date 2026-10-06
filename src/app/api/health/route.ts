import { NextResponse } from "next/server";

export async function GET() {
  const useLocalData = process.env.USE_LOCAL_DATA !== "false";
  const dataSource = useLocalData ? "local" : "supabase";

  const hasGroqKey = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 0);
  const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim().length > 0);

  let aiStatus = "fallback";
  if (hasGroqKey) {
    aiStatus = "groq-live";
  } else if (hasAnthropicKey) {
    aiStatus = "anthropic-live";
  }

  return NextResponse.json({
    ok: true,
    data_source: dataSource,
    ai: aiStatus,
  });
}
