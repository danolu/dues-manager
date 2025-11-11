"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { registerSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";

type RegisterData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      category: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      userId: 0
    }
  });

  async function onSubmit(values: RegisterData) {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    const payload = await response.json();
    if (!response.ok) {
      setError("root", { message: payload.error ?? "Unable to register" });
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <form className="bg-card border border-line rounded-xl p-8 mb-6 shadow-md max-w-xl mx-auto" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-3xl font-bold mb-6 text-center">Register</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input className="border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all" placeholder="Name" {...register("name")} />
        <input className="border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all" type="number" placeholder="User ID" {...register("userId", { valueAsNumber: true })} />
        <input className="border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all" placeholder="Category" {...register("category")} />
        <input className="border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all" placeholder="Phone" {...register("phone")} />
        <div className="md:col-span-2">
          <input className="w-full border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all" type="email" placeholder="Email" {...register("email")} />
        </div>
        <input className="border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all" type="password" placeholder="Password" {...register("password")} />
        <input className="border border-line rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all" type="password" placeholder="Confirm Password" {...register("confirmPassword")} />
      </div>
        <Button 
          isLoading={isSubmitting} 
          type="submit"
          className="w-full"
        >
          Register
        </Button>
      {errors.root ? <p className="text-red-500 text-sm mt-4 text-center">{errors.root.message}</p> : null}
      <div className="mt-4 text-sm space-y-1">
        {Object.values(errors)
          .filter((error) => error?.message && error !== errors.root)
          .map((error, index) => (
            <p key={index} className="text-red-500 text-xs">{error?.message}</p>
          ))}
      </div>
      <p className="mt-8 text-center text-text/60 text-sm">
        Already registered? <Link href="/login" className="text-accent hover:underline font-medium">Sign in</Link>
      </p>
    </form>
  );
}
