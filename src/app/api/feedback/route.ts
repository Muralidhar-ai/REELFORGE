import { NextRequest, NextResponse } from "next/server";
import {
  FeedbackEntry,
  readFeedback,
  addFeedback,
  updateFeedbackStatus,
} from "@/lib/data/feedbackStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { type, subject, message, rating, email, page, role } = body;

    if (!type || !subject || !message) {
      return NextResponse.json(
        { error: "type, subject, and message are required" },
        { status: 400 }
      );
    }

    const validTypes = ["bug", "feature", "general", "praise"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid feedback type" }, { status: 400 });
    }

    if (message.trim().length < 5) {
      return NextResponse.json(
        { error: "Message must be at least 5 characters" },
        { status: 400 }
      );
    }

    const entry: FeedbackEntry = {
      id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      subject: subject.trim().slice(0, 120),
      message: message.trim().slice(0, 2000),
      rating: rating ? Math.min(5, Math.max(1, Number(rating))) : undefined,
      email: email?.trim() || undefined,
      page: page?.trim() || undefined,
      role: role?.trim() || undefined,
      createdAt: new Date().toISOString(),
      status: "new",
    };

    const saved = addFeedback(entry);

    return NextResponse.json({ success: true, id: saved.id, feedback: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const allFeedback = readFeedback();
    const results = status
      ? allFeedback.filter((f) => f.status === status)
      : allFeedback;

    return NextResponse.json({
      feedback: results,
      total: results.length,
      counts: {
        new: allFeedback.filter((f) => f.status === "new").length,
        reviewed: allFeedback.filter((f) => f.status === "reviewed").length,
        resolved: allFeedback.filter((f) => f.status === "resolved").length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    const updated = updateFeedbackStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, entry: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
