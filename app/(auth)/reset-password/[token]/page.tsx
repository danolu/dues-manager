import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ResetPasswordForm } from "@/components/reset-password-form";

export default async function ResetPasswordPage({
  params,
  searchParams
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const user = await getSessionUser();
  if (user) {
    redirect("/dashboard");
  }

  const { token } = await params;
  const { email } = await searchParams;

  if (!email) {
    return (
      <main>
        <div className="card">Missing email query parameter.</div>
      </main>
    );
  }

  return (
    <main>
      <ResetPasswordForm token={token} email={email} />
    </main>
  );
}
