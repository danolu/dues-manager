import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const limited = checkRateLimit(request, "auth:register", 5, 60_000);
  if (limited) {
    return limited;
  }

  const json = await request.json();
  const parsed = registerSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const settings = await prisma.setting.findFirst({ orderBy: { id: "asc" } });
  if (settings && !settings.isRegistrationOpen) {
    return NextResponse.json({ error: "Registration is closed." }, { status: 403 });
  }

  const password = await bcrypt.hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      userId: parsed.data.userId,
      category: parsed.data.category,
      phone: parsed.data.phone ?? null,
      isAdmin: false,
      password
    },
    select: {
      id: true,
      name: true,
      email: true,
      userId: true,
      category: true
    }
  });

  return NextResponse.json({ user }, { status: 201 });
}
