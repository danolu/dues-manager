"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { forgotPasswordSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<ForgotPasswordData>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordData) {
    setMessage(null);

    const response = await fetch("/api/auth/password/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    const payload = await response.json();

    if (!response.ok) {
      setError("root", { message: payload.error ?? "Unable to request reset link" });
      return;
    }

    setMessage(payload.message);
  }

  return (
    <form className="bg-card border border-line rounded-2xl p-8 shadow-xl" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-3xl font-extrabold mb-2 italic text-accent">Forgot Password</h1>
      <p className="text-text/60 text-sm mb-6 font-medium italic">Enter your email to receive a password reset link.</p>
      
      <div className="space-y-4">
        <div className="space-y-1">
          <input 
            className="w-full border border-line rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            type="email" 
            placeholder="example@email.com" 
            {...register("email")} 
          />
          {errors.email ? <p className="text-red-500 text-xs italic">{errors.email.message}</p> : null}
        </div>

        <Button 
          isLoading={isSubmitting} 
          type="submit"
          className="w-full"
        >
          Send Reset Link
        </Button>
      </div>

      {errors.root ? <p className="text-red-500 text-sm mt-4 text-center italic">{errors.root.message}</p> : null}
      {message ? <p className="text-green-600 text-sm mt-4 text-center font-bold italic">{message}</p> : null}

      <div className="mt-8 text-center">
        <a href="/login" className="text-xs font-bold text-accent hover:underline uppercase tracking-tight italic">
          Back to Login
        </a>
      </div>
    </form>
  );
}
