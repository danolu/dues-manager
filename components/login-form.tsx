"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { loginSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormData) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      const payload = await response.json();
      setError("root", { message: payload.error ?? "Unable to sign in" });
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="bg-card border border-line rounded-xl p-8 mb-6 shadow-md max-w-md mx-auto" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-3xl font-bold mb-2">Login</h1>
      <p className="text-text/60 mb-6">Sign in with your existing Proxy credentials.</p>
      <div className="flex flex-col gap-4">
        <input 
          className="border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
          type="text" 
          placeholder="Email or User ID" 
          {...register("login")} 
        />
        <input 
          className="border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
          type="password" 
          placeholder="Password" 
          {...register("password")} 
        />
        <Button 
          isLoading={isSubmitting} 
          type="submit"
          className="w-full"
        >
          Login
        </Button>
      </div>
      {errors.login ? <p className="text-red-500 text-xs mt-1">{errors.login.message}</p> : null}
      {errors.password ? <p className="text-red-500 text-xs mt-1">{errors.password.message}</p> : null}
      {errors.root ? <p className="text-red-500 text-sm mt-4 text-center">{errors.root.message}</p> : null}
      <div className="flex justify-between mt-6 text-sm">
        <Link href="/forgot-password" title="Recover account" className="text-accent hover:underline">Forgot password?</Link>
        <Link href="/register" title="Create account" className="text-accent hover:underline">Register</Link>
      </div>
    </form>
  );
}
