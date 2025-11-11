import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireUser, unauthorizedResponse } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { changePasswordSchema } from "@/lib/validators";

export async function PATCH(request: NextRequest) {
  const limited = checkRateLimit(request, "users:password-change", 10, 60_000);
  if (limited) {
    return limited;
  }

  const session = await requireUser();
  if (!session) {
    return unauthorizedResponse();
  }

  const json = await request.json();
  const parsed = changePasswordSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const matches = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!matches) {
    return NextResponse.json({ error: "The provided password does not match our records." }, { status: 400 });
  }

  const password = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password } });

  return NextResponse.json({ success: true });
}
