import { prisma } from "@/lib/prisma";

const PAYSTACK_PERCENTAGE = 0.015;
const PAYSTACK_FLAT_FEE_KOBO = 100;

export function calculateChargeAmount(amountNaira: number): number {
  const amountInKobo = amountNaira * 100;
  return Math.round((amountInKobo * (1 + PAYSTACK_PERCENTAGE)) + PAYSTACK_FLAT_FEE_KOBO);
}

export async function getCurrentPaymentSettings() {
  const settings = await prisma.setting.findFirst({ orderBy: { id: "asc" } });
  if (!settings) {
    throw new Error("Application settings not configured.");
  }

  const amount = Number(settings.dueAmount);
  return {
    tenure: settings.tenure,
    amount,
    chargeAmount: calculateChargeAmount(amount)
  };
}

export async function verifyPaystackPayment(reference: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new Error("PAYSTACK_SECRET_KEY is missing");
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });

  const json = await response.json();

  if (!json?.status || !json?.data) {
    throw new Error("Unable to verify payment with Paystack.");
  }

  if (json.data.status !== "success") {
    throw new Error("Payment verification failed.");
  }

  return json.data as { amount: number; status: string };
}
