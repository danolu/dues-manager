import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { updateSettingSchema } from "@/lib/validators";

export async function GET() {
  const session = await requireUser();
  if (!session) {
    return unauthorizedResponse();
  }

  const settings = await prisma.setting.findFirst({ orderBy: { id: "asc" } });
  return NextResponse.json({
    settings: settings
      ? {
          ...settings,
          dueAmount: settings.dueAmount.toString()
        }
      : null
  });
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    const user = await requireUser();
    return user ? forbiddenResponse() : unauthorizedResponse();
  }

  const json = await request.json();
  const parsed = updateSettingSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const payload = {
    ...parsed.data,
    ...(parsed.data.dueDeadline !== undefined
      ? { dueDeadline: parsed.data.dueDeadline ? new Date(parsed.data.dueDeadline) : null }
      : {})
  };

  const current = await prisma.setting.findFirst({ orderBy: { id: "asc" } });

  const settings = current
    ? await prisma.setting.update({ where: { id: current.id }, data: payload })
    : await prisma.setting.create({
        data: {
          tenure: payload.tenure ?? "",
          name: payload.name ?? "",
          dueAmount: payload.dueAmount ?? 0,
          logo: payload.logo ?? null,
          favicon: payload.favicon ?? null,
          website: payload.website ?? null,
          tagline: payload.tagline ?? null,
          description: payload.description ?? null,
          email: payload.email ?? null,
          idName: payload.idName ?? null,
          phone: payload.phone ?? null,
          address: payload.address ?? null,
          dueDeadline: payload.dueDeadline,
          isRegistrationOpen: payload.isRegistrationOpen ?? false
        }
      });

  return NextResponse.json({
    settings: {
      ...settings,
      dueAmount: settings.dueAmount.toString()
    }
  });
}
