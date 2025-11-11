import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, createSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const limited = checkRateLimit(request, "auth:login", 8, 60_000);
  if (limited) {
    return limited;
  }

  const json = await request.json();
  const parsed = loginSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const user = await authenticateUser(parsed.data.login, parsed.data.password);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await createSession(user);

  return NextResponse.json({ user });
}
