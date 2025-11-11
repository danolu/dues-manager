import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEmailVerificationToken } from "@/lib/token";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    const payload = await verifyEmailVerificationToken(token);

    await prisma.user.update({
      where: { id: payload.userId },
      data: {
        emailVerifiedAt: new Date()
      }
    });

    return NextResponse.redirect(new URL("/dashboard?verified=1", request.url));
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }
}
