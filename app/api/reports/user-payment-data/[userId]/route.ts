import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forbiddenResponse, requireAdmin, requireUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await requireAdmin();
  if (!session) {
    const user = await requireUser();
    return user ? forbiddenResponse() : unauthorizedResponse();
  }

  const userId = Number((await params).userId);
  if (!Number.isInteger(userId)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const settings = await prisma.setting.findFirst({ orderBy: { id: "asc" } });
  if (!settings) {
    return NextResponse.json({ error: "Settings not configured" }, { status: 404 });
  }

  const due = await prisma.due.findFirst({
    where: {
      tenure: settings.tenure,
      user: {
        userId
      }
    },
    include: {
      user: {
        select: {
          name: true,
          userId: true,
          email: true,
          category: true
        }
      }
    }
  });

  return NextResponse.json({
    due: due
      ? {
          name: due.user.name,
          tenure: due.tenure,
          amount: due.amount.toString(),
          ref: due.ref,
          createdAt: due.createdAt,
          userId: due.user.userId,
          email: due.user.email,
          category: due.user.category
        }
      : null
  });
}
