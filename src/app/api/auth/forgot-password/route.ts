import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Email address is required." },
        { status: 400 }
      );
    }

    const result = await AuthService.requestPasswordReset(email);

    return NextResponse.json({
      ok: true,
      message: result.message,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: true, message: "If an account exists for this email address, password reset instructions have been dispatched." },
      { status: 200 }
    );
  }
}
