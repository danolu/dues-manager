"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { resetPasswordSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";

type Props = {
  token: string;
  email: string;
};

type ResetData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({ token, email }: Props) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<ResetData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      email,
      password: "",
      confirmPassword: ""
    }
  });

  async function onSubmit(values: ResetData) {
    const response = await fetch("/api/auth/password/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    const payload = await response.json();

    if (!response.ok) {
      setError("root", { message: payload.error ?? "Unable to reset password" });
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <form className="bg-card border border-line rounded-2xl p-8 shadow-xl" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-3xl font-extrabold mb-2 italic text-accent">Reset Password</h1>
      <p className="text-text/60 text-sm mb-6 italic font-medium">Account: <span className="text-text font-bold">{email}</span></p>
      
      <div className="space-y-4">
        <div className="space-y-1">
          <input 
            className="w-full border border-line rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            type="password" 
            placeholder="New password" 
            {...register("password")} 
          />
          {errors.password ? <p className="text-red-500 text-xs italic">{errors.password.message}</p> : null}
        </div>

        <div className="space-y-1">
          <input 
            className="w-full border border-line rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            type="password" 
            placeholder="Confirm password" 
            {...register("confirmPassword")} 
          />
          {errors.confirmPassword ? <p className="text-red-500 text-xs italic">{errors.confirmPassword.message}</p> : null}
        </div>

        <Button 
          isLoading={isSubmitting} 
          type="submit"
          className="w-full"
        >
          Reset Password
        </Button>
      </div>

      {errors.root ? <p className="text-red-500 text-sm mt-4 text-center italic font-bold">{errors.root.message}</p> : null}

      <div className="mt-8 text-center">
        <a href="/login" className="text-xs font-bold text-accent hover:underline uppercase tracking-tight italic">
          Back to Login
        </a>
      </div>
    </form>
  );
}
