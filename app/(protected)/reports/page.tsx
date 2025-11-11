import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { StatsCard } from "@/components/ui/stats-card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ReportsPage() {
  const user = await getSessionUser();

  if (!user?.isAdmin) {
    return <Card className="text-center italic font-medium text-rose-500">Admin access required.</Card>;
  }

  const settings = await prisma.setting.findFirst({ orderBy: { id: "asc" } });
  const dues = settings
    ? await prisma.due.findMany({
        where: { tenure: settings.tenure },
        include: { user: true },
        orderBy: { createdAt: "desc" }
      })
    : [];

  const totalUsers = await prisma.user.count();
  const paidCount = dues.length;
  const totalRevenue = dues.reduce((sum, due) => sum + Number(due.amount), 0);
  const paymentRate = totalUsers > 0 ? (paidCount / totalUsers) * 100 : 0;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard 
          label="Total Revenue" 
          value={`₦${totalRevenue.toLocaleString()}`} 
          description={`From ${paidCount} payments`}
          className="border-green-200 bg-green-50/20"
        />
        <StatsCard 
          label="Payment Rate" 
          value={`${paymentRate.toFixed(1)}%`}
          description={`${paidCount} of ${totalUsers} users`}
          trend={{ value: "Target: 100%", isUpward: true }}
        />
        <StatsCard 
          label="Remaining" 
          value={`₦${((totalUsers - paidCount) * Number(settings?.dueAmount ?? 0)).toLocaleString()}`}
          description="Potential collections"
          className="border-amber-200 bg-amber-50/20"
        />
      </div>

      {dues.length > 0 ? (
        <Table 
          title="Payment Reports" 
          headers={["Name", "User ID", "Category", "Amount", "Reference"]}
          className="mb-0"
        >
          {dues.map((due) => (
            <tr key={due.id} className="hover:bg-gray-50 transition-colors">
              <td className="p-4 text-sm font-semibold">{due.user.name}</td>
              <td className="p-4 text-sm text-text/80 font-mono">{due.user.userId}</td>
              <td className="p-4 text-sm text-text/80 italic">{due.user.category}</td>
              <td className="p-4 text-sm font-bold text-green-600">{due.amount.toString()}</td>
              <td className="p-4 text-sm text-text/60 font-mono">{due.ref}</td>
            </tr>
          ))}
        </Table>
      ) : (
        <EmptyState 
          title="No payments found" 
          description="It looks like nobody has made a payment for this tenure yet. Once they do, they will appear here."
        />
      )}
    </>
  );
}
