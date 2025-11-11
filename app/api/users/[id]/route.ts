import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { updateUserSchema } from "@/lib/validators";
import { forbiddenResponse, requireAdmin, requireUser, unauthorizedResponse } from "@/lib/auth";

function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) {
    const user = await requireUser();
    return user ? forbiddenResponse() : unauthorizedResponse();
  }

  const id = parseId((await params).id);
  if (!id) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      userId: true,
      category: true,
      level: true,
      phone: true,
      isAdmin: true,
      emailVerifiedAt: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) {
    const user = await requireUser();
    return user ? forbiddenResponse() : unauthorizedResponse();
  }

  const id = parseId((await params).id);
  if (!id) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const json = await request.json();
  const parsed = updateUserSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data.password
    ? { ...parsed.data, password: await bcrypt.hash(parsed.data.password, 10) }
    : parsed.data;

  const user = await prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      userId: data.userId,
      category: data.category,
      level: data.level ?? null,
      phone: data.phone ?? null,
      isAdmin: data.isAdmin ?? false,
      ...(data.password ? { password: data.password } : {})
    }
  });

  return NextResponse.json({ user });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) {
    const user = await requireUser();
    return user ? forbiddenResponse() : unauthorizedResponse();
  }

  const id = parseId((await params).id);
  if (!id) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
