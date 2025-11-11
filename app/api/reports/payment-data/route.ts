import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forbiddenResponse, requireAdmin, requireUser, unauthorizedResponse } from "@/lib/auth";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    const user = await requireUser();
    return user ? forbiddenResponse() : unauthorizedResponse();
  }

  const settings = await prisma.setting.findFirst({ orderBy: { id: "asc" } });
  if (!settings) {
    return NextResponse.json({ error: "Settings not configured" }, { status: 404 });
  }

  const dues = await prisma.due.findMany({
    where: { tenure: settings.tenure },
    include: {
      user: {
        select: {
          name: true,
          userId: true,
          email: true,
          category: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const categories = await prisma.user.findMany({
    distinct: ["category"],
    select: { category: true }
  });

  const members = await prisma.user.groupBy({ by: ["category"], _count: true });
  const paidMembers = await prisma.due.groupBy({
    by: ["userId"],
    where: { tenure: settings.tenure }
  });

  const users = await prisma.user.findMany({
    where: { id: { in: paidMembers.map((entry) => entry.userId) } },
    select: { category: true }
  });

  const membersInCategory: Record<string, number> = {};
  members.forEach((entry) => {
    membersInCategory[entry.category] = entry._count;
  });

  const financialMembers: Record<string, number> = {};
  users.forEach((entry) => {
    financialMembers[entry.category] = (financialMembers[entry.category] ?? 0) + 1;
  });

  categories.forEach((entry) => {
    membersInCategory[entry.category] = membersInCategory[entry.category] ?? 0;
    financialMembers[entry.category] = financialMembers[entry.category] ?? 0;
  });

  return NextResponse.json({
    dues: dues.map((due) => ({
      name: due.user.name,
      tenure: due.tenure,
      amount: due.amount.toString(),
      ref: due.ref,
      createdAt: due.createdAt,
      userId: due.user.userId,
      email: due.user.email,
      category: due.user.category
    })),
    membersInCategory,
    financialMembers
  });
}
