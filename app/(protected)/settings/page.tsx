import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/settings-form";
import { Card } from "@/components/ui/card";

export default async function SettingsPage() {
  const user = await getSessionUser();
  const settings = await prisma.setting.findFirst({ orderBy: { id: "asc" } });

  return (
    <>
      <Card
        title="Settings"
        subtitle="All users can view settings. Only admins can save changes."
      >        
        {settings ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-lg border border-line/50">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text/40">Proxy Name</p>
              <p className="font-semibold text-lg">{settings.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text/40">Active Tenure</p>
              <p className="font-semibold text-lg">{settings.tenure}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text/40">Due Amount</p>
              <p className="font-semibold text-lg text-accent">{settings.dueAmount.toString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text/40">Registration Status</p>
              <p className={`font-bold text-lg ${settings.isRegistrationOpen ? "text-green-600" : "text-rose-500"}`}>
                {settings.isRegistrationOpen ? "OPEN" : "CLOSED"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-rose-500 font-medium italic">No settings configured.</p>
        )}
      </Card>
      {user?.isAdmin ? (
        <SettingsForm
          initial={
            settings
              ? {
                  tenure: settings.tenure,
                  name: settings.name,
                  dueAmount: settings.dueAmount.toString(),
                  isRegistrationOpen: settings.isRegistrationOpen
                }
              : null
          }
        />
      ) : (
        <Card className="bg-amber-50 border border-amber-200 text-center text-amber-800 text-sm font-medium italic">
          You do not have permission to update settings.
        </Card>
      )}
    </>
  );
}
