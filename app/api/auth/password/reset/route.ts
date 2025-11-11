import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/lib/validators";

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  const limited = checkRateLimit(request, "auth:password-reset", 8, 60_000);
  if (limited) {
    return limited;
  }

  const json = await request.json();
  const parsed = resetPasswordSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { token, email, password } = parsed.data;
  const record = await prisma.passwordReset.findUnique({
    where: {
      email_token: {
        email,
        token
      }
    }
  });

  if (!record) {
    return NextResponse.json({ error: "Invalid password reset token." }, { status: 400 });
  }

  const isExpired = !record.createdAt || Date.now() - new Date(record.createdAt).getTime() > ONE_HOUR_IN_MS;
  if (isExpired) {
    await prisma.passwordReset.deleteMany({ where: { email } });
    return NextResponse.json({ error: "Password reset token expired." }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      rememberToken: null
    }
  });

  await prisma.passwordReset.deleteMany({ where: { email } });

  return NextResponse.json({ message: "Password reset successful." });
}
