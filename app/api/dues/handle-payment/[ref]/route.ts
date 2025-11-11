import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentPaymentSettings, verifyPaystackPayment } from "@/lib/payment";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireUser, unauthorizedResponse } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  const limited = checkRateLimit(request, "dues:handle-payment", 10, 60_000);
  if (limited) {
    return limited;
  }

  const session = await requireUser();
  if (!session) {
    return unauthorizedResponse();
  }

  try {
    const { ref } = await params;

    const existing = await prisma.due.findUnique({ where: { ref } });
    if (existing) {
      return NextResponse.json({ error: "Duplicate payment reference." }, { status: 400 });
    }

    const paymentSettings = await getCurrentPaymentSettings();
    const paymentData = await verifyPaystackPayment(ref);

    if (paymentData.amount !== paymentSettings.chargeAmount) {
      return NextResponse.json(
        {
          error: `Payment amount mismatch. Expected: ${paymentSettings.chargeAmount}, Got: ${paymentData.amount}`
        },
        { status: 400 }
      );
    }

    await prisma.due.create({
      data: {
        userId: session.id,
        tenure: paymentSettings.tenure,
        amount: BigInt(Math.round(paymentSettings.amount)),
        ref
      }
    });

    return NextResponse.json({ message: "success" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to process payment" },
      { status: 400 }
    );
  }
}
