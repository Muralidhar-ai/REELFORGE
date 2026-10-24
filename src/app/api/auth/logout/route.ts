import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth/service";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("rf_session")?.value;

    if (token) {
      AuthService.destroySession(token);
      cookieStore.delete("rf_session");
    }

    return NextResponse.json({ ok: true, message: "Logged out successfully." });
  } catch (err: any) {
    return NextResponse.json({ ok: true, message: "Session cleared." });
  }
}
