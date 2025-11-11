import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { VerifyEmailPanel } from "@/components/verify-email-panel";

export default async function VerifyEmailPage() {
  const session = await getSessionUser();
  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) {
    return <div className="bg-card border border-line rounded-xl p-6 text-center italic font-medium text-rose-500">User not found.</div>;
  }

  if (user.emailVerifiedAt) {
    return <div className="bg-card border border-line rounded-xl p-6 text-center italic font-medium text-green-600">Email is already verified.</div>;
  }

  return <VerifyEmailPanel />;
}
