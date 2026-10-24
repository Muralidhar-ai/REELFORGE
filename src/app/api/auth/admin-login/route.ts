import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth/service";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Administrative email and password are required." },
        { status: 400 }
      );
    }

    const { user, session } = await AuthService.authenticateAdmin(email, password);

    // Set HTTP-only session cookie
    const cookieStore = await cookies();
    cookieStore.set("rf_session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({
      ok: true,
      user,
      redirectUrl: "/admin",
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Administrative authentication failed." },
      { status: 401 }
    );
  }
}
