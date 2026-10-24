import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth/service";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("rf_session")?.value;

    const user = AuthService.validateSession(token);

    if (!user) {
      return NextResponse.json({ ok: false, user: null }, { status: 200 });
    }

    return NextResponse.json({ ok: true, user });
  } catch (err: any) {
    return NextResponse.json({ ok: false, user: null }, { status: 200 });
  }
}
