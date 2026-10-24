import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth/service";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const { user, session } = await AuthService.authenticate(email, password, role);

    // Determine target redirect url based on role
    let redirectUrl = "/";
    if (user.role === "creator") {
      redirectUrl = "/creator/dashboard";
    } else if (user.role === "brand") {
      redirectUrl = "/brand/dashboard";
    } else if (user.role === "admin") {
      redirectUrl = "/admin";
    }

    // Set HTTP-only session cookie
    const cookieStore = await cookies();
    cookieStore.set("rf_session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return NextResponse.json({
      ok: true,
      user,
      redirectUrl,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Authentication failed." },
      { status: 401 }
    );
  }
}
