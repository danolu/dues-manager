import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, unauthorizedResponse } from "@/lib/auth";

export async function GET() {
  const session = await requireUser();
  if (!session) {
    return unauthorizedResponse();
  }

  const settings = await prisma.setting.findFirst({ orderBy: { id: "asc" } });
  if (!settings) {
    return NextResponse.json({ error: "Settings not configured" }, { status: 404 });
  }

  const userDue = await prisma.due.findFirst({
    where: { userId: session.id, tenure: settings.tenure }
  });

  return NextResponse.json({
    paidDue: Boolean(userDue),
    dueAmount: settings.dueAmount.toString(),
    paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY ?? "",
    tenure: settings.tenure
  });
}
