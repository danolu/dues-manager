import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Navigation } from "@/components/navigation";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="max-w-5xl mx-auto p-6">
      <Navigation user={user} />
      {children}
    </main>
  );
}
