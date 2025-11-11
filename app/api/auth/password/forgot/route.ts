import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validators";
import { generateRandomToken } from "@/lib/token";

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  const limited = checkRateLimit(request, "auth:password-forgot", 5, 60_000);
  if (limited) {
    return limited;
  }

  const json = await request.json();
  const parsed = forgotPasswordSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    await prisma.passwordReset.deleteMany({ where: { email } });
    const token = generateRandomToken();

    await prisma.passwordReset.create({
      data: {
        email,
        token,
        createdAt: new Date()
      }
    });

    const resetUrl = `${request.nextUrl.origin}/reset-password/${token}?email=${encodeURIComponent(email)}`;

    try {
      await sendPasswordResetEmail(email, resetUrl);
    } catch {
      return NextResponse.json({ error: "Unable to send reset email right now." }, { status: 500 });
    }
  }

  return NextResponse.json({ message: "If an account exists, a reset link has been generated." });
}

export async function DELETE() {
  const cutoff = new Date(Date.now() - ONE_HOUR_IN_MS);
  const result = await prisma.passwordReset.deleteMany({
    where: {
      createdAt: {
        lt: cutoff
      }
    }
  });

  return NextResponse.json({ deleted: result.count });
}
