import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, unauthorizedResponse } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validators";

export async function PATCH(request: NextRequest) {
  const session = await requireUser();
  if (!session) {
    return unauthorizedResponse();
  }

  const json = await request.json();
  const parsed = updateProfileSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.id },
    data: {
      phone: parsed.data.phone
    }
  });

  return NextResponse.json({ user });
}
