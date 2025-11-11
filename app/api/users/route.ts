import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createUserSchema } from "@/lib/validators";
import { forbiddenResponse, requireAdmin, requireUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    const user = await requireUser();
    return user ? forbiddenResponse() : unauthorizedResponse();
  }

  const page = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const take = Number(request.nextUrl.searchParams.get("take") ?? "20");
  const skip = (Math.max(page, 1) - 1) * Math.max(take, 1);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        userId: true,
        category: true,
        level: true,
        phone: true,
        isAdmin: true,
        createdAt: true
      }
    }),
    prisma.user.count()
  ]);

  return NextResponse.json({ users, total, page, take });
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    const user = await requireUser();
    return user ? forbiddenResponse() : unauthorizedResponse();
  }

  const json = await request.json();
  const parsed = createUserSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const password = await bcrypt.hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      userId: parsed.data.userId,
      category: parsed.data.category,
      level: parsed.data.level ?? null,
      phone: parsed.data.phone ?? null,
      password,
      isAdmin: parsed.data.isAdmin ?? false
    }
  });

  return NextResponse.json({ user }, { status: 201 });
}
