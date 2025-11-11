import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";

export default async function DashboardPage() {
  const user = await getSessionUser();
  const settings = await prisma.setting.findFirst({ orderBy: { id: "asc" } });

  if (!user || !settings) {
    return <Card className="text-center italic font-medium">Settings are not configured yet.</Card>;
  }

  const due = await prisma.due.findFirst({ where: { userId: user.id, tenure: settings.tenure } });
  const currentUser = await prisma.user.findUnique({ 
    where: { id: user.id }, 
    select: { name: true, userId: true, emailVerifiedAt: true } 
  });

    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard 
          label="Current Tenure" 
          value={settings.tenure} 
          description="Active collection period"
        />
        <StatsCard 
          label="Due Amount" 
          value={`₦${settings.dueAmount.toString()}`}
          description="Standard member fee"
        />
        <StatsCard 
          label="Payment Status" 
          value={due ? "Paid" : "Pending"} 
          description={due ? "Payment confirmed" : "Action required"}
          className={due ? "border-green-200 bg-green-50/30" : "border-amber-200 bg-amber-50/30"}
        />
      </div>

      <Card title="Account Summary" className="p-8 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-4 bg-gray-50 rounded-lg space-y-2 border border-line/30">
            <p className="text-[10px] font-bold uppercase text-text/40 tracking-widest italic">Identity</p>
            <p className="font-bold text-text/80">{currentUser?.name}</p>
            <p className="text-xs text-text/60 italic">ID: {currentUser?.userId}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg space-y-2 border border-line/30">
            <p className="text-[10px] font-bold uppercase text-text/40 tracking-widest italic">Verification</p>
            <p className={`font-bold ${currentUser?.emailVerifiedAt ? "text-green-600" : "text-rose-500"}`}>
              {currentUser?.emailVerifiedAt ? "Verified" : "Unverified"}
            </p>
            <p className="text-xs text-text/60 italic">Email status</p>
          </div>
        </div>
      </Card>
    </>
}
