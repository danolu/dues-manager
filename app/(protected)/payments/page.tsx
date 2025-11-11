import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PaymentActions } from "@/components/payment-actions";
import { Card } from "@/components/ui/card";

export default async function PaymentsPage() {
  const user = await getSessionUser();
  if (!user) {
    return null;
  }

  const settings = await prisma.setting.findFirst({ orderBy: { id: "asc" } });
  if (!settings) {
    return <Card className="text-center italic font-medium">Settings not configured.</Card>;
  }

  const due = await prisma.due.findFirst({
    where: {
      userId: user.id,
      tenure: settings.tenure
    }
  });

  return <PaymentActions duePaid={Boolean(due)} dueAmount={settings.dueAmount.toString()} />;
}
