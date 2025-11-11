import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default async function ForgotPasswordPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main>
      <ForgotPasswordForm />
    </main>
  );
}
