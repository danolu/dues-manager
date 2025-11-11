import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireUser, unauthorizedResponse } from "@/lib/auth";
import { signEmailVerificationToken } from "@/lib/token";

export async function POST(request: NextRequest) {
  const limited = checkRateLimit(request, "auth:verification-resend", 5, 60_000);
  if (limited) {
    return limited;
  }

  const session = await requireUser();
  if (!session) {
    return unauthorizedResponse();
  }

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.emailVerifiedAt) {
    return NextResponse.json({ message: "Email is already verified." });
  }

  const token = await signEmailVerificationToken({ userId: user.id, email: user.email });
  const verifyUrl = `${new URL(request.url).origin}/api/auth/email/verification/verify?token=${encodeURIComponent(token)}`;
  try {
    await sendVerificationEmail(user.email, verifyUrl);
  } catch {
    return NextResponse.json({ error: "Unable to send verification email right now." }, { status: 500 });
  }

  return NextResponse.json({ message: "Verification link sent." });
}
